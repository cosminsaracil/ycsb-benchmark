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

type AccentTokens = {
  Icon: LucideIcon;
  tag: string;
  haloFrom: string;
  haloTo: string;
  iconBg: string;
  ringFrom: string;
  ringTo: string;
  ctaFrom: string;
  ctaTo: string;
  ctaShadow: string;
};

const ACCENTS: Record<BenchmarkAccent, AccentTokens> = {
  ycsb: {
    Icon: Activity,
    tag: "Tier 1 — NoSQL",
    haloFrom: "from-rose-500/20",
    haloTo: "to-violet-500/20",
    iconBg: "bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600",
    ringFrom: "from-rose-500",
    ringTo: "to-violet-600",
    ctaFrom: "from-rose-500",
    ctaTo: "to-violet-600",
    ctaShadow: "shadow-[0_0_14px_rgba(244,63,94,0.2)]",
  },
  sql: {
    Icon: DatabaseIcon,
    tag: "Tier 2 — SQL",
    haloFrom: "from-sky-500/20",
    haloTo: "to-cyan-400/20",
    iconBg: "bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500",
    ringFrom: "from-sky-500",
    ringTo: "to-cyan-500",
    ctaFrom: "from-sky-500",
    ctaTo: "to-cyan-500",
    ctaShadow: "shadow-[0_0_14px_rgba(14,165,233,0.2)]",
  },
};

const DOT_GRID_BG =
  "[background-image:radial-gradient(circle,_rgba(120,120,140,0.18)_1px,_transparent_1px)] [background-size:18px_18px]";

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
  const tokens = ACCENTS[accent];
  const { Icon } = tokens;

  return (
    <div className="relative group h-full">
      {/* Subtle halo — barely there at rest, gently visible on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[18px] opacity-0 blur-md transition-opacity duration-500",
          "bg-gradient-to-br",
          tokens.haloFrom,
          tokens.haloTo,
          "group-hover:opacity-60",
        )}
        aria-hidden
      />

      {/* Card body */}
      <div
        className={cn(
          "relative h-full flex flex-col rounded-2xl overflow-hidden",
          "border border-neutral-200/70 dark:border-neutral-800/80",
          "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl",
          "shadow-sm transition-shadow duration-500 group-hover:shadow-xl",
        )}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 overflow-hidden">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-50 dark:opacity-30",
              DOT_GRID_BG,
            )}
            aria-hidden
          />
          <div
            className={cn(
              "pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-3xl opacity-50",
              "bg-gradient-to-br",
              tokens.haloFrom,
              tokens.haloTo,
            )}
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl text-white",
                  "shadow-lg shadow-black/10 ring-1 ring-white/20",
                  tokens.iconBg,
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-[0.22em] text-muted-foreground font-mono">
                  {tagline ?? tokens.tag}
                </div>
                <h2 className="text-2xl font-bold tracking-tight mt-0.5 text-neutral-900 dark:text-neutral-50">
                  {title}
                </h2>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.16em]",
                "border",
                isReady
                  ? "border-emerald-200/70 dark:border-emerald-700/40 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-200/70 dark:border-amber-700/40 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
              )}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
                    isReady ? "bg-emerald-400" : "bg-amber-400",
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-1.5 w-1.5",
                    isReady ? "bg-emerald-500" : "bg-amber-500",
                  )}
                />
              </span>
              {isReady ? "Ready" : "Pending"}
            </div>
          </div>
        </div>

        {/* Status banner */}
        <div className="px-6">
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border",
              isReady
                ? "border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20"
                : "border-amber-200/60 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20",
            )}
          >
            {isReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <CircleAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
            )}
            <p
              className={cn(
                "text-sm font-medium leading-snug",
                isReady
                  ? "text-emerald-800 dark:text-emerald-200"
                  : "text-amber-800 dark:text-amber-200",
              )}
            >
              {isReady
                ? `${title} results are ready to explore.`
                : `${title} hasn't been run yet — start a benchmark to populate results.`}
            </p>
          </div>
        </div>

        {/* Database connections */}
        {databaseStatus && Object.keys(databaseStatus).length > 0 && (
          <div className="px-6 pt-5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground font-mono">
                Database Connections
              </p>
              <span className="text-[10px] text-muted-foreground font-mono">
                {Object.keys(databaseStatus).length} nodes
              </span>
            </div>
            <div className="flex flex-col gap-2">
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
        <div className="px-6 pt-5 pb-5 mt-auto flex flex-col sm:flex-row gap-2.5">
          <Button
            disabled={isRunning}
            onClick={onCheckConnection}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Plug className="w-4 h-4" />
            Check DB
          </Button>
          <Button
            onClick={handleStartBenchmark}
            disabled={isRunning || isStarting}
            className={cn(
              "flex-1 gap-2 text-white border-0 transition-all duration-300",
              "bg-gradient-to-br",
              tokens.ctaFrom,
              tokens.ctaTo,
              "hover:brightness-110",
              !isRunning && !isStarting && tokens.ctaShadow,
              "disabled:cursor-not-allowed disabled:opacity-70",
            )}
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Start Benchmark
              </>
            )}
          </Button>
        </div>

        {/* Dashboard link footer */}
        {dashboardLink && (
          <Link
            href={dashboardLink}
            className={cn(
              "group/link relative flex items-center justify-between px-6 py-4 border-t",
              "border-neutral-200/60 dark:border-neutral-800/60",
              "bg-neutral-50/60 dark:bg-neutral-900/50",
              "hover:bg-white dark:hover:bg-neutral-900 transition-colors",
            )}
          >
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b transition-all duration-300",
                "group-hover/link:w-1.5",
                tokens.ringFrom,
                tokens.ringTo,
              )}
              aria-hidden
            />
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              View {title} Dashboard
            </span>
            <ArrowUpRight
              className={cn(
                "w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform duration-300",
                "group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-foreground",
              )}
            />
          </Link>
        )}
      </div>
    </div>
  );
};
