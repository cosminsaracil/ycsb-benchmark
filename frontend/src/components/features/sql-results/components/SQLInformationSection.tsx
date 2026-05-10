import { Database, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SQL_WORKLOAD_INFO,
  INFO_SECTION_SQL_METRICS,
} from "@/utils/sql-constants";
import { BenchmarkInfoCard } from "@/components/features/shared/BenchmarkInfoCard";

type SQLInformationSectionProps = { currentTheme: string };

const WORKLOAD_RATIONALE: Record<string, string> = {
  W1: "This workload is a strong proxy for join planning quality and key lookup efficiency.",
  W2: "This workload emphasizes scans and reductions, making aggregation cost easier to compare.",
  W3: "This workload exposes transaction overhead, contention, and commit-path latency.",
  W4: "This workload mixes read and analytical pressure, making latency stability visible.",
};

const METRIC_USE_CASE: Record<string, string> = {
  throughput_ops_sec:
    "Use this when you want to understand how much SQL load the system can sustain per second.",
  avg_latency_us:
    "Use this to judge the typical response time users will feel during steady-state operation.",
  p95_latency_us:
    "Use this to understand the tail of the latency distribution under moderate contention.",
  p99_latency_us:
    "Use this to spot worst-case behavior and latency spikes that affect outlier requests.",
};

const StatPill = ({
  currentTheme,
  icon: Icon,
  title,
  value,
  body,
}: {
  currentTheme: string;
  icon: typeof Database;
  title: string;
  value: string;
  body: string;
}) => (
  <div
    className={cn(
      "rounded-xl border p-4",
      currentTheme === "dark"
        ? "border-gray-800/60 bg-gray-900/40"
        : "border-gray-200/60 bg-white/70",
    )}
  >
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      <Icon className="w-4 h-4" />
      {title}
    </div>
    <div className="mt-3 text-2xl font-bold">{value}</div>
    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
  </div>
);

const HeaderExtras = ({ currentTheme }: SQLInformationSectionProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatPill
      currentTheme={currentTheme}
      icon={Database}
      title="Databases"
      value="2"
      body="PostgreSQL and MySQL are compared side by side."
    />
    <StatPill
      currentTheme={currentTheme}
      icon={Clock}
      title="Workloads"
      value="4"
      body="Join-heavy through mixed OLTP+OLAP benchmark shapes."
    />
    <StatPill
      currentTheme={currentTheme}
      icon={Info}
      title="Metrics"
      value="4"
      body="Throughput plus average and tail latency views."
    />
  </div>
);

const Workloads = ({ currentTheme }: SQLInformationSectionProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Object.entries(SQL_WORKLOAD_INFO).map(([key, { name, desc }]) => (
      <div
        key={key}
        className={cn(
          "rounded-2xl border p-5 transition-all hover:shadow-md",
          currentTheme === "dark"
            ? "border-gray-800/60 bg-gray-900/35 hover:border-gray-700/80"
            : "border-gray-200/70 bg-white/80 hover:border-gray-300/90",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                SQL-{key}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {name}
              </Badge>
            </div>
            <div>
              <h4 className="text-lg font-semibold">{name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">
                Why it matters:{" "}
              </span>
              {WORKLOAD_RATIONALE[key]}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Metrics = ({ currentTheme }: SQLInformationSectionProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Object.entries(INFO_SECTION_SQL_METRICS).map(
      ([key, { label, unit, description, interpretation, badge }]) => (
        <div
          key={key}
          className={cn(
            "rounded-2xl border p-5 transition-all hover:shadow-md",
            currentTheme === "dark"
              ? "border-gray-800/60 bg-gray-900/35 hover:border-gray-700/80"
              : "border-gray-200/70 bg-white/80 hover:border-gray-300/90",
          )}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold">{label}</h4>
                <p className="text-xs text-muted-foreground mt-1">SQL metric</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {badge}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground leading-6">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Unit
                </div>
                <div className="mt-1 font-mono text-sm">{unit}</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Interpretation
                </div>
                <div
                  className={cn(
                    "mt-1 text-sm font-medium",
                    interpretation.includes("Higher")
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {interpretation}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20 p-3 text-sm text-muted-foreground leading-6">
              {METRIC_USE_CASE[key]}
            </div>
          </div>
        </div>
      ),
    )}
  </div>
);

export const SQLInformationSection = ({
  currentTheme,
}: SQLInformationSectionProps) => (
  <BenchmarkInfoCard
    currentTheme={currentTheme}
    title="SQL Benchmark Information"
    description="Understanding SQL workload characteristics and performance metrics"
    headerExtras={<HeaderExtras currentTheme={currentTheme} />}
    workloadsContent={<Workloads currentTheme={currentTheme} />}
    metricsContent={<Metrics currentTheme={currentTheme} />}
  />
);
