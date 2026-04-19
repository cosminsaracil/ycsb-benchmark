import { exec } from "child_process";

const WORKLOADS = ["sql_w1", "sql_w2", "sql_w3", "sql_w4"];
const DATABASES = ["postgres", "mysql"];
const STEPS_PER_WORKLOAD = 2;
const PROGRESS_PER_DATABASE = 50;
const PROGRESS_PER_WORKLOAD = PROGRESS_PER_DATABASE / WORKLOADS.length;
const PROGRESS_PER_STEP = PROGRESS_PER_WORKLOAD / STEPS_PER_WORKLOAD;

function getDatabaseBaseProgress(database) {
  return database === "mysql" ? PROGRESS_PER_DATABASE : 0;
}

function getCompletedWorkloadCountForDatabase(database) {
  const prefix = `${database}-`;
  return sqlBenchmarkStatus.completedWorkloads.filter((workload) =>
    workload.startsWith(prefix),
  ).length;
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

function calculateProgress(database, workload, step) {
  const completedCount = getCompletedWorkloadCountForDatabase(database);
  const databaseBase = getDatabaseBaseProgress(database);
  const workloadIndex = getWorkloadIndex(workload);
  let progress = databaseBase + completedCount * PROGRESS_PER_WORKLOAD;

  if (workload) {
    const runningWorkloadIndex = Math.min(workloadIndex, WORKLOADS.length - 1);
    progress = databaseBase + runningWorkloadIndex * PROGRESS_PER_WORKLOAD;

    if (step === "Step 1/2") {
      progress += PROGRESS_PER_STEP;
    } else if (step === "Step 2/2") {
      progress += PROGRESS_PER_STEP * 2;
    } else if (step === "Completed") {
      progress += PROGRESS_PER_WORKLOAD;
    } else {
      progress += PROGRESS_PER_WORKLOAD * 0.15;
    }
  }

  return Math.min(Math.round(progress * 10) / 10, 100);
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
  let currentStep = null;

  benchmarkProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("SQL STDOUT:", output);

    if (output.includes("PHASE 1: PostgreSQL SQL Benchmarks")) {
      currentDatabase = "postgres";
      sqlBenchmarkStatus.currentDatabase = "PostgreSQL";
      sqlBenchmarkStatus.message = "Starting PostgreSQL SQL benchmarks...";
      sqlBenchmarkStatus.progress = 0;
    } else if (output.includes("PHASE 2: MySQL SQL Benchmarks")) {
      currentDatabase = "mysql";
      sqlBenchmarkStatus.currentDatabase = "MySQL";
      sqlBenchmarkStatus.message = "Starting MySQL SQL benchmarks...";
      sqlBenchmarkStatus.progress = 50;
    }

    const workloadMatch = output.match(/Running workload (sql_w[1-4])/i);
    if (workloadMatch) {
      currentWorkload = workloadMatch[1].toLowerCase();
      sqlBenchmarkStatus.currentWorkload = currentWorkload
        .toUpperCase()
        .replace("_", "-");
      currentStep = null;
      sqlBenchmarkStatus.currentStep = null;
      sqlBenchmarkStatus.message = `${sqlBenchmarkStatus.currentDatabase} - ${sqlBenchmarkStatus.currentWorkload}: starting workload...`;
    }

    if (output.includes("Step 1/2")) {
      currentStep = "Step 1/2";
      sqlBenchmarkStatus.currentStep = "Preparing schema";
      sqlBenchmarkStatus.message = `${sqlBenchmarkStatus.currentDatabase} - ${sqlBenchmarkStatus.currentWorkload}: Preparing schema and seed data...`;
    } else if (output.includes("Step 2/2")) {
      currentStep = "Step 2/2";
      sqlBenchmarkStatus.currentStep = "Running benchmark";
      sqlBenchmarkStatus.message = `${sqlBenchmarkStatus.currentDatabase} - ${sqlBenchmarkStatus.currentWorkload}: Running measured workload...`;
    }

    if (output.includes("completed successfully") && currentWorkload) {
      const completedKey = `${currentDatabase}-${currentWorkload}`;
      if (!sqlBenchmarkStatus.completedWorkloads.includes(completedKey)) {
        sqlBenchmarkStatus.completedWorkloads.push(completedKey);
      }
      sqlBenchmarkStatus.currentStep = "Completed";
      sqlBenchmarkStatus.message = `${sqlBenchmarkStatus.currentDatabase} - ${sqlBenchmarkStatus.currentWorkload}: completed successfully.`;
    }

    if (
      output.includes("SQL Benchmark Results Summary") ||
      output.includes("analyze_sql_results.py")
    ) {
      sqlBenchmarkStatus.progress = 95;
      sqlBenchmarkStatus.message =
        "Analyzing SQL results and generating summary...";
      sqlBenchmarkStatus.currentDatabase = null;
      sqlBenchmarkStatus.currentWorkload = null;
      sqlBenchmarkStatus.currentStep = "Analyzing";
    }

    if (currentDatabase && currentWorkload && currentStep) {
      const calculatedProgress = calculateProgress(
        currentDatabase,
        currentWorkload,
        currentStep,
      );
      sqlBenchmarkStatus.progress = calculatedProgress;
    } else if (currentDatabase) {
      sqlBenchmarkStatus.progress = getDatabaseBaseProgress(currentDatabase);
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
