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

// AI Summarization endpoint
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { results } = req.body;

    if (!results || !results.data || results.data.length === 0) {
      return res.status(400).json({ error: "No results provided" });
    }

    // Prepare data summary for the prompt
    const postgresResults = results.data.filter(
      (r) => r.database === "postgres",
    );
    const mysqlResults = results.data.filter((r) => r.database === "mysql");

    const calculateAvg = (arr, field) => {
      const values = arr
        .map((r) => parseFloat(r[field]))
        .filter((v) => !isNaN(v));
      return values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    };

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

    const prompt = `You are a database performance analyst. Based on the following SQL benchmark results, provide a concise, professional summary (2-3 paragraphs).

Benchmark Details:
- Workloads tested: ${summary.workloads.join(", ")}
- Databases compared: ${summary.databases.join(", ")}

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
2. Key findings and which database performed better overall
3. Why one database outperformed the other (based on throughput and latency metrics)
4. A brief conclusion

Keep it concise and technical.`;

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
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "http://localhost:3000",
              "X-OpenRouter-Title": "SQL Benchmark Analyzer",
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

        // Try next model for availability/rate-limiting/provider outages.
        if (status === 404 || status === 429 || status === 503) {
          continue;
        }

        throw apiError;
      }
    }

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

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
