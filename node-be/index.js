import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import csv from "csv-parser";
import morgan from "morgan";
import process from "process";
import { checkConnections } from "./utils/checkConnections.js";
import { cleanFloatValues } from "./utils/cleanFloatValues.js";
import {
  startBenchmark,
  getBenchmarkStatus,
} from "./services/benchmark.service.js";
import {
  startSqlBenchmark,
  getSqlBenchmarkStatus,
} from "./services/sql-benchmark.service.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

// Load CSV results
async function loadResults(resultsFile, benchmarkName) {
  if (!fs.existsSync(resultsFile)) {
    console.error("Results file not found:", resultsFile);
    throw new Error("Results file not found");
  }

  const data = [];
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(resultsFile)
        .pipe(csv())
        .on("data", (row) => data.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const cleanedData = cleanFloatValues(data);
    return {
      filename: path.basename(resultsFile),
      benchmark: benchmarkName,
      data: cleanedData,
    };
  } catch (err) {
    console.error(
      "Error reading file",
      path.basename(resultsFile),
      err.message,
    );
    throw err;
  }
}

async function loadYCSBResults() {
  const resultsFile = path.join(
    process.cwd(),
    "../results/benchmark_summary.csv",
  );

  return loadResults(resultsFile, "ycsb-Benchmark");
}

async function loadSqlResults() {
  const resultsFile = path.join(
    process.cwd(),
    "../results/sql_benchmark_summary.csv",
  );

  if (!fs.existsSync(resultsFile)) {
    return {
      filename: "sql_benchmark_summary.csv",
      benchmark: "sql-Benchmark",
      data: [],
    };
  }

  return loadResults(resultsFile, "sql-Benchmark");
}

// Routes
// GET /api/results
app.get("/api/results", async (req, res) => {
  try {
    const results = await loadYCSBResults();
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ detail: "Error accessing results" });
  }
});

// GET /api/sql/results
app.get("/api/sql/results", async (req, res) => {
  try {
    const results = await loadSqlResults();
    res.json(results);
  } catch (err) {
    console.error("Error fetching SQL results:", err);
    res.status(500).json({ detail: "Error accessing SQL results" });
  }
});

// GET /api/benchmark/status
app.get("/api/benchmark/status", (req, res) => {
  const status = getBenchmarkStatus();
  res.json(status);
});

// POST /api/benchmark/start
app.post("/api/benchmark/start", async (req, res) => {
  try {
    const status = startBenchmark();
    res.json({
      message: "Benchmark started successfully",
      status: status,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/sql/benchmark/status
app.get("/api/sql/benchmark/status", (req, res) => {
  const status = getSqlBenchmarkStatus();
  res.json(status);
});

// POST /api/sql/benchmark/start
app.post("/api/sql/benchmark/start", async (req, res) => {
  try {
    const status = startSqlBenchmark();
    res.json({
      message: "SQL benchmark started successfully",
      status: status,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clients connections
app.get("/api/check-connection", checkConnections);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
