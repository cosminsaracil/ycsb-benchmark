import { useCallback, useState } from "react";
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

export const useGetAllSQLResults = () => {
  return useQuery<SQLResults, Error>({
    queryKey: QUERY_KEYS.sqlResults,
    queryFn: fetchSQLResults,
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

export const useAISummary = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const generateSummary = useCallback(async (results: SQLResults) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setIsFromCache(false);

    try {
      const data = await requestAISummary(results);
      setSummary(data.summary);
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

export { fetchSQLBenchmarkStatus, fetchSQLResults, startSQLBenchmarkRequest };
