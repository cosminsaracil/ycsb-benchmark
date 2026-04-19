import { useMutation, useQuery } from "@tanstack/react-query";

export interface SQLBenchmarkStatus {
  isRunning: boolean;
  progress: number;
  currentDatabase: string | null;
  currentWorkload: string | null;
  currentStep: string | null;
  message: string;
  startTime: string | null;
  completedWorkloads: string[];
}

const baseUrl = "http://localhost:8000";

export const startSQLBenchmarkRequest = async () => {
  const response = await fetch(`${baseUrl}/api/sql/benchmark/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to start SQL benchmark");
  }

  return response.json();
};

export const fetchSQLBenchmarkStatus =
  async (): Promise<SQLBenchmarkStatus> => {
    const response = await fetch(`${baseUrl}/api/sql/benchmark/status`);
    if (!response.ok) {
      throw new Error("Failed to fetch SQL benchmark status");
    }
    return response.json();
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

export const useSQLBenchmarkStatus = () => {
  const query = useQuery<SQLBenchmarkStatus, Error>({
    queryKey: ["sql-benchmark-status"],
    queryFn: fetchSQLBenchmarkStatus,
    refetchInterval: 2000,
  });

  return {
    status: query.data ?? {
      isRunning: false,
      progress: 0,
      currentDatabase: null,
      currentWorkload: null,
      currentStep: null,
      message: "",
      startTime: null,
      completedWorkloads: [],
    },
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};
