import { apiRequest } from "@/hooks/api/client";
import type {
  AISummaryResponse,
  SQLBenchmarkStatus,
  SQLResults,
} from "@/types/benchmark";

export const fetchSQLResults = async (
  runId?: string | null,
): Promise<SQLResults> => {
  const query = runId ? `?runId=${encodeURIComponent(runId)}` : "";
  return apiRequest<SQLResults>(`/api/sql/results${query}`, {
    cache: "no-store",
  });
};

export const startSQLBenchmarkRequest = async () =>
  apiRequest<{ message: string; status: SQLBenchmarkStatus }>(
    "/api/sql/benchmark/start",
    {
      method: "POST",
    },
  );

export const fetchSQLBenchmarkStatus = async (): Promise<SQLBenchmarkStatus> =>
  apiRequest<SQLBenchmarkStatus>("/api/sql/benchmark/status", {
    cache: "no-store",
  });

export const requestAISummary = async (results: SQLResults) =>
  apiRequest<AISummaryResponse>("/api/ai/summarize", {
    method: "POST",
    body: JSON.stringify({ results }),
  });
