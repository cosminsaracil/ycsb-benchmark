import type { BenchmarkStatus } from "@/types/benchmark";

export type BenchmarkAccent = "ycsb" | "sql";

export interface DbStatusIndicatorProps {
  name: string;
  dbKey?: string;
  isOnline: boolean;
}

export interface BenchmarkCardProps {
  title: string;
  isReady: boolean;
  dashboardLink: string;
  handleStartBenchmark: () => void;
  databaseStatus: Record<string, string>;
  onCheckConnection: () => void;
  isRunning?: boolean;
  isStarting?: boolean;
  accent: BenchmarkAccent;
  tagline?: string;
}

export interface ProgressCardProps {
  benchmarkStatus: BenchmarkStatus;
  title?: string;
  databaseLabels?: [string, string];
  completedWorkloadsLabel?: string;
  totalWorkloads?: number;
}
