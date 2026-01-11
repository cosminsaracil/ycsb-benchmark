"use client";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { useCurrentTheme } from "@/utils/useCurrentTheme";
import { WORKLOADS, METRICS, DB_COLORS } from "@/utils/constants";
import { GraphConfiguration } from "./components/GraphConfiguration";
import { SummaryCards } from "./components/SummaryCards";
import { GraphCard } from "./components/GraphCard";
import { InformationSection } from "./components/InformationSection";

export default function EnhancedYCSBDashboard() {
  const { data: results } = useGetAllYCSBResults();

  const [selectedMetric, setSelectedMetric] = useState("throughput");
  const [selectedWorkloads, setSelectedWorkloads] =
    useState<string[]>(WORKLOADS);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const currentTheme = useCurrentTheme();

  const chartData = useMemo(() => {
    if (!results?.data) return [];
    return selectedWorkloads.map((workload) => {
      const workloadData: Record<string, string | number> = {
        workload: `Workload ${workload}`,
      };
      ["redis", "mongodb"].forEach((db) => {
        const entry = results.data.find(
          (d) => d.database === db && d.workload === workload
        );
        const value = entry?.[selectedMetric as keyof typeof entry];
        workloadData[db] =
          value && value !== "" ? parseFloat(value as string) : 0;
      });
      return workloadData;
    });
  }, [results, selectedMetric, selectedWorkloads]);

  const lineData = useMemo(() => {
    if (!results?.data || chartType !== "line") return [];
    return ["redis", "mongodb"].map((db) => ({
      id: db,
      color: DB_COLORS[db as keyof typeof DB_COLORS],
      data: selectedWorkloads.map((workload) => {
        const entry = results.data.find(
          (d) => d.database === db && d.workload === workload
        );
        const value = entry?.[selectedMetric as keyof typeof entry];
        return {
          x: `WL ${workload}`,
          y: value && value !== "" ? parseFloat(value as string) : 0,
        };
      }),
    }));
  }, [results, selectedMetric, selectedWorkloads, chartType]);

  const summaryStats = useMemo(() => {
    if (!results?.data) return null;
    const calcStats = (db: string) => {
      const values = results.data
        .filter(
          (d) => d.database === db && selectedWorkloads.includes(d.workload)
        )
        .map((d) => parseFloat(d[selectedMetric as keyof typeof d] as string))
        .filter((v) => !isNaN(v) && v > 0);
      if (values.length === 0) return { avg: 0, min: 0, max: 0 };
      return {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };
    return { redis: calcStats("redis"), mongodb: calcStats("mongodb") };
  }, [results, selectedMetric, selectedWorkloads]);

  const metricInfo = METRICS[selectedMetric as keyof typeof METRICS];
  const redisWins = summaryStats
    ? metricInfo.higher
      ? summaryStats.redis.avg > summaryStats.mongodb.avg
      : summaryStats.redis.avg < summaryStats.mongodb.avg
    : false;

  const formatNumber = (num: number, decimals = 2) => {
    if (num === 0) return "0";
    if (num >= 1000) {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
    }
    return num.toFixed(decimals);
  };

  if (!results) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          Loading benchmark results...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
        </div>

        {/* Controls */}
        <GraphConfiguration
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
          selectedWorkloads={selectedWorkloads}
          setSelectedWorkloads={setSelectedWorkloads}
          chartType={chartType}
          setChartType={setChartType}
          currentTheme={currentTheme}
          redisWins={redisWins}
        />

        {/* Summary Cards */}

        <SummaryCards
          summaryStats={summaryStats}
          redisWins={redisWins}
          currentTheme={currentTheme}
          formatNumber={formatNumber}
          metricInfo={metricInfo}
        />

        {/* Main Chart */}
        <GraphCard
          currentTheme={currentTheme}
          chartType={chartType}
          chartData={chartData}
          metricInfo={metricInfo}
          formatNumber={formatNumber}
          lineData={lineData}
        />

        {/* Workload Info */}
        <InformationSection currentTheme={currentTheme} />
      </div>
    </div>
  );
}
