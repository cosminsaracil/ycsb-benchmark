import React, { useState } from "react";
import { Info, Database, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SQL_WORKLOAD_INFO, INFO_SECTION_SQL_METRICS } from "@/utils/constants";
import type { SQLInformationSectionProps } from "../types";

export const SQLInformationSection = ({
  currentTheme,
}: SQLInformationSectionProps) => {
  const [activeTab, setActiveTab] = useState<"workloads" | "metrics">(
    "workloads",
  );

  return (
    <div className={"space-y-6"}>
      {/* Information Card */}
      <Card
        className={cn(
          "shadow-sm",
          currentTheme === "dark" ? "border-gray-800/60" : "border-gray-200/60",
          currentTheme === "dark"
            ? "bg-gradient-to-br from-gray-950 to-gray-900"
            : "bg-gradient-to-br from-gray-50 to-gray-100",
        )}
      >
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    currentTheme === "dark"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-500/10 text-blue-600",
                  )}
                >
                  <Info className="w-4 h-4" />
                </div>
                SQL Benchmark Information
              </CardTitle>
              <CardDescription className="text-sm max-w-2xl">
                Understanding SQL workload characteristics and performance
                metrics
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={cn(
                "rounded-xl border p-4",
                currentTheme === "dark"
                  ? "border-gray-800/60 bg-gray-900/40"
                  : "border-gray-200/60 bg-white/70",
              )}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Database className="w-4 h-4" />
                Databases
              </div>
              <div className="mt-3 text-2xl font-bold">2</div>
              <p className="mt-1 text-sm text-muted-foreground">
                PostgreSQL and MySQL are compared side by side.
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border p-4",
                currentTheme === "dark"
                  ? "border-gray-800/60 bg-gray-900/40"
                  : "border-gray-200/60 bg-white/70",
              )}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Clock className="w-4 h-4" />
                Workloads
              </div>
              <div className="mt-3 text-2xl font-bold">4</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Join-heavy through mixed OLTP+OLAP benchmark shapes.
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border p-4",
                currentTheme === "dark"
                  ? "border-gray-800/60 bg-gray-900/40"
                  : "border-gray-200/60 bg-white/70",
              )}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Info className="w-4 h-4" />
                Metrics
              </div>
              <div className="mt-3 text-2xl font-bold">4</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Throughput plus average and tail latency views.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Tab Switcher */}
          <div
            className={cn(
              "inline-flex rounded-lg p-1 mb-6",
              currentTheme === "dark" ? "bg-gray-800/50" : "bg-gray-100",
            )}
          >
            <button
              onClick={() => setActiveTab("workloads")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === "workloads"
                  ? currentTheme === "dark"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : currentTheme === "dark"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Workloads
            </button>
            <button
              onClick={() => setActiveTab("metrics")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === "metrics"
                  ? currentTheme === "dark"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : currentTheme === "dark"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Metrics
            </button>
          </div>

          {/* Workloads Tab */}
          {activeTab === "workloads" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(SQL_WORKLOAD_INFO).map(
                ([key, { name, desc }]) => (
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
                          <p className="text-sm text-muted-foreground mt-1">
                            {desc}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Why it matters:{" "}
                          </span>
                          {key === "W1" &&
                            "This workload is a strong proxy for join planning quality and key lookup efficiency."}
                          {key === "W2" &&
                            "This workload emphasizes scans and reductions, making aggregation cost easier to compare."}
                          {key === "W3" &&
                            "This workload exposes transaction overhead, contention, and commit-path latency."}
                          {key === "W4" &&
                            "This workload mixes read and analytical pressure, making latency stability visible."}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === "metrics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(INFO_SECTION_SQL_METRICS).map(
                ([
                  key,
                  { label, unit, description, interpretation, badge },
                ]) => (
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
                          <p className="text-xs text-muted-foreground mt-1">
                            SQL metric
                          </p>
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
                        {key === "throughput_ops_sec" &&
                          "Use this when you want to understand how much SQL load the system can sustain per second."}
                        {key === "avg_latency_us" &&
                          "Use this to judge the typical response time users will feel during steady-state operation."}
                        {key === "p95_latency_us" &&
                          "Use this to understand the tail of the latency distribution under moderate contention."}
                        {key === "p99_latency_us" &&
                          "Use this to spot worst-case behavior and latency spikes that affect outlier requests."}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
