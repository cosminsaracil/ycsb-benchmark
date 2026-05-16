"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Database as DatabaseIcon } from "lucide-react";
import { useCurrentTheme } from "@/utils/useCurrentTheme";
import { SQL_METRICS, SQL_WORKLOADS } from "@/utils/sql-constants";
import { useAISummary, useGetAllSQLResults } from "@/hooks/api/sql";
import {
  AISummaryButton,
  AISummaryCard,
} from "@/components/features/shared/AISummaryCard";
import { BenchmarkGraphCard } from "@/components/features/shared/BenchmarkGraphCard";
import { BenchmarkGraphConfiguration } from "@/components/features/shared/BenchmarkGraphConfiguration";
import { BenchmarkSummaryCards } from "@/components/features/shared/BenchmarkSummaryCards";
import { useBenchmarkChartData } from "@/components/features/shared/useBenchmarkChartData";
import { formatBenchmarkNumber } from "@/components/features/shared/format";
import { RunSelector } from "@/components/features/shared/RunSelector";
import type { SQLBenchmarkRow } from "@/types/benchmark";
import { SQLInformationSection } from "./components/SQLInformationSection";

const DATABASES = ["postgres", "mysql"] as const;
type DbKey = (typeof DATABASES)[number];

export default function SQLResults() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const {
    data: results,
    isLoading,
    isFetching,
    error,
  } = useGetAllSQLResults(selectedRunId);
  const [selectedMetric, setSelectedMetric] = useState("throughput_ops_sec");
  const [selectedWorkloads, setSelectedWorkloads] =
    useState<string[]>(SQL_WORKLOADS);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    isFromCache,
    generateSummary,
    clearSummary,
  } = useAISummary();
  const currentTheme = useCurrentTheme();

  useEffect(() => {
    clearSummary();
  }, [selectedRunId, clearSummary]);

  const metricInfo = SQL_METRICS[selectedMetric as keyof typeof SQL_METRICS];

  const { chartData, lineData, summaryStats } = useBenchmarkChartData<DbKey>({
    rows: results?.data,
    databases: DATABASES as unknown as DbKey[],
    workloads: selectedWorkloads,
    metricField: selectedMetric,
    workloadLabel: (w) => `SQL-${w}`,
    matchWorkload: (rowWorkload, workload) => rowWorkload === `SQL-${workload}`,
  });

  const postgresAvg = summaryStats.postgres.avg;
  const mysqlAvg = summaryStats.mysql.avg;
  const postgresWins = metricInfo.higher
    ? postgresAvg > mysqlAvg
    : postgresAvg < mysqlAvg && postgresAvg > 0;

  const hasData = !!results && results.data.length > 0;
  const isEmpty = !isLoading && !error && !hasData;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 py-2">
      <ResultsHeader
        eyebrow="Tier 2 — Relational"
        title="SQL performance"
        description="Analysis of PostgreSQL and MySQL across join-heavy, aggregation-heavy, transaction-heavy, and mixed workload patterns."
        action={
          hasData ? (
            <AISummaryButton
              isLoading={isSummaryLoading}
              onGenerate={() => generateSummary(results)}
            />
          ) : null
        }
      />

      {isLoading && <ResultsSkeleton />}

      {error && <InlineError message="Unable to load SQL benchmark results." />}

      {isEmpty && (
        <EmptyResults
          message={
            selectedRunId
              ? "This historical run has no summary data."
              : "Run the SQL benchmark from the dashboard to generate results."
          }
        >
          <RunSelector
            module="sql"
            selectedRunId={selectedRunId}
            onChange={setSelectedRunId}
            isFetching={isFetching}
          />
        </EmptyResults>
      )}

      {hasData && (
        <>
          <AISummaryCard
            summary={summary}
            isLoading={isSummaryLoading}
            error={summaryError}
            isFromCache={isFromCache}
          />

          <BenchmarkGraphConfiguration
            description="Customize your SQL benchmark view and analysis parameters."
            metricOptions={Object.entries(SQL_METRICS).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            workloadOptions={[
              { value: SQL_WORKLOADS.join(","), label: "All workloads" },
              { value: "W1,W2", label: "W1, W2" },
              { value: "W3,W4", label: "W3, W4" },
              ...SQL_WORKLOADS.map((w) => ({ value: w, label: w })),
            ]}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            selectedWorkloads={selectedWorkloads}
            setSelectedWorkloads={setSelectedWorkloads}
            chartType={chartType}
            setChartType={setChartType}
            currentTheme={currentTheme}
            leaderLabel={postgresWins ? "PostgreSQL" : "MySQL"}
            leaderTone={postgresWins ? "destructive" : "default"}
            headerRight={
              <RunSelector
                module="sql"
                selectedRunId={selectedRunId}
                onChange={setSelectedRunId}
                isFetching={isFetching}
              />
            }
          />

          <BenchmarkSummaryCards
            entries={[
              {
                key: "postgres",
                label: "PostgreSQL",
                stats: summaryStats.postgres,
                isWinner: postgresWins,
              },
              {
                key: "mysql",
                label: "MySQL",
                stats: summaryStats.mysql,
                isWinner: !postgresWins,
              },
            ]}
            formatNumber={formatBenchmarkNumber}
            metricLabel={metricInfo?.label}
            metricUnit={metricInfo?.unit}
          />

          <BenchmarkGraphCard
            currentTheme={currentTheme}
            chartType={chartType}
            chartData={chartData}
            lineData={lineData}
            keys={["postgres", "mysql"]}
            indexBy="workload"
            metricInfo={metricInfo}
            formatNumber={formatBenchmarkNumber}
            height={420}
          />

          <RawResultsTable rows={results.data} />
        </>
      )}

      <SQLInformationSection currentTheme={currentTheme} />
    </div>
  );
}

const ResultsHeader = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2">
    <div className="flex flex-col gap-1.5">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
        <DatabaseIcon className="w-3 h-3" strokeWidth={1.75} />
        {eyebrow}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-prose">
        {description}
      </p>
    </div>
    {action}
  </div>
);

const InlineError = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20"
  >
    <AlertCircle
      className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-500 shrink-0"
      strokeWidth={2}
    />
    <p className="text-[13px] leading-relaxed text-rose-800 dark:text-rose-300">
      {message}
    </p>
  </div>
);

const EmptyResults = ({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 px-6 py-12 flex flex-col items-center gap-5">
    <div className="text-center max-w-md">
      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500 mb-1.5">
        No results
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {message}
      </p>
    </div>
    {children && (
      <div className="w-full max-w-md flex justify-center">{children}</div>
    )}
  </div>
);

const ResultsSkeleton = () => (
  <div className="space-y-5">
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
      <div className="h-3 w-20 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mb-3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-md bg-neutral-100 dark:bg-neutral-900 animate-pulse"
          />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-44 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
        <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
        <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mt-3" />
        <div className="h-3 w-24 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mt-6" />
      </div>
      <div className="h-44 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
        <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
        <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mt-3" />
        <div className="h-3 w-24 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mt-6" />
      </div>
    </div>
    <div className="h-[420px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 animate-pulse" />
  </div>
);

const toNumber = (v: string | number | null | undefined) =>
  typeof v === "number" ? v : Number(v ?? 0);

const RawResultsTable = ({ rows }: { rows: SQLBenchmarkRow[] }) => (
  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
    <div className="px-6 pt-5 pb-3">
      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
        Detail
      </div>
      <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Raw SQL benchmark results
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-500 border-y border-neutral-200 dark:border-neutral-800">
            <Th>Database</Th>
            <Th>Workload</Th>
            <Th align="right">Throughput</Th>
            <Th align="right">Avg latency</Th>
            <Th align="right">P95</Th>
            <Th align="right">P99</Th>
            <Th align="right">Failures</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.database}-${row.workload}`}
              className="border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <Td>{row.database}</Td>
              <Td>
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  {row.workload}
                </span>
              </Td>
              <Td align="right" mono>
                {formatBenchmarkNumber(toNumber(row.throughput_ops_sec))}
              </Td>
              <Td align="right" mono>
                {formatBenchmarkNumber(toNumber(row.avg_latency_us))}
              </Td>
              <Td align="right" mono>
                {formatBenchmarkNumber(toNumber(row.p95_latency_us))}
              </Td>
              <Td align="right" mono>
                {formatBenchmarkNumber(toNumber(row.p99_latency_us))}
              </Td>
              <Td align="right" mono>
                {row.operations_failed}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Th = ({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) => (
  <th
    className={`px-6 py-2.5 font-medium ${align === "right" ? "text-right" : "text-left"}`}
  >
    {children}
  </th>
);

const Td = ({
  children,
  align = "left",
  mono = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  mono?: boolean;
}) => (
  <td
    className={[
      "px-6 py-2.5 text-neutral-700 dark:text-neutral-300",
      align === "right" ? "text-right" : "text-left",
      mono ? "font-mono tabular-nums text-neutral-900 dark:text-neutral-100" : "",
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
  </td>
);
