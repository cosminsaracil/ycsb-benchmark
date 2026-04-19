import { useState, useCallback } from "react";

const CACHED_SQL_SUMMARY = `This benchmark evaluated the performance of PostgreSQL and MySQL across four distinct SQL workloads (SQL-W1, SQL-W2, SQL-W3, SQL-W4). The primary metrics analyzed were average throughput (operations per second) and average, P95, and P99 latency (microseconds).

PostgreSQL demonstrated significantly superior performance compared to MySQL. It achieved an average throughput of 2369.15 ops/sec, which is approximately 4.4 times higher than MySQL's 537.19 ops/sec. This substantial difference in throughput is directly reflected in latency metrics, where PostgreSQL's average latency was 6730.05 μs, considerably lower than MySQL's 32917.70 μs. The lower tail latencies for PostgreSQL (P95: 13229.78 μs, P99: 16940.90 μs) also indicate a more consistent and predictable user experience under load, as these are substantially better than MySQL's P95 (74301.78 μs) and P99 (91167.77 μs).

In conclusion, PostgreSQL outperformed MySQL across all measured performance indicators. The higher throughput and lower latency observed for PostgreSQL suggest a more efficient query execution and resource utilization, making it the preferred choice for these particular SQL workloads based on this benchmark.`;

interface AISummaryResponse {
  success: boolean;
  summary: string;
  dataUsed: {
    benchmark: string;
    workloads: string[];
    databases: string[];
    postgres: {
      avgThroughput: number;
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
    };
    mysql: {
      avgThroughput: number;
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
    };
  };
}

export const useAISummary = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const generateSummary = useCallback(async (results: any) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setIsFromCache(false);

    try {
      const response = await fetch("http://localhost:8000/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to generate summary",
        );
      }

      const data: AISummaryResponse = await response.json();
      setSummary(data.summary);
      setIsFromCache(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setSummary(CACHED_SQL_SUMMARY);
      setIsFromCache(true);
      console.error("Error generating AI summary, using cached text:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
    setIsFromCache(false);
  }, []);

  return {
    summary,
    isLoading,
    error,
    isFromCache,
    generateSummary,
    clearSummary,
  };
};
