"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-8">
          <Badge variant="outline" className="mb-3 px-3 py-1">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Tier 2 SQL-Specific Workloads
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Comprehensive performance analysis of PostgreSQL and MySQL across
            join-heavy, aggregation-heavy, transaction-heavy, and mixed workload
            patterns.
          </p>
          {hasData && (
            <AISummaryButton
              isLoading={isSummaryLoading}
              onGenerate={() => generateSummary(results)}
            />
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse text-muted-foreground">
              Loading SQL benchmark results...
            </div>
          </div>
        )}

        {error && (
          <Card className="p-8 text-center border-red-300/70 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20">
            <p className="text-red-700 dark:text-red-300 font-medium">
              Unable to load SQL benchmark results
            </p>
          </Card>
        )}

        {isEmpty && (
          <Card className="p-8 shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <CardHeader className="px-0 pt-0 text-center space-y-3">
              <CardTitle className="text-2xl">No SQL results yet</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-5 text-muted-foreground">
              <p className="text-center">
                {selectedRunId
                  ? "This historical run has no summary data."
                  : "Run the SQL benchmark from the dashboard to generate results."}
              </p>
              <div className="mx-auto max-w-md">
                <RunSelector
                  module="sql"
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
              description="Customize your SQL benchmark view and analysis parameters"
              metricOptions={Object.entries(SQL_METRICS).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
              workloadOptions={[
                { value: SQL_WORKLOADS.join(","), label: "All Workloads" },
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
              currentTheme={currentTheme}
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

            <Card className="shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">
                  Raw SQL Benchmark Results
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 pr-4">Database</th>
                      <th className="py-3 pr-4">Workload</th>
                      <th className="py-3 pr-4">Throughput</th>
                      <th className="py-3 pr-4">Avg Latency</th>
                      <th className="py-3 pr-4">P95</th>
                      <th className="py-3 pr-4">P99</th>
                      <th className="py-3 pr-4">Failures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.data.map((row) => (
                      <tr
                        key={`${row.database}-${row.workload}`}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-3 pr-4">{row.database}</td>
                        <td className="py-3 pr-4">{row.workload}</td>
                        <td className="py-3 pr-4">
                          {formatBenchmarkNumber(row.throughput_ops_sec)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatBenchmarkNumber(row.avg_latency_us)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatBenchmarkNumber(row.p95_latency_us)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatBenchmarkNumber(row.p99_latency_us)}
                        </td>
                        <td className="py-3 pr-4">{row.operations_failed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        <SQLInformationSection currentTheme={currentTheme} />
      </div>
    </div>
  );
}
