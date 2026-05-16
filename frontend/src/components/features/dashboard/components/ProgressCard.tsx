import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgressCardProps } from "./types";

export const ProgressCard = ({
  benchmarkStatus,
  title = "Benchmark in progress",
  databaseLabels = ["Redis", "MongoDB"],
  completedWorkloadsLabel = "workloads",
  totalWorkloads = 12,
}: ProgressCardProps) => {
  const progress = benchmarkStatus.progress;
  const completedCount = benchmarkStatus.completedWorkloads?.length ?? 0;

  return (
    <div
      className={cn(
        "w-full rounded-2xl",
        "border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-950",
        "p-6 sm:p-7",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40 animate-pulse" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
              Live
            </div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 mt-0.5">
              {title}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-neutral-900 dark:text-neutral-50">
            {progress.toFixed(1)}
            <span className="text-neutral-400 dark:text-neutral-600">%</span>
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500 mt-0.5">
            Overall
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-neutral-50 rounded-full transition-[width] duration-500 ease-[var(--ease-out-strong)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] font-mono text-neutral-500 tabular-nums">
          <span>{databaseLabels[0]} · 0–50%</span>
          <span>{databaseLabels[1]} · 50–100%</span>
        </div>
      </div>

      {/* Current status */}
      <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
        {benchmarkStatus.currentDatabase && (
          <StatusRow label="Database" value={benchmarkStatus.currentDatabase} mono />
        )}
        {benchmarkStatus.currentWorkload && (
          <StatusRow label="Workload" value={benchmarkStatus.currentWorkload} mono />
        )}
        {benchmarkStatus.currentStep && (
          <StatusRow label="Step" value={benchmarkStatus.currentStep} />
        )}
        {benchmarkStatus.message && (
          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400 pt-1.5">
            {benchmarkStatus.message}
          </p>
        )}
      </div>

      {/* Completed counter */}
      {completedCount > 0 && (
        <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-[13px]">
          <CheckCircle2
            className="w-4 h-4 text-emerald-600 dark:text-emerald-500"
            strokeWidth={2}
          />
          <span className="text-neutral-600 dark:text-neutral-400">
            Completed{" "}
            <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-50">
              {completedCount}
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">
              {" "}
              / {totalWorkloads}
            </span>{" "}
            {completedWorkloadsLabel}
          </span>
        </div>
      )}
    </div>
  );
};

const StatusRow = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex items-baseline gap-3 text-[13px]">
    <span className="w-20 shrink-0 font-mono uppercase tracking-[0.14em] text-[11px] text-neutral-500">
      {label}
    </span>
    <span
      className={cn(
        "text-neutral-900 dark:text-neutral-100",
        mono && "font-mono tabular-nums",
      )}
    >
      {value}
    </span>
  </div>
);
