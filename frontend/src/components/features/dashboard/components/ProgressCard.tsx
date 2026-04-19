import { BenchmarkStatus } from "@/utils/hooks/api/ycsb/useBenchmark";

interface ProgressCardProps {
  benchmarkStatus: BenchmarkStatus;
  title?: string;
  databaseLabels?: [string, string];
  completedWorkloadsLabel?: string;
  totalWorkloads?: number;
}

export const ProgressCard = ({
  benchmarkStatus,
  title = "Benchmark in progress",
  databaseLabels = ["Redis", "MongoDB"],
  completedWorkloadsLabel = "workloads",
  totalWorkloads = 12,
}: ProgressCardProps) => {
  return (
    <div className="w-full max-w-6xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-xl p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {title}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 font-mono">
            {benchmarkStatus.progress.toFixed(1)}%
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Overall Progress
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-6 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out flex items-center justify-end px-3"
            style={{ width: `${benchmarkStatus.progress}%` }}
          >
            {benchmarkStatus.progress > 10 && (
              <span className="text-xs font-semibold text-white">
                {benchmarkStatus.progress.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Redis/MongoDB Split Indicator */}
        <div className="flex mt-2 text-xs text-blue-700 dark:text-blue-300">
          <div className="flex-1 text-left">
            <span className="font-medium">{databaseLabels[0]} (0-50%)</span>
          </div>
          <div className="flex-1 text-right">
            <span className="font-medium">{databaseLabels[1]} (50-100%)</span>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white dark:bg-blue-900/30 rounded-lg p-5 space-y-3">
        {benchmarkStatus.currentDatabase && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Database:
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-mono">
              {benchmarkStatus.currentDatabase}
            </span>
          </div>
        )}

        {benchmarkStatus.currentWorkload && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Workload:
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-mono">
              {benchmarkStatus.currentWorkload}
            </span>
          </div>
        )}

        {benchmarkStatus.currentStep && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Step:
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {benchmarkStatus.currentStep}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {benchmarkStatus.message}
          </p>
        </div>
      </div>

      {/* Completed Workloads Counter */}
      {benchmarkStatus.completedWorkloads &&
        benchmarkStatus.completedWorkloads.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              Completed: {benchmarkStatus.completedWorkloads.length} /{" "}
              {totalWorkloads} {completedWorkloadsLabel}
            </span>
          </div>
        )}
    </div>
  );
};
