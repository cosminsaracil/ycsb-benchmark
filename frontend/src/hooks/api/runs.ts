import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/api";
import { deleteRun, fetchRuns } from "@/hooks/api/services/runs";
import type {
  BenchmarkModule,
  BenchmarkRunsResponse,
} from "@/types/benchmark";

const queryKeyForModule = (module: BenchmarkModule) =>
  module === "ycsb" ? QUERY_KEYS.ycsbRuns : QUERY_KEYS.sqlRuns;

const resultsQueryKeyForModule = (module: BenchmarkModule) =>
  module === "ycsb" ? QUERY_KEYS.ycsbResults : QUERY_KEYS.sqlResults;

export const useRuns = (module: BenchmarkModule) =>
  useQuery<BenchmarkRunsResponse, Error>({
    queryKey: queryKeyForModule(module),
    queryFn: () => fetchRuns(module),
  });

export const useDeleteRun = (module: BenchmarkModule) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => deleteRun(module, runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyForModule(module) });
      queryClient.invalidateQueries({
        queryKey: resultsQueryKeyForModule(module),
      });
    },
  });
};
