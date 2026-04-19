import type { BenchmarkStatus } from "@/types/benchmark";

export interface DbStatusIndicatorProps {
  name: string;
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
}

export interface ProgressCardProps {
  benchmarkStatus: BenchmarkStatus;
  title?: string;
  databaseLabels?: [string, string];
  completedWorkloadsLabel?: string;
  totalWorkloads?: number;
}
