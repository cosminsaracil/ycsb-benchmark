import { exec } from "child_process";

const WORKLOADS = ["sql_w1", "sql_w2", "sql_w3", "sql_w4"];
const PROGRESS_PER_DATABASE = 50;
const PROGRESS_PER_WORKLOAD = PROGRESS_PER_DATABASE / WORKLOADS.length;

function getDatabaseBaseProgress(database) {
  return database === "mysql" ? PROGRESS_PER_DATABASE : 0;
}

function getWorkloadIndex(workload) {
  const index = WORKLOADS.indexOf(workload?.toLowerCase());
  return index >= 0 ? index : 0;
}

let sqlBenchmarkStatus = {
  isRunning: false,
  progress: 0,
  currentDatabase: null,
  currentWorkload: null,
  currentStep: null,
  message: "",
  startTime: null,
  completedWorkloads: [],
};

// The SQL shell script redirects the per-workload Python output to files, so
// the only signals the parent sees are "Running workload sql_wN" (start) and
// "completed successfully" / "completed with warnings" (end). Progress is
// computed from those two events — no Step 1/2 markers are visible here.
function calculateWorkloadProgress(database, workload, phase) {
  const base = getDatabaseBaseProgress(database);
  const idx = getWorkloadIndex(workload);
  const offset =
    phase === "completed"
      ? (idx + 1) * PROGRESS_PER_WORKLOAD
      : (idx + 0.5) * PROGRESS_PER_WORKLOAD; // mid-slot while running
  return Math.min(Math.round((base + offset) * 10) / 10, 100);
}

function runSqlBenchmark() {
  const command =
    'docker-compose exec -T ycsb bash -c "cd /ycsb && ./scripts/run_sql_benchmarks.sh && python3 scripts/analyze_sql_results.py"';

  console.log("Executing SQL benchmark command:", command);

  const benchmarkProcess = exec(command, {
    maxBuffer: 10 * 1024 * 1024,
  });

  let currentDatabase = null;
  let currentWorkload = null;

  benchmarkProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("SQL STDOUT:", output);

    if (output.includes("PHASE 1: PostgreSQL SQL Benchmarks")) {
      currentDatabase = "postgres";
      currentWorkload = null;
      sqlBenchmarkStatus.currentDatabase = "PostgreSQL";
      sqlBenchmarkStatus.currentWorkload = null;
      sqlBenchmarkStatus.currentStep = "Initializing";
      sqlBenchmarkStatus.message = "Starting PostgreSQL SQL benchmarks...";
      sqlBenchmarkStatus.progress = 0;
    } else if (output.includes("PHASE 2: MySQL SQL Benchmarks")) {
      currentDatabase = "mysql";
      currentWorkload = null;
      sqlBenchmarkStatus.currentDatabase = "MySQL";
      sqlBenchmarkStatus.currentWorkload = null;
      sqlBenchmarkStatus.currentStep = "Initializing";
      sqlBenchmarkStatus.message = "Starting MySQL SQL benchmarks...";
      sqlBenchmarkStatus.progress = PROGRESS_PER_DATABASE;
    }

    const workloadMatch = output.match(/Running workload (sql_w[1-4])/i);
    if (workloadMatch && currentDatabase) {
      currentWorkload = workloadMatch[1].toLowerCase();
      sqlBenchmarkStatus.currentWorkload = currentWorkload
        .toUpperCase()
        .replace("_", "-");
      sqlBenchmarkStatus.currentStep = "Running";
      sqlBenchmarkStatus.message = `${sqlBenchmarkStatus.currentDatabase} - ${sqlBenchmarkStatus.currentWorkload}: running workload...`;
      sqlBenchmarkStatus.progress = calculateWorkloadProgress(
        currentDatabase,
        currentWorkload,
        "running",
      );
    }

    const completedMatch =
      output.includes("completed successfully") ||
      output.includes("completed with warnings");
    if (completedMatch && currentDatabase && currentWorkload) {
      const completedKey = `${currentDatabase}-${currentWorkload}`;
      if (!sqlBenchmarkStatus.completedWorkloads.includes(completedKey)) {
        sqlBenchmarkStatus.completedWorkloads.push(completedKey);
      }
      sqlBenchmarkStatus.currentStep = "Completed";
      sqlBenchmarkStatus.message = `${sqlBenchmarkStatus.currentDatabase} - ${sqlBenchmarkStatus.currentWorkload}: ${
        output.includes("with warnings")
          ? "completed with warnings"
          : "completed successfully"
      }.`;
      sqlBenchmarkStatus.progress = calculateWorkloadProgress(
        currentDatabase,
        currentWorkload,
        "completed",
      );
    }

    if (
      output.includes("SQL Benchmark Results Summary") ||
      output.includes("analyze_sql_results.py")
    ) {
      sqlBenchmarkStatus.progress = Math.max(sqlBenchmarkStatus.progress, 97);
      sqlBenchmarkStatus.message =
        "Analyzing SQL results and generating summary...";
      sqlBenchmarkStatus.currentDatabase = null;
      sqlBenchmarkStatus.currentWorkload = null;
      sqlBenchmarkStatus.currentStep = "Analyzing";
    }
  });

  benchmarkProcess.stderr.on("data", (data) => {
    console.error("SQL STDERR:", data.toString());
  });

  benchmarkProcess.on("close", (code) => {
    if (code === 0) {
      sqlBenchmarkStatus = {
        isRunning: false,
        progress: 100,
        currentDatabase: null,
        currentWorkload: "Completed",
        currentStep: null,
        message:
          "All SQL benchmarks completed successfully! Results are ready.",
        startTime: sqlBenchmarkStatus.startTime,
        completedWorkloads: sqlBenchmarkStatus.completedWorkloads,
      };
      console.log("SQL benchmark completed successfully");
    } else {
      sqlBenchmarkStatus = {
        isRunning: false,
        progress: sqlBenchmarkStatus.progress,
        currentDatabase: sqlBenchmarkStatus.currentDatabase,
        currentWorkload: "Failed",
        currentStep: null,
        message: `SQL benchmark failed with exit code ${code}`,
        startTime: sqlBenchmarkStatus.startTime,
        completedWorkloads: sqlBenchmarkStatus.completedWorkloads,
      };
      console.error(`SQL benchmark failed with code ${code}`);
    }
  });

  benchmarkProcess.on("error", (error) => {
    sqlBenchmarkStatus = {
      isRunning: false,
      progress: 0,
      currentDatabase: null,
      currentWorkload: "Error",
      currentStep: null,
      message: `Error: ${error.message}`,
      startTime: sqlBenchmarkStatus.startTime,
      completedWorkloads: [],
    };
    console.error("SQL benchmark error:", error);
  });
}

export function startSqlBenchmark() {
  if (sqlBenchmarkStatus.isRunning) {
    throw new Error("SQL benchmark is already running");
  }

  sqlBenchmarkStatus = {
    isRunning: true,
    progress: 0,
    currentDatabase: null,
    currentWorkload: null,
    currentStep: null,
    message: "Initializing SQL benchmark suite...",
    startTime: new Date().toISOString(),
    completedWorkloads: [],
  };

  runSqlBenchmark();
  return sqlBenchmarkStatus;
}

export function getSqlBenchmarkStatus() {
  return sqlBenchmarkStatus;
}
