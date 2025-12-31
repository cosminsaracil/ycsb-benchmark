import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import csv from "csv-parser";
import morgan from "morgan";
import process from "process";
import { exec } from "child_process";
import { checkConnections } from "./clients/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

// Track benchmark status
let benchmarkStatus = {
  isRunning: false,
  progress: 0,
  currentWorkload: null,
  message: "",
  startTime: null,
};

// Utility: clean float values
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

    return {
      filename: "benchmark_summary.csv",
      benchmark: "ycsb-Benchmark",
      data: cleanedData,
    };
  } catch (err) {
    console.error(`Error reading file benchmark_summary.csv:`, err.message);
    throw err;
  }
}

// Routes

// GET /api/results
app.get("/api/results", async (req, res) => {
  try {
    const results = await loadResults();
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ detail: "Error accessing results" });
  }
});

// GET /api/benchmark/status
app.get("/api/benchmark/status", (req, res) => {
  res.json(benchmarkStatus);
});

// POST /api/benchmark/start
app.post("/api/benchmark/start", async (req, res) => {
  if (benchmarkStatus.isRunning) {
    return res.status(400).json({
      error: "Benchmark is already running",
    });
  }

  benchmarkStatus = {
    isRunning: true,
    progress: 0,
    currentWorkload: "Initializing...",
    message: "Starting benchmark...",
    startTime: new Date().toISOString(),
  };

  res.json({
    message: "Benchmark started successfully",
    status: benchmarkStatus,
  });

  // Run benchmark in background
  runBenchmark();
});

// Function to run the benchmark
function runBenchmark() {
  const command = `docker-compose exec -T ycsb bash -c "cd /ycsb && ./scripts/run_all_benchmarks.sh && python3 scripts/analyze_results.py"`;

  console.log("Executing benchmark command:", command);

  const benchmarkProcess = exec(command, {
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
  });

  // Update progress based on output
  let outputBuffer = "";

  benchmarkProcess.stdout.on("data", (data) => {
    outputBuffer += data.toString();
    console.log("STDOUT:", data.toString());

    // Parse output for progress (customize based on your script output)
    if (data.toString().includes("workload")) {
      const match = data.toString().match(/workload[a-z]/i);
      if (match) {
        benchmarkStatus.currentWorkload = match[0];
      }
    }

    // Estimate progress (customize this logic based on your workflow)
    if (data.toString().includes("Loading")) {
      benchmarkStatus.progress = 20;
      benchmarkStatus.message = "Loading data...";
    } else if (data.toString().includes("Running")) {
      benchmarkStatus.progress = 50;
      benchmarkStatus.message = "Running workloads...";
    } else if (data.toString().includes("analyze")) {
      benchmarkStatus.progress = 90;
      benchmarkStatus.message = "Analyzing results...";
    }
  });

  benchmarkProcess.stderr.on("data", (data) => {
    console.error("STDERR:", data.toString());
  });

  benchmarkProcess.on("close", (code) => {
    if (code === 0) {
      benchmarkStatus = {
        isRunning: false,
        progress: 100,
        currentWorkload: "Completed",
        message: "Benchmark completed successfully",
        startTime: benchmarkStatus.startTime,
      };
      console.log("Benchmark completed successfully");
    } else {
      benchmarkStatus = {
        isRunning: false,
        progress: 0,
        currentWorkload: "Failed",
        message: `Benchmark failed with code ${code}`,
        startTime: benchmarkStatus.startTime,
      };
      console.error(`Benchmark failed with code ${code}`);
    }
  });

  benchmarkProcess.on("error", (error) => {
    benchmarkStatus = {
      isRunning: false,
      progress: 0,
      currentWorkload: "Error",
      message: `Error: ${error.message}`,
      startTime: benchmarkStatus.startTime,
    };
    console.error("Benchmark error:", error);
  });
}

// Clients connections
app.get("/api/check-connection", checkConnections);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
