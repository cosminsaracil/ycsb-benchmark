import type { YCSBBenchmarkRow, YCSBResults } from "@/types/benchmark";

export type BenchmarkData = YCSBBenchmarkRow;
export type BenchmarkResult = YCSBResults;

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
