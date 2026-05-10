import { apiRequest } from "@/hooks/api/client";
import type {
  BenchmarkStatus,
  DbConnectionsStatus,
  YCSBAISummaryResponse,
  YCSBResults,
} from "@/types/benchmark";

export const fetchYCSBResults = async (
  runId?: string | null,
): Promise<YCSBResults> => {
  const query = runId ? `?runId=${encodeURIComponent(runId)}` : "";
  return apiRequest<YCSBResults>(`/api/results${query}`, { cache: "no-store" });
};

export const fetchDBStatusConnections =
  async (): Promise<DbConnectionsStatus> =>
    apiRequest<DbConnectionsStatus>("/api/check-connection");

export const startYCSBBenchmarkRequest = async () =>
  apiRequest<{ message: string; status: BenchmarkStatus }>(
    "/api/benchmark/start",
    {
      method: "POST",
    },
  );

export const fetchYCSBBenchmarkStatus = async (): Promise<BenchmarkStatus> =>
  apiRequest<BenchmarkStatus>("/api/benchmark/status", { cache: "no-store" });

export const requestYCSBAISummary = async (results: YCSBResults) =>
  apiRequest<YCSBAISummaryResponse>("/api/ai/summarize-ycsb", {
    method: "POST",
    body: JSON.stringify({ results }),
  });
