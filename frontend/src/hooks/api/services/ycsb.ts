import { apiRequest } from "@/hooks/api/client";
import type {
  BenchmarkStatus,
  DbConnectionsStatus,
  YCSBResults,
} from "@/types/benchmark";

export const fetchYCSBResults = async (): Promise<YCSBResults> =>
  apiRequest<YCSBResults>("/api/results", { cache: "no-store" });

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
