export interface BenchmarkData {
  throughput: number;
  read_avg: number;
  read_95th: number;
  read_99th: number;
  update_avg: number;
  update_95th: number;
  update_99th: number;
  insert_avg: number;
  insert_95th: number;
  insert_99th: number;
  scan_avg: number;
  scan_95th: number;
  scan_99th: number;
  database: string;
  workload: string;
  [key: string]: string | number;
}

export interface BenchmarkResult {
  filename: string;
  benchmark: string;
  data: BenchmarkData[];
}

export type BenchmarkChartProps = {
  results: BenchmarkResult;
  selectedMetric: string;
  metricToFieldMap: Record<string, string>;
  workloads?: string[];
  databases?: Array<{
    name: string;
    label: string;
    backgroundColor: string;
    borderColor: string;
  }>;
  width?: string;
  height?: string;
};

export type ResultsCardProps = {
  workload: string;
  results: BenchmarkResult;
  selectedMetric: string;
  metricToFieldMap: Record<string, string>;
};
