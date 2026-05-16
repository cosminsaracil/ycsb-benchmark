import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DB_COLORS } from "@/utils/constants";

export type SummaryStats = { avg: number; min: number; max: number };

export type BenchmarkSummaryEntry = {
  key: keyof typeof DB_COLORS | string;
  label: string;
  stats: SummaryStats | undefined;
  isWinner: boolean;
};

type Props = {
  entries: BenchmarkSummaryEntry[];
  currentTheme?: string;
  formatNumber: (num: number, decimals?: number) => string;
  metricLabel?: string;
  metricUnit?: string;
};

export const BenchmarkSummaryCards = ({
  entries,
  formatNumber,
  metricLabel,
  metricUnit,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entries.map(({ key, label, stats, isWinner }) => {
        const color =
          DB_COLORS[key as keyof typeof DB_COLORS] ?? "var(--primary)";
        return (
          <div
            key={key}
            className={cn(
              "rounded-2xl border bg-white dark:bg-neutral-950 p-6",
              "transition-colors duration-200 ease-[var(--ease-out-strong)]",
              "border-neutral-200 dark:border-neutral-800",
              "hover:border-neutral-300 dark:hover:border-neutral-700",
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-block w-1 h-5 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                  {label}
                </h3>
              </div>
              {isWinner && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" strokeWidth={2} />
                  Leader
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
                {metricLabel ? `Average ${metricLabel}` : "Average"}
              </div>
              <div
                className="text-3xl font-semibold font-mono tabular-nums tracking-tight"
                style={{ color }}
              >
                {formatNumber(stats?.avg ?? 0)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-5 mt-5 border-t border-neutral-200 dark:border-neutral-800">
              <StatBlock label="Min" value={formatNumber(stats?.min ?? 0)} />
              <StatBlock label="Max" value={formatNumber(stats?.max ?? 0)} />
            </div>

            {metricUnit && (
              <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
                Unit{" "}
                <span className="font-mono text-neutral-700 dark:text-neutral-300 ml-1">
                  {metricUnit}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
      {label}
    </div>
    <div className="text-lg font-mono tabular-nums text-neutral-900 dark:text-neutral-50">
      {value}
    </div>
  </div>
);
