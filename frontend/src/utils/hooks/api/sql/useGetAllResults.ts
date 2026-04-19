import { useQuery } from "@tanstack/react-query";

export interface SQLBenchmarkRow {
  database: string;
  workload: string;
  description: string;
  throughput_ops_sec: string | number;
  avg_latency_us: string | number;
  p95_latency_us: string | number;
  p99_latency_us: string | number;
  operations_requested: string | number;
  operations_succeeded: string | number;
  operations_failed: string | number;
  thread_count: string | number;
  seed: string | number;
}

export interface SQLResults {
  filename: string;
  benchmark: string;
  data: SQLBenchmarkRow[];
}

export const fetchSQLResults = async (): Promise<SQLResults> => {
  const baseUrl = "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/sql/results`);
  if (!response.ok) {
    throw new Error("Failed to fetch SQL results");
  }
  return response.json();
};

export const useGetAllSQLResults = () => {
  return useQuery<SQLResults, Error>({
    queryKey: ["sql-results"],
    queryFn: fetchSQLResults,
  });
};
