"use client";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-8">
          <Badge variant="outline" className="mb-3 px-3 py-1">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            YCSB Benchmark Suite
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive performance analysis of Redis and MongoDB across
            multiple workload patterns
          </p>
          {hasData && (
            <AISummaryButton
              isLoading={isSummaryLoading}
              onGenerate={() => generateSummary(results)}
            />
          )}
        </div>

        {!results && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse text-muted-foreground">
              Loading benchmark results...
            </div>
          </div>
        )}

        {results && !hasData && (
          <Card className="p-8 shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <CardHeader className="px-0 pt-0 text-center space-y-3">
              <CardTitle className="text-2xl">No YCSB results yet</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-5 text-muted-foreground">
              <p className="text-center">
                {selectedRunId
                  ? "This historical run has no summary data."
                  : "Run the YCSB benchmark from the dashboard to generate results."}
              </p>
              <div className="mx-auto max-w-md">
                <RunSelector
                  module="ycsb"
                  selectedRunId={selectedRunId}
                  onChange={setSelectedRunId}
                  isFetching={isFetching}
                />
              </div>
            </CardContent>
          </Card>
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
                { value: WORKLOADS.join(","), label: "All Workloads" },
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
              currentTheme={currentTheme}
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
    </div>
  );
}
