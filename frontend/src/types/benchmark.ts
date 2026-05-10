export interface YCSBBenchmarkRow {
  throughput: string | number;
  read_avg: string | number;
  read_95th: string | number;
  read_99th: string | number;
  update_avg: string | number;
  update_95th: string | number;
  update_99th: string | number;
  insert_avg: string | number;
  insert_95th: string | number;
  insert_99th: string | number;
  scan_avg: string | number;
  scan_95th: string | number;
  scan_99th: string | number;
  database: string;
  workload: string;
  [key: string]: string | number;
}

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
  [key: string]: string | number;
}

export interface BenchmarkResponse<T> {
  filename: string;
  benchmark: string;
  data: T[];
}

export type YCSBResults = BenchmarkResponse<YCSBBenchmarkRow>;
export type SQLResults = BenchmarkResponse<SQLBenchmarkRow>;

export interface BenchmarkStatus {
  isRunning: boolean;
  progress: number;
  currentDatabase: string | null;
  currentWorkload: string | null;
  currentStep: string | null;
  message: string;
  startTime: string | null;
  completedWorkloads: string[];
}

export type SQLBenchmarkStatus = BenchmarkStatus;

export interface DbConnectionsStatus {
  redis: string;
  mongo: string;
  postgres: string;
  mysql: string;
  [key: string]: string;
}

export type BenchmarkModule = "ycsb" | "sql";

export interface BenchmarkRun {
  id: string;
  timestamp: string;
  hasSummary: boolean;
  sizeBytes: number;
}

export interface BenchmarkRunsResponse {
  module: BenchmarkModule;
  runs: BenchmarkRun[];
}

export interface AISummaryResponse {
  success: boolean;
  summary: string;
  dataUsed: {
    benchmark: string;
    workloads: string[];
    databases: string[];
    postgres: {
      avgThroughput: number;
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
    };
    mysql: {
      avgThroughput: number;
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
    };
  };
}

export interface YCSBAIDatabaseStats {
  avgThroughput: number;
  avgReadLatency: number;
  p95ReadLatency: number;
  p99ReadLatency: number;
  avgUpdateLatency: number;
  p95UpdateLatency: number;
  p99UpdateLatency: number;
  avgInsertLatency: number;
  avgScanLatency: number;
}

export interface YCSBAISummaryResponse {
  success: boolean;
  summary: string;
  model?: string;
  dataUsed: {
    benchmark: string;
    workloads: string[];
    databases: string[];
    redis: YCSBAIDatabaseStats;
    mongodb: YCSBAIDatabaseStats;
  };
}
