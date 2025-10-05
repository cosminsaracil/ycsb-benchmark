import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import csv from "csv-parser";
import morgan from "morgan";
import process from "process";

// load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

// Utility: clean float values (similar to Python clean_float_values)
const cleanFloatValues = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(cleanFloatValues);
  } else if (typeof obj === "object" && obj !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanFloatValues(value);
    }
    return cleaned;
  } else if (typeof obj === "number") {
    if (isNaN(obj) || !isFinite(obj)) return null;
    return obj;
  }
  return obj;
};

// Load CSV results
async function loadResults() {
  const resultsFile = path.join(
    process.cwd(),
    "../results/benchmark_summary.csv"
  );

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

    return [
      {
        filename: "benchmark_summary.csv",
        benchmark: "ycsb-Benchmark",
        data: cleanedData,
      },
    ];
  } catch (err) {
    console.error(`Error reading file benchmark_summary.csv:`, err.message);
    throw err;
  }
}

// Routes

// ✅ Debug route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ! YCSB Benchmark

// GET /api/results
app.get("/api/results", async (req, res) => {
  const dbType = req.query.db_type || null;
  try {
    const results = await loadResults();
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ detail: "Error accessing results" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
