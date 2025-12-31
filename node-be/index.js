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

// Benchmark configuration
const WORKLOADS = ["a", "b", "c", "d", "e", "f"];
const DATABASES = ["redis", "mongodb"];
const STEPS_PER_WORKLOAD = 3;

// Calculate progress weights
const TOTAL_WORKLOADS = WORKLOADS.length * DATABASES.length; // 12 workloads total
const PROGRESS_PER_DATABASE = 50; // Redis: 50%, MongoDB: 50%
const PROGRESS_PER_WORKLOAD = PROGRESS_PER_DATABASE / WORKLOADS.length; // ~8.33% per workload
const PROGRESS_PER_STEP = PROGRESS_PER_WORKLOAD / STEPS_PER_WORKLOAD; // ~2.78% per step

// Track benchmark status
let benchmarkStatus = {
  isRunning: false,
  progress: 0,
  currentDatabase: null,
  currentWorkload: null,
  currentStep: null,
  message: "",
  startTime: null,
  completedWorkloads: [],
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

// Calculate precise progress
function calculateProgress(database, workload, step) {
  let progress = 0;

  // Base progress for completed databases
  if (database === "mongodb") {
    progress += PROGRESS_PER_DATABASE; // Redis completed
  }

  // Progress for completed workloads in current database
  const workloadIndex = WORKLOADS.indexOf(workload.toLowerCase());
  if (workloadIndex > 0) {
    progress += workloadIndex * PROGRESS_PER_WORKLOAD;
  }

  // Progress for current workload steps
  const stepMatch = step?.match(/Step (\d+)\/3/);
  if (stepMatch) {
    const currentStep = parseInt(stepMatch[1]);
    progress += (currentStep - 1) * PROGRESS_PER_STEP;
  }

  return Math.min(Math.round(progress * 10) / 10, 100); // Round to 1 decimal, max 100
}

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
    currentDatabase: null,
    currentWorkload: null,
    currentStep: null,
    message: "Initializing benchmark suite...",
    startTime: new Date().toISOString(),
    completedWorkloads: [],
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

  let currentDatabase = null;
  let currentWorkload = null;
  let currentStep = null;

  benchmarkProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("STDOUT:", output);

    // Detect database phase
    if (output.includes("PHASE 1: Redis Benchmarks")) {
      currentDatabase = "redis";
      benchmarkStatus.currentDatabase = "Redis";
      benchmarkStatus.message = "Starting Redis benchmarks...";
      benchmarkStatus.progress = 0;
    } else if (output.includes("PHASE 2: MongoDB Benchmarks")) {
      currentDatabase = "mongodb";
      benchmarkStatus.currentDatabase = "MongoDB";
      benchmarkStatus.message = "Starting MongoDB benchmarks...";
      benchmarkStatus.progress = 50;
    }

    // Detect workload
    const workloadMatch = output.match(/Running workload ([a-f])/i);
    if (workloadMatch) {
      currentWorkload = workloadMatch[1].toLowerCase();
      benchmarkStatus.currentWorkload = `Workload ${currentWorkload.toUpperCase()}`;
    }

    // Detect steps
    if (output.includes("Step 1/3")) {
      currentStep = "Step 1/3";
      benchmarkStatus.currentStep = "Resetting database";
      benchmarkStatus.message = `${
        benchmarkStatus.currentDatabase
      } - Workload ${currentWorkload?.toUpperCase()}: Resetting database...`;
    } else if (output.includes("Step 2/3")) {
      currentStep = "Step 2/3";
      benchmarkStatus.currentStep = "Loading data";
      benchmarkStatus.message = `${
        benchmarkStatus.currentDatabase
      } - Workload ${currentWorkload?.toUpperCase()}: Loading initial dataset...`;
    } else if (output.includes("Step 3/3")) {
      currentStep = "Step 3/3";
      benchmarkStatus.currentStep = "Running workload";
      benchmarkStatus.message = `${
        benchmarkStatus.currentDatabase
      } - Workload ${currentWorkload?.toUpperCase()}: Running measured workload...`;
    }

    // Detect workload completion
    if (output.includes("completed successfully") && currentWorkload) {
      const completedKey = `${currentDatabase}-${currentWorkload}`;
      if (!benchmarkStatus.completedWorkloads.includes(completedKey)) {
        benchmarkStatus.completedWorkloads.push(completedKey);
      }
    }

    // Detect analysis phase
    if (
      output.includes("YCSB Workload Descriptions") ||
      output.includes("analyze_results.py")
    ) {
      benchmarkStatus.progress = 95;
      benchmarkStatus.message = "Analyzing results and generating reports...";
      benchmarkStatus.currentDatabase = null;
      benchmarkStatus.currentWorkload = null;
      benchmarkStatus.currentStep = "Analyzing";
    }

    // Update progress calculation
    if (currentDatabase && currentWorkload && currentStep) {
      const calculatedProgress = calculateProgress(
        currentDatabase,
        currentWorkload,
        currentStep
      );
      benchmarkStatus.progress = calculatedProgress;
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
        currentDatabase: null,
        currentWorkload: "Completed",
        currentStep: null,
        message: "All benchmarks completed successfully! Results are ready.",
        startTime: benchmarkStatus.startTime,
        completedWorkloads: benchmarkStatus.completedWorkloads,
      };
      console.log("Benchmark completed successfully");
    } else {
      benchmarkStatus = {
        isRunning: false,
        progress: benchmarkStatus.progress,
        currentDatabase: benchmarkStatus.currentDatabase,
        currentWorkload: "Failed",
        currentStep: null,
        message: `Benchmark failed with exit code ${code}`,
        startTime: benchmarkStatus.startTime,
        completedWorkloads: benchmarkStatus.completedWorkloads,
      };
      console.error(`Benchmark failed with code ${code}`);
    }
  });

  benchmarkProcess.on("error", (error) => {
    benchmarkStatus = {
      isRunning: false,
      progress: 0,
      currentDatabase: null,
      currentWorkload: "Error",
      currentStep: null,
      message: `Error: ${error.message}`,
      startTime: benchmarkStatus.startTime,
      completedWorkloads: [],
    };
    console.error("Benchmark error:", error);
  });
}

// Clients connections
app.get("/api/check-connection", checkConnections);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
