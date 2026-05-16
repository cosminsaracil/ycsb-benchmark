import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Database as DatabaseIcon,
  Loader2,
  Plug,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DbStatusIndicator } from "./StatusIndicator";
import type { BenchmarkAccent, BenchmarkCardProps } from "./types";

const CONNECTION_LABELS: Record<string, string> = {
  redis: "Redis",
  mongo: "MongoDB",
  postgres: "PostgreSQL",
  mysql: "MySQL",
};

const ACCENT_ICONS: Record<BenchmarkAccent, LucideIcon> = {
  ycsb: Activity,
  sql: DatabaseIcon,
};

const ACCENT_TAGS: Record<BenchmarkAccent, string> = {
  ycsb: "Tier 1 — NoSQL",
  sql: "Tier 2 — SQL",
};

export const BenchmarkCard = ({
  title,
  isReady,
  dashboardLink,
  handleStartBenchmark,
  databaseStatus,
  onCheckConnection,
  isRunning,
  isStarting,
  accent,
  tagline,
}: BenchmarkCardProps) => {
  const Icon = ACCENT_ICONS[accent];
  const connectionsCount = databaseStatus
    ? Object.keys(databaseStatus).length
    : 0;

  return (
    <div
      className={cn(
        "group relative h-full flex flex-col overflow-hidden rounded-2xl",
        "border border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-950",
        "transition-[border-color,transform] duration-200 ease-[var(--ease-out-strong)]",
        "hover:border-neutral-300 dark:hover:border-neutral-700",
      )}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg",
                "border border-neutral-200 dark:border-neutral-800",
                "bg-neutral-50 dark:bg-neutral-900",
                "text-neutral-700 dark:text-neutral-300",
              )}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-500">
                {tagline ?? ACCENT_TAGS[accent]}
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                {title}
              </h2>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium tabular-nums",
              "border",
              isReady
                ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                : "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
            )}
          >
            <span
              className={cn(
                "inline-flex rounded-full h-1.5 w-1.5",
                isReady ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            {isReady ? "Ready" : "Pending"}
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className="px-6">
        <div
          className={cn(
            "flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg",
            "border border-neutral-200 dark:border-neutral-800",
            "bg-neutral-50/60 dark:bg-neutral-900/40",
          )}
        >
          {isReady ? (
            <CheckCircle2
              className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-500 shrink-0"
              strokeWidth={2}
            />
          ) : (
            <CircleAlert
              className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-500 shrink-0"
              strokeWidth={2}
            />
          )}
          <p className="text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {isReady
              ? `${title} results are ready to explore.`
              : `${title} hasn't been run yet — start a benchmark to populate results.`}
          </p>
        </div>
      </div>

      {/* Database connections */}
      {connectionsCount > 0 && (
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
              Connections
            </p>
            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-600 tabular-nums">
              {connectionsCount}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {Object.entries(databaseStatus).map(([key, status]) => (
              <DbStatusIndicator
                key={key}
                name={CONNECTION_LABELS[key] ?? key}
                dbKey={key === "mongo" ? "mongodb" : key}
                isOnline={status === "running"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pt-5 pb-5 mt-auto flex flex-col sm:flex-row gap-2">
        <Button
          disabled={isRunning}
          onClick={onCheckConnection}
          variant="outline"
          className="flex-1 gap-2 transition-transform duration-150 ease-[var(--ease-out-strong)] active:scale-[0.98]"
        >
          <Plug className="w-3.5 h-3.5" strokeWidth={2} />
          Check DB
        </Button>
        <Button
          onClick={handleStartBenchmark}
          disabled={isRunning || isStarting}
          className={cn(
            "flex-1 gap-2 transition-transform duration-150 ease-[var(--ease-out-strong)]",
            "active:scale-[0.98] disabled:active:scale-100",
          )}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Starting
            </>
          ) : isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Running
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" strokeWidth={2} />
              Run benchmark
            </>
          )}
        </Button>
      </div>

      {/* Dashboard link footer */}
      {dashboardLink && (
        <Link
          href={dashboardLink}
          className={cn(
            "group/link flex items-center justify-between px-6 py-3.5 border-t",
            "border-neutral-200 dark:border-neutral-800",
            "bg-neutral-50/40 dark:bg-neutral-900/30",
            "transition-colors duration-150",
            "hover:bg-neutral-100 dark:hover:bg-neutral-900",
          )}
        >
          <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
            View {title} dashboard
          </span>
          <ArrowUpRight
            className={cn(
              "w-4 h-4 text-neutral-400 dark:text-neutral-500",
              "transition-transform duration-200 ease-[var(--ease-out-strong)]",
              "group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5",
              "group-hover/link:text-neutral-900 dark:group-hover/link:text-neutral-100",
            )}
            strokeWidth={2}
          />
        </Link>
      )}
    </div>
  );
};
