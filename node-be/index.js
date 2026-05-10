import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import csv from "csv-parser";
import morgan from "morgan";
import process from "process";
import axios from "axios";
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

const RESULTS_ROOT = path.resolve(process.cwd(), "../results");
const RUN_ID_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/;

const MODULE_CONFIG = {
  ycsb: {
    flatCsv: path.join(RESULTS_ROOT, "benchmark_summary.csv"),
    benchmarkName: "ycsb-Benchmark",
    runsDir: path.join(RESULTS_ROOT, "runs", "ycsb"),
  },
  sql: {
    flatCsv: path.join(RESULTS_ROOT, "sql_benchmark_summary.csv"),
    benchmarkName: "sql-Benchmark",
    runsDir: path.join(RESULTS_ROOT, "runs", "sql"),
  },
};

function isValidRunId(runId) {
  return typeof runId === "string" && RUN_ID_PATTERN.test(runId);
}

function getRunSummaryPath(moduleKey, runId) {
  const cfg = MODULE_CONFIG[moduleKey];
  if (!cfg) return null;
  if (!isValidRunId(runId)) return null;
  return path.join(cfg.runsDir, runId, "summary.csv");
}

function listRuns(moduleKey) {
  const cfg = MODULE_CONFIG[moduleKey];
  if (!cfg) return [];
  if (!fs.existsSync(cfg.runsDir)) return [];

  const entries = fs.readdirSync(cfg.runsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && RUN_ID_PATTERN.test(e.name))
    .map((e) => {
      const summary = path.join(cfg.runsDir, e.name, "summary.csv");
      const stat = fs.existsSync(summary) ? fs.statSync(summary) : null;
      // Convert "YYYY-MM-DDTHH-MM-SS" → "YYYY-MM-DDTHH:MM:SS" for ISO output
      const isoTimestamp = e.name.replace(
        /T(\d{2})-(\d{2})-(\d{2})$/,
        "T$1:$2:$3",
      );
      return {
        id: e.name,
        timestamp: isoTimestamp,
        hasSummary: !!stat,
        sizeBytes: stat?.size ?? 0,
      };
    })
    .sort((a, b) => (a.id < b.id ? 1 : -1)); // newest first
}

async function loadModuleResults(moduleKey, runId) {
  const cfg = MODULE_CONFIG[moduleKey];
  if (!cfg) throw new Error(`Unknown module: ${moduleKey}`);

  let resultsFile;
  if (runId) {
    resultsFile = getRunSummaryPath(moduleKey, runId);
    if (!resultsFile || !fs.existsSync(resultsFile)) {
      const err = new Error(`Run not found: ${runId}`);
      err.statusCode = 404;
      throw err;
    }
  } else {
    resultsFile = cfg.flatCsv;
    if (!fs.existsSync(resultsFile)) {
      return {
        filename: path.basename(cfg.flatCsv),
        benchmark: cfg.benchmarkName,
        data: [],
      };
    }
  }

  return loadResults(resultsFile, cfg.benchmarkName);
}

// Routes
// GET /api/results?runId=<id>
app.get("/api/results", async (req, res) => {
  try {
    const runId = req.query.runId ? String(req.query.runId) : null;
    if (runId && !isValidRunId(runId)) {
      return res.status(400).json({ detail: "Invalid runId format" });
    }
    const results = await loadModuleResults("ycsb", runId);
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res
      .status(err.statusCode ?? 500)
      .json({ detail: err.message || "Error accessing results" });
  }
});

// GET /api/sql/results?runId=<id>
app.get("/api/sql/results", async (req, res) => {
  try {
    const runId = req.query.runId ? String(req.query.runId) : null;
    if (runId && !isValidRunId(runId)) {
      return res.status(400).json({ detail: "Invalid runId format" });
    }
    const results = await loadModuleResults("sql", runId);
    res.json(results);
  } catch (err) {
    console.error("Error fetching SQL results:", err);
    res
      .status(err.statusCode ?? 500)
      .json({ detail: err.message || "Error accessing SQL results" });
  }
});

// GET /api/runs?module=ycsb|sql
app.get("/api/runs", (req, res) => {
  const moduleKey = String(req.query.module || "");
  if (!MODULE_CONFIG[moduleKey]) {
    return res
      .status(400)
      .json({ detail: "module query param must be 'ycsb' or 'sql'" });
  }
  res.json({ module: moduleKey, runs: listRuns(moduleKey) });
});

// DELETE /api/runs/:module/:runId
app.delete("/api/runs/:module/:runId", (req, res) => {
  const { module: moduleKey, runId } = req.params;
  if (!MODULE_CONFIG[moduleKey]) {
    return res.status(400).json({ detail: "Unknown module" });
  }
  if (!isValidRunId(runId)) {
    return res.status(400).json({ detail: "Invalid runId format" });
  }
  const runDir = path.join(MODULE_CONFIG[moduleKey].runsDir, runId);
  if (!fs.existsSync(runDir)) {
    return res.status(404).json({ detail: "Run not found" });
  }
  try {
    fs.rmSync(runDir, { recursive: true, force: true });
    res.json({ success: true, deleted: runId });
  } catch (err) {
    console.error("Error deleting run:", err);
    res.status(500).json({ detail: err.message || "Failed to delete run" });
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

async function callOpenRouter(prompt, title) {
  const preferredModels = process.env.OPENROUTER_MODELS
    ? process.env.OPENROUTER_MODELS.split(",")
        .map((model) => model.trim())
        .filter(Boolean)
    : [
        "openrouter/auto",
        "meta-llama/llama-3.1-8b-instruct",
        "google/gemma-2-9b-it",
        "qwen/qwen-2.5-7b-instruct",
      ];

  let aiSummary = null;
  let usedModel = null;
  let lastApiError = null;

  for (const model of preferredModels) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-OpenRouter-Title": title,
          },
        },
      );

      aiSummary = response.data?.choices?.[0]?.message?.content ?? null;
      usedModel = model;

      if (aiSummary) {
        break;
      }

      lastApiError = `${model}: Empty completion content`;
    } catch (apiError) {
      const status = apiError.response?.status;
      const detail =
        apiError.response?.data?.error?.message || apiError.message;
      lastApiError = `${model}: ${detail}`;

      if (status === 404 || status === 429 || status === 503) {
        continue;
      }

      throw apiError;
    }
  }

  return { aiSummary, usedModel, lastApiError };
}

const calculateAvg = (arr, field) => {
  const values = arr
    .map((r) => parseFloat(r[field]))
    .filter((v) => !isNaN(v));
  return values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;
};

// AI Summarization endpoint (SQL)
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { results } = req.body;

    if (!results || !results.data || results.data.length === 0) {
      return res.status(400).json({ error: "No results provided" });
    }

    const postgresResults = results.data.filter(
      (r) => r.database === "postgres",
    );
    const mysqlResults = results.data.filter((r) => r.database === "mysql");

    const summary = {
      benchmark: "SQL Benchmark - PostgreSQL vs MySQL",
      workloads: Array.from(new Set(results.data.map((r) => r.workload))),
      databases: Array.from(new Set(results.data.map((r) => r.database))),
      postgres: {
        avgThroughput: calculateAvg(postgresResults, "throughput_ops_sec"),
        avgLatency: calculateAvg(postgresResults, "avg_latency_us"),
        p95Latency: calculateAvg(postgresResults, "p95_latency_us"),
        p99Latency: calculateAvg(postgresResults, "p99_latency_us"),
      },
      mysql: {
        avgThroughput: calculateAvg(mysqlResults, "throughput_ops_sec"),
        avgLatency: calculateAvg(mysqlResults, "avg_latency_us"),
        p95Latency: calculateAvg(mysqlResults, "p95_latency_us"),
        p99Latency: calculateAvg(mysqlResults, "p99_latency_us"),
      },
    };

    const throughputLeader =
      summary.postgres.avgThroughput >= summary.mysql.avgThroughput
        ? "PostgreSQL"
        : "MySQL";
    const latencyLeader =
      summary.postgres.avgLatency <= summary.mysql.avgLatency
        ? "PostgreSQL"
        : "MySQL";
    const overallLeader =
      throughputLeader === latencyLeader ? throughputLeader : "mixed";

    const prompt = `You are a database performance analyst. Based on the following SQL benchmark results, provide a concise, professional summary (2-3 paragraphs).

Benchmark Details:
- Workloads tested: ${summary.workloads.join(", ")}
- Databases compared: ${summary.databases.join(", ")}
- Throughput leader: ${throughputLeader}
- Latency leader: ${latencyLeader}
- Overall leader: ${overallLeader}

PostgreSQL Performance:
- Average Throughput: ${summary.postgres.avgThroughput.toFixed(2)} ops/sec
- Average Latency: ${summary.postgres.avgLatency.toFixed(2)} μs
- P95 Latency: ${summary.postgres.p95Latency.toFixed(2)} μs
- P99 Latency: ${summary.postgres.p99Latency.toFixed(2)} μs

MySQL Performance:
- Average Throughput: ${summary.mysql.avgThroughput.toFixed(2)} ops/sec
- Average Latency: ${summary.mysql.avgLatency.toFixed(2)} μs
- P95 Latency: ${summary.mysql.p95Latency.toFixed(2)} μs
- P99 Latency: ${summary.mysql.p99Latency.toFixed(2)} μs

Please provide:
1. What the benchmark was about
2. Which database won overall and why it won
3. The winner's practical advantages, such as higher throughput, lower average latency, and better tail latency consistency
4. Any notable trade-offs or cases where the loser may still be acceptable
5. A brief conclusion

Important: explicitly explain why the winner is better using the measured metrics, not generic database facts. Focus on the observed benchmark results, especially throughput, average latency, P95, and P99 latency.

Keep it concise and technical.`;

    const { aiSummary, usedModel, lastApiError } = await callOpenRouter(
      prompt,
      "SQL Benchmark Analyzer",
    );

    if (!aiSummary) {
      return res.status(502).json({
        error: "Failed to generate AI summary",
        details:
          lastApiError ||
          "No available OpenRouter model endpoint could generate a summary.",
      });
    }

    res.json({
      success: true,
      summary: aiSummary,
      model: usedModel,
      dataUsed: summary,
    });
  } catch (error) {
    console.error("Error generating AI summary:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    res.status(500).json({
      error: "Failed to generate AI summary",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// AI Summarization endpoint (YCSB - Redis vs MongoDB)
app.post("/api/ai/summarize-ycsb", async (req, res) => {
  try {
    const { results } = req.body;

    if (!results || !results.data || results.data.length === 0) {
      return res.status(400).json({ error: "No results provided" });
    }

    const redisResults = results.data.filter((r) => r.database === "redis");
    const mongoResults = results.data.filter((r) => r.database === "mongodb");

    const buildStats = (arr) => ({
      avgThroughput: calculateAvg(arr, "throughput"),
      avgReadLatency: calculateAvg(arr, "read_avg"),
      p95ReadLatency: calculateAvg(arr, "read_95th"),
      p99ReadLatency: calculateAvg(arr, "read_99th"),
      avgUpdateLatency: calculateAvg(arr, "update_avg"),
      p95UpdateLatency: calculateAvg(arr, "update_95th"),
      p99UpdateLatency: calculateAvg(arr, "update_99th"),
      avgInsertLatency: calculateAvg(arr, "insert_avg"),
      avgScanLatency: calculateAvg(arr, "scan_avg"),
    });

    const summary = {
      benchmark: "YCSB Benchmark - Redis vs MongoDB",
      workloads: Array.from(new Set(results.data.map((r) => r.workload))),
      databases: Array.from(new Set(results.data.map((r) => r.database))),
      redis: buildStats(redisResults),
      mongodb: buildStats(mongoResults),
    };

    const throughputLeader =
      summary.redis.avgThroughput >= summary.mongodb.avgThroughput
        ? "Redis"
        : "MongoDB";
    const readLatencyLeader =
      summary.redis.avgReadLatency <= summary.mongodb.avgReadLatency
        ? "Redis"
        : "MongoDB";
    const overallLeader =
      throughputLeader === readLatencyLeader ? throughputLeader : "mixed";

    const prompt = `You are a database performance analyst. Based on the following YCSB benchmark results, provide a concise, professional summary (2-3 paragraphs).

Benchmark Details:
- Workloads tested: ${summary.workloads.join(", ")} (YCSB workloads A-F: A=50/50 read/update, B=95/5 read/update, C=read-only, D=read-latest with inserts, E=short-range scans with inserts, F=read-modify-write)
- Databases compared: Redis (in-memory key-value) vs MongoDB (document store)
- Throughput leader: ${throughputLeader}
- Read latency leader: ${readLatencyLeader}
- Overall leader: ${overallLeader}

Redis Performance:
- Average Throughput: ${summary.redis.avgThroughput.toFixed(2)} ops/sec
- Average Read Latency: ${summary.redis.avgReadLatency.toFixed(2)} μs
- P95 Read Latency: ${summary.redis.p95ReadLatency.toFixed(2)} μs
- P99 Read Latency: ${summary.redis.p99ReadLatency.toFixed(2)} μs
- Average Update Latency: ${summary.redis.avgUpdateLatency.toFixed(2)} μs
- P95 Update Latency: ${summary.redis.p95UpdateLatency.toFixed(2)} μs
- P99 Update Latency: ${summary.redis.p99UpdateLatency.toFixed(2)} μs

MongoDB Performance:
- Average Throughput: ${summary.mongodb.avgThroughput.toFixed(2)} ops/sec
- Average Read Latency: ${summary.mongodb.avgReadLatency.toFixed(2)} μs
- P95 Read Latency: ${summary.mongodb.p95ReadLatency.toFixed(2)} μs
- P99 Read Latency: ${summary.mongodb.p99ReadLatency.toFixed(2)} μs
- Average Update Latency: ${summary.mongodb.avgUpdateLatency.toFixed(2)} μs
- P95 Update Latency: ${summary.mongodb.p95UpdateLatency.toFixed(2)} μs
- P99 Update Latency: ${summary.mongodb.p99UpdateLatency.toFixed(2)} μs

Please provide:
1. What the YCSB benchmark was about and which workload patterns were tested
2. Which database won overall and why it won
3. The winner's practical advantages, such as higher throughput, lower average latency, and better tail latency consistency
4. Any notable trade-offs or workloads where the loser may still be acceptable (e.g., scan-heavy workload E)
5. A brief conclusion

Important: explicitly explain why the winner is better using the measured metrics, not generic database facts. Focus on the observed benchmark results, especially throughput, average latency, P95, and P99 latency.

Keep it concise and technical.`;

    const { aiSummary, usedModel, lastApiError } = await callOpenRouter(
      prompt,
      "YCSB Benchmark Analyzer",
    );

    if (!aiSummary) {
      return res.status(502).json({
        error: "Failed to generate AI summary",
        details:
          lastApiError ||
          "No available OpenRouter model endpoint could generate a summary.",
      });
    }

    res.json({
      success: true,
      summary: aiSummary,
      model: usedModel,
      dataUsed: summary,
    });
  } catch (error) {
    console.error("Error generating YCSB AI summary:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    res.status(500).json({
      error: "Failed to generate AI summary",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
