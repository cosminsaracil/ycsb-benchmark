"use client";

import { useMemo, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CircleAlert, Sparkles } from "lucide-react";
import { useCurrentTheme } from "@/utils/useCurrentTheme";
import {
  DB_COLORS,
  NIVO_THEME_DARK,
  NIVO_THEME_LIGHT,
  SQL_METRICS,
  SQL_WORKLOADS,
} from "@/utils/constants";
import { useGetAllSQLResults } from "@/utils/hooks/api/sql/useGetAllResults";
import { useAISummary } from "@/utils/hooks/api/sql/useAISummary";
import { SQLGraphConfiguration } from "./components/SQLGraphConfiguration";
import { SQLInformationSection } from "./components/SQLInformationSection";
import { SQLSummaryCards } from "./components/SQLSummaryCards";

export default function SQLResults() {
  const { data: results, isLoading, error } = useGetAllSQLResults();
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
  } = useAISummary();
  const currentTheme = useCurrentTheme();

  const toNumber = (value: string | number | null | undefined) =>
    Number(value ?? 0);

  const formatNumber = (value: string | number, decimals = 2) =>
    toNumber(value).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const chartData = useMemo(() => {
    if (!results?.data) {
      return [];
    }

    return selectedWorkloads.map((workload) => {
      const row: Record<string, string | number> = {
        workload: `SQL-${workload}`,
      };
      ["postgres", "mysql"].forEach((database) => {
        const entry = results.data.find(
          (item) =>
            item.workload === `SQL-${workload}` && item.database === database,
        );
        row[database] = entry
          ? toNumber(entry[selectedMetric as keyof typeof entry])
          : 0;
      });
      return row;
    });
  }, [results, selectedMetric, selectedWorkloads]);

  const lineData = useMemo(() => {
    if (!results?.data || chartType !== "line") return [];
    return ["postgres", "mysql"].map((db) => ({
      id: db,
      color: DB_COLORS[db as keyof typeof DB_COLORS],
      data: selectedWorkloads.map((workload) => {
        const entry = results.data.find(
          (item) => item.workload === `SQL-${workload}` && item.database === db,
        );
        const value = entry
          ? toNumber(entry[selectedMetric as keyof typeof entry])
          : 0;
        return {
          x: `SQL-${workload}`,
          y: value,
        };
      }),
    }));
  }, [results, selectedMetric, selectedWorkloads, chartType]);

  const summaryStats = useMemo(() => {
    if (!results?.data) return null;
    const calcStats = (db: string) => {
      const values = results.data
        .filter(
          (d) =>
            d.database === db &&
            selectedWorkloads.some((w) => d.workload === `SQL-${w}`),
        )
        .map((d) => toNumber(d[selectedMetric as keyof typeof d]))
        .filter((v) => !isNaN(v) && v > 0);
      if (values.length === 0) return { avg: 0, min: 0, max: 0 };
      return {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };
    return { postgres: calcStats("postgres"), mysql: calcStats("mysql") };
  }, [results, selectedMetric, selectedWorkloads]);

  const metricInfo = SQL_METRICS[selectedMetric as keyof typeof SQL_METRICS];
  const postgresWins = summaryStats
    ? metricInfo.higher
      ? summaryStats.postgres.avg > summaryStats.mysql.avg
      : summaryStats.postgres.avg < summaryStats.mysql.avg
    : false;

  const theme = currentTheme === "dark" ? NIVO_THEME_DARK : NIVO_THEME_LIGHT;

  const renderTooltip = (
    title: string,
    seriesLabel: string,
    seriesColor: string,
    value: string | number,
  ) => (
    <div
      style={{
        padding: "10px 14px",
        background: currentTheme === "dark" ? "#1f2937" : "#ffffff",
        border: `1px solid ${currentTheme === "dark" ? "#374151" : "#e5e7eb"}`,
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: seriesColor,
            marginRight: 8,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {seriesLabel}:
        </span>
        <span
          style={{
            marginLeft: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "monospace",
          }}
        >
          {formatNumber(value, 2)} {metricInfo?.unit}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          Loading SQL benchmark results...
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Unable to load SQL benchmark results</div>
      </div>
    );
  }

  if (results.data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 p-6 md:p-10 flex items-center justify-center">
        <Card className="max-w-2xl w-full p-8 shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
          <CardHeader className="px-0 pt-0 text-center space-y-3">
            <Badge variant="outline" className="mx-auto px-3 py-1">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Tier 2 SQL-Specific Workloads
            </Badge>
            <CardTitle className="text-3xl">No SQL results yet</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 text-center space-y-4 text-muted-foreground">
            <p>
              The SQL results summary has not been generated yet. Start the SQL
              benchmark from the dashboard to create the summary file.
            </p>
            <p>
              Once the benchmark finishes, this page will show PostgreSQL and
              MySQL comparisons for SQL-W1 through SQL-W4.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => {
                generateSummary(results);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              disabled={isSummaryLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isSummaryLoading ? "Generating Summary..." : "Get AI Summary"}
            </Button>
          </div>
        </div>

        {(isSummaryLoading || summaryError || summary) && (
          <Card className="shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-violet-50/80 via-blue-50/60 to-gray-100 dark:from-gray-950 dark:via-violet-950/20 dark:to-gray-900 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                AI Benchmark Summary
                {isFromCache && (
                  <span className="relative inline-flex items-center group">
                    <CircleAlert className="w-4 h-4 text-amber-500" />
                    <span className="pointer-events-none absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs font-normal text-amber-900 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:border-amber-800/60 dark:bg-amber-950 dark:text-amber-100">
                      Showing cached summary. Check console for AI request
                      details.
                    </span>
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSummaryLoading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  <div className="relative w-20 h-20">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600"
                      style={{ animation: "spin 2.4s linear infinite" }}
                    />
                    <div
                      className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-pink-500"
                      style={{ animation: "spin 1.6s linear reverse infinite" }}
                    />
                    <div
                      className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{
                        animation:
                          "pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Analyzing throughput and latency trends...
                  </p>
                  <style>{`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}

              {summaryError && !isSummaryLoading && !summary && (
                <div className="rounded-xl border border-red-300/70 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20 p-4">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Failed to generate AI summary
                  </p>
                  <p className="text-xs mt-2 text-red-600 dark:text-red-400">
                    {summaryError}
                  </p>
                </div>
              )}

              {summary && !isSummaryLoading && (
                <div className="rounded-xl p-[1px] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 shadow-[0_0_0_1px_rgba(139,92,246,0.08)]">
                  <div className="rounded-[11px] bg-white/85 dark:bg-gray-900/80 p-5">
                    <p className="text-sm leading-7 whitespace-pre-wrap text-gray-800 dark:text-gray-100">
                      {summary}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <SQLGraphConfiguration
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
          selectedWorkloads={selectedWorkloads}
          setSelectedWorkloads={setSelectedWorkloads}
          chartType={chartType}
          setChartType={setChartType}
          currentTheme={currentTheme}
          postgresWins={postgresWins}
        />

        <SQLSummaryCards
          summaryStats={summaryStats}
          postgresWins={postgresWins}
          currentTheme={currentTheme}
          formatNumber={formatNumber}
          metricLabel={metricInfo?.label}
          metricUnit={metricInfo?.unit}
        />

        <Card className="p-8 shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
          <CardHeader className="px-0 pt-0">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  {metricInfo?.label} Comparison
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {metricInfo?.higher
                    ? "Higher values indicate better performance"
                    : "Lower values indicate better performance"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div style={{ height: 420 }}>
              {chartType === "bar" ? (
                <ResponsiveBar
                  data={chartData}
                  keys={["postgres", "mysql"]}
                  indexBy="workload"
                  margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
                  padding={0.3}
                  groupMode="grouped"
                  colors={({ id }) => DB_COLORS[id as keyof typeof DB_COLORS]}
                  theme={theme}
                  axisBottom={{
                    tickRotation: 0,
                  }}
                  axisLeft={{
                    legend: metricInfo?.unit,
                    legendPosition: "middle",
                    legendOffset: -55,
                    format: (value) => formatNumber(value, 0),
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  label={(d) => formatNumber(d.value ?? 0, 2)}
                  legends={[
                    {
                      dataFrom: "keys",
                      anchor: "bottom-right",
                      direction: "row",
                      justify: false,
                      translateX: 10,
                      translateY: 52,
                      itemsSpacing: 12,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: "left-to-right",
                      symbolSize: 12,
                    },
                  ]}
                  tooltip={({ id, value, indexValue }) =>
                    renderTooltip(
                      String(indexValue),
                      String(id),
                      DB_COLORS[id as keyof typeof DB_COLORS],
                      value ?? 0,
                    )
                  }
                />
              ) : (
                <ResponsiveLine
                  data={lineData}
                  margin={{ top: 50, right: 140, bottom: 70, left: 90 }}
                  xScale={{ type: "point" }}
                  yScale={{
                    type: "linear",
                    min: "auto",
                    max: "auto",
                    stacked: false,
                    reverse: false,
                  }}
                  theme={theme}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    legend: "Workload",
                    legendPosition: "middle",
                    legendOffset: 50,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 8,
                    legend: metricInfo?.unit,
                    legendPosition: "middle",
                    legendOffset: -70,
                    format: (value) => formatNumber(value, 0),
                  }}
                  pointSize={8}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  pointLabelYOffset={-12}
                  enableArea={false}
                  useMesh={true}
                  legends={[
                    {
                      anchor: "bottom-right",
                      direction: "column",
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: "left-to-right",
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: "circle",
                      symbolBorderColor: "rgba(0, 0, 0, .5)",
                      effects: [
                        {
                          on: "hover",
                          style: {
                            itemBackground: "rgba(0, 0, 0, .03)",
                            itemOpacity: 1,
                          },
                        },
                      ],
                    },
                  ]}
                  tooltip={({ point }) =>
                    renderTooltip(
                      String(point.data.x),
                      String(point.seriesId),
                      point.seriesColor,
                      point.data.y as number,
                    )
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl">Raw SQL Benchmark Results</CardTitle>
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
                      {formatNumber(row.throughput_ops_sec)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatNumber(row.avg_latency_us)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatNumber(row.p95_latency_us)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatNumber(row.p99_latency_us)}
                    </td>
                    <td className="py-3 pr-4">{row.operations_failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <SQLInformationSection currentTheme={currentTheme} />
      </div>
    </div>
  );
}
