import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CACHED_YCSB_SUMMARY,
  DEFAULT_STATUS_POLL_INTERVAL,
  QUERY_KEYS,
} from "@/constants/api";
import {
  fetchDBStatusConnections,
  fetchYCSBBenchmarkStatus,
  fetchYCSBResults,
  requestYCSBAISummary,
  startYCSBBenchmarkRequest,
} from "@/hooks/api/services/ycsb";
import { useAISummary as useAISummaryGeneric } from "@/hooks/api/useAISummary";
import type {
  BenchmarkStatus,
  DbConnectionsStatus,
  YCSBResults,
} from "@/types/benchmark";

const emptyStatus: BenchmarkStatus = {
  isRunning: false,
  progress: 0,
  currentDatabase: null,
  currentWorkload: null,
  currentStep: null,
  message: "",
  startTime: null,
  completedWorkloads: [],
};

export const useGetAllYCSBResults = (runId?: string | null) => {
  return useQuery<YCSBResults, Error>({
    queryKey: [...QUERY_KEYS.ycsbResults, runId ?? "latest"],
    queryFn: () => fetchYCSBResults(runId),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useGetDBStatusConnections = () =>
  useQuery<DbConnectionsStatus, Error>({
    queryKey: QUERY_KEYS.dbStatusConnections,
    queryFn: fetchDBStatusConnections,
  });

export const useStartBenchmark = () => {
  const mutation = useMutation({
    mutationFn: startYCSBBenchmarkRequest,
  });

  return {
    startBenchmark: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};

export const useBenchmarkStatus = (
  pollInterval = DEFAULT_STATUS_POLL_INTERVAL,
) => {
  const query = useQuery<BenchmarkStatus, Error>({
    queryKey: QUERY_KEYS.ycsbBenchmarkStatus,
    queryFn: fetchYCSBBenchmarkStatus,
    refetchInterval: pollInterval,
  });

  return {
    status: query.data ?? emptyStatus,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

export const useYCSBAISummary = () =>
  useAISummaryGeneric<YCSBResults>(requestYCSBAISummary, CACHED_YCSB_SUMMARY);

export {
  fetchDBStatusConnections,
  fetchYCSBBenchmarkStatus,
  fetchYCSBResults,
  startYCSBBenchmarkRequest,
};
