import { useMutation, useQuery } from "@tanstack/react-query";
import { DEFAULT_STATUS_POLL_INTERVAL, QUERY_KEYS } from "@/constants/api";
import {
  fetchDBStatusConnections,
  fetchYCSBBenchmarkStatus,
  fetchYCSBResults,
  startYCSBBenchmarkRequest,
} from "@/hooks/api/services/ycsb";
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

export const useGetAllYCSBResults = () => {
  return useQuery<YCSBResults, Error>({
    queryKey: QUERY_KEYS.ycsbResults,
    queryFn: fetchYCSBResults,
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

export {
  fetchDBStatusConnections,
  fetchYCSBBenchmarkStatus,
  fetchYCSBResults,
  startYCSBBenchmarkRequest,
};
