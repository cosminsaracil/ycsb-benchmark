import { Database, Clock, Info } from "lucide-react";
import {
  SQL_WORKLOAD_INFO,
  INFO_SECTION_SQL_METRICS,
} from "@/utils/sql-constants";
import { BenchmarkInfoCard } from "@/components/features/shared/BenchmarkInfoCard";

type SQLInformationSectionProps = { currentTheme?: string };

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
  icon: Icon,
  title,
  value,
  body,
}: {
  icon: typeof Database;
  title: string;
  value: string;
  body: string;
}) => (
  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      {title}
    </div>
    <div className="mt-2 text-2xl font-semibold font-mono tabular-nums tracking-tight text-neutral-900 dark:text-neutral-50">
      {value}
    </div>
    <p className="mt-1 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
      {body}
    </p>
  </div>
);

const HeaderExtras = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <StatPill
      icon={Database}
      title="Databases"
      value="2"
      body="PostgreSQL and MySQL compared side by side."
    />
    <StatPill
      icon={Clock}
      title="Workloads"
      value="4"
      body="Join-heavy through mixed OLTP + OLAP shapes."
    />
    <StatPill
      icon={Info}
      title="Metrics"
      value="4"
      body="Throughput plus average and tail latency views."
    />
  </div>
);

const Workloads = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {Object.entries(SQL_WORKLOAD_INFO).map(([key, { name, desc }]) => (
      <div
        key={key}
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 transition-colors duration-200 ease-[var(--ease-out-strong)] hover:border-neutral-300 dark:hover:border-neutral-700"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-[0.14em] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
            SQL-{key}
          </span>
        </div>
        <h4 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {name}
        </h4>
        <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {desc}
        </p>
        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[12px] leading-6 text-neutral-600 dark:text-neutral-400">
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-500 mr-2">
            Why
          </span>
          {WORKLOAD_RATIONALE[key]}
        </div>
      </div>
    ))}
  </div>
);

const Metrics = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {Object.entries(INFO_SECTION_SQL_METRICS).map(
      ([key, { label, unit, description, interpretation, badge }]) => (
        <div
          key={key}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 transition-colors duration-200 ease-[var(--ease-out-strong)] hover:border-neutral-300 dark:hover:border-neutral-700"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h4 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                {label}
              </h4>
              <div className="mt-0.5 text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-500">
                SQL metric
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] border border-neutral-200 dark:border-neutral-800 text-neutral-500">
              {badge}
            </span>
          </div>

          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-md bg-neutral-50 dark:bg-neutral-900/40 p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-neutral-500">
                Unit
              </div>
              <div className="mt-1 font-mono text-[13px] text-neutral-900 dark:text-neutral-100">
                {unit}
              </div>
            </div>
            <div className="rounded-md bg-neutral-50 dark:bg-neutral-900/40 p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-neutral-500">
                Interpretation
              </div>
              <div className="mt-1 text-[13px] text-neutral-900 dark:text-neutral-100">
                {interpretation}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-dashed border-neutral-300 dark:border-neutral-800 p-3 text-[12px] leading-6 text-neutral-600 dark:text-neutral-400">
            {METRIC_USE_CASE[key]}
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
    title="SQL benchmark information"
    description="Understanding SQL workload characteristics and performance metrics."
    headerExtras={<HeaderExtras />}
    workloadsContent={<Workloads />}
    metricsContent={<Metrics />}
  />
);
