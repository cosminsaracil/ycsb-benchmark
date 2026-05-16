"use client";
import { useEffect, useState } from "react";

import { Activity } from "lucide-react";
import { useGetAllYCSBResults, useYCSBAISummary } from "@/hooks/api/ycsb";
import { RunSelector } from "@/components/features/shared/RunSelector";
import { useCurrentTheme } from "@/utils/useCurrentTheme";
import { METRICS, WORKLOADS } from "@/utils/ycsb-constants";
import {
  AISummaryButton,
  AISummaryCard,
} from "@/components/features/shared/AISummaryCard";
import { BenchmarkGraphCard } from "@/components/features/shared/BenchmarkGraphCard";
import { BenchmarkGraphConfiguration } from "@/components/features/shared/BenchmarkGraphConfiguration";
import { BenchmarkSummaryCards } from "@/components/features/shared/BenchmarkSummaryCards";
import { useBenchmarkChartData } from "@/components/features/shared/useBenchmarkChartData";
import { formatBenchmarkNumber } from "@/components/features/shared/format";
import { InformationSection } from "./components/InformationSection";

const DATABASES = ["redis", "mongodb"] as const;
type DbKey = (typeof DATABASES)[number];

export default function EnhancedYCSBDashboard() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: results, isFetching } = useGetAllYCSBResults(selectedRunId);
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    isFromCache,
    generateSummary,
    clearSummary,
  } = useYCSBAISummary();

  useEffect(() => {
    clearSummary();
  }, [selectedRunId, clearSummary]);

  const [selectedMetric, setSelectedMetric] = useState("throughput");
  const [selectedWorkloads, setSelectedWorkloads] =
    useState<string[]>(WORKLOADS);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const currentTheme = useCurrentTheme();

  const metricInfo = METRICS[selectedMetric as keyof typeof METRICS];

  const { chartData, lineData, summaryStats } = useBenchmarkChartData<DbKey>({
    rows: results?.data,
    databases: DATABASES as unknown as DbKey[],
    workloads: selectedWorkloads,
    metricField: selectedMetric,
    workloadLabel: (w) => w,
  });

  const redisAvg = summaryStats.redis.avg;
  const mongoAvg = summaryStats.mongodb.avg;
  const redisWins = metricInfo.higher
    ? redisAvg > mongoAvg
    : redisAvg < mongoAvg && redisAvg > 0;

  const hasData = !!results && results.data.length > 0;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 py-2">
      <ResultsHeader
        eyebrow="Tier 1 — NoSQL"
        title="YCSB performance"
        description="Performance analysis of Redis and MongoDB across YCSB workload patterns A–F."
        action={
          hasData ? (
            <AISummaryButton
              isLoading={isSummaryLoading}
              onGenerate={() => generateSummary(results)}
            />
          ) : null
        }
      />

      {!results && <ResultsSkeleton />}

      {results && !hasData && (
        <EmptyResults
          message={
            selectedRunId
              ? "This historical run has no summary data."
              : "Run the YCSB benchmark from the dashboard to generate results."
          }
        >
          <RunSelector
            module="ycsb"
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
            metricOptions={Object.entries(METRICS).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            workloadOptions={[
              { value: WORKLOADS.join(","), label: "All workloads" },
              { value: "A,B,C", label: "A, B, C" },
              { value: "D,E,F", label: "D, E, F" },
              ...WORKLOADS.map((w) => ({ value: w, label: `Workload ${w}` })),
            ]}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            selectedWorkloads={selectedWorkloads}
            setSelectedWorkloads={setSelectedWorkloads}
            chartType={chartType}
            setChartType={setChartType}
            currentTheme={currentTheme}
            leaderLabel={redisWins ? "Redis" : "MongoDB"}
            leaderTone={redisWins ? "destructive" : "default"}
            headerRight={
              <RunSelector
                module="ycsb"
                selectedRunId={selectedRunId}
                onChange={setSelectedRunId}
                isFetching={isFetching}
              />
            }
          />

          <BenchmarkSummaryCards
            entries={[
              {
                key: "redis",
                label: "Redis",
                stats: summaryStats.redis,
                isWinner: redisWins,
              },
              {
                key: "mongodb",
                label: "MongoDB",
                stats: summaryStats.mongodb,
                isWinner: !redisWins,
              },
            ]}
            formatNumber={formatBenchmarkNumber}
            metricUnit={metricInfo?.unit}
          />

          <BenchmarkGraphCard
            currentTheme={currentTheme}
            chartType={chartType}
            chartData={chartData}
            lineData={lineData}
            keys={["redis", "mongodb"]}
            indexBy="workload"
            metricInfo={metricInfo}
            formatNumber={formatBenchmarkNumber}
          />
        </>
      )}

      <InformationSection currentTheme={currentTheme} />
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
        <Activity className="w-3 h-3" strokeWidth={1.75} />
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
    <div className="h-[480px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 animate-pulse" />
  </div>
);
