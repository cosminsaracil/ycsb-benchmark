import { useState, useEffect, useCallback } from "react";

interface BenchmarkStatus {
  isRunning: boolean;
  progress: number;
  currentWorkload: string | null;
  message: string;
  startTime: string | null;
}

export const useStartBenchmark = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startBenchmark = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/benchmark/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start benchmark");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { startBenchmark, isLoading, error };
};

export const useBenchmarkStatus = (pollInterval = 2000) => {
  const [status, setStatus] = useState<BenchmarkStatus>({
    isRunning: false,
    progress: 0,
    currentWorkload: null,
    message: "",
    startTime: null,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/benchmark/status"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch benchmark status");
      }

      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Poll for updates
    const interval = setInterval(() => {
      fetchStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval]);

  return { status, error, refetch: fetchStatus };
};
