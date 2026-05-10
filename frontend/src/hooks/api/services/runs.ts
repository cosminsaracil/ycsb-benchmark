import { apiRequest } from "@/hooks/api/client";
import type {
  BenchmarkModule,
  BenchmarkRunsResponse,
} from "@/types/benchmark";

export const fetchRuns = async (
  module: BenchmarkModule,
): Promise<BenchmarkRunsResponse> =>
  apiRequest<BenchmarkRunsResponse>(`/api/runs?module=${module}`, {
    cache: "no-store",
  });

export const deleteRun = async (
  module: BenchmarkModule,
  runId: string,
): Promise<{ success: boolean; deleted: string }> =>
  apiRequest<{ success: boolean; deleted: string }>(
    `/api/runs/${module}/${encodeURIComponent(runId)}`,
    { method: "DELETE" },
  );
