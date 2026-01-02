import { useQuery } from "@tanstack/react-query";

export interface BenchmarkData {
  throughput: string;
  read_avg: string;
  read_95th: string;
  read_99th: string;
  update_avg: string;
  update_95th: string;
  update_99th: string;
  insert_avg: string;
  insert_95th: string;
  insert_99th: string;
  scan_avg: string;
  scan_95th: string;
  scan_99th: string;
  database: string;
  workload: string;
}

export interface YCSBResults {
  filename: string;
  benchmark: string;
  data: BenchmarkData[];
}

export const fetchYCSBResults = async (): Promise<YCSBResults> => {
  const baseUrl = "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/results`);
  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }
  return response.json();
};

export const useGetAllYCSBResults = () => {
  return useQuery<YCSBResults, Error>({
    queryKey: ["results"],
    queryFn: fetchYCSBResults,
  });
};
