import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CACHED_SQL_SUMMARY,
  DEFAULT_STATUS_POLL_INTERVAL,
  QUERY_KEYS,
} from "@/constants/api";
import {
  fetchSQLBenchmarkStatus,
  fetchSQLResults,
  requestAISummary,
  startSQLBenchmarkRequest,
} from "@/hooks/api/services/sql";
import { useAISummary as useAISummaryGeneric } from "@/hooks/api/useAISummary";
import type { SQLBenchmarkStatus, SQLResults } from "@/types/benchmark";

const emptyStatus: SQLBenchmarkStatus = {
  isRunning: false,
  progress: 0,
  currentDatabase: null,
  currentWorkload: null,
  currentStep: null,
  message: "",
  startTime: null,
  completedWorkloads: [],
};

export const useGetAllSQLResults = (runId?: string | null) => {
  return useQuery<SQLResults, Error>({
    queryKey: [...QUERY_KEYS.sqlResults, runId ?? "latest"],
    queryFn: () => fetchSQLResults(runId),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useStartSQLBenchmark = () => {
  const mutation = useMutation({
    mutationFn: startSQLBenchmarkRequest,
  });

  return {
    startSQLBenchmark: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};

export const useSQLBenchmarkStatus = (
  pollInterval = DEFAULT_STATUS_POLL_INTERVAL,
) => {
  const query = useQuery<SQLBenchmarkStatus, Error>({
    queryKey: QUERY_KEYS.sqlBenchmarkStatus,
    queryFn: fetchSQLBenchmarkStatus,
    refetchInterval: pollInterval,
  });

  return {
    status: query.data ?? emptyStatus,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

export const useAISummary = () =>
  useAISummaryGeneric<SQLResults>(requestAISummary, CACHED_SQL_SUMMARY);

export { fetchSQLBenchmarkStatus, fetchSQLResults, startSQLBenchmarkRequest };
