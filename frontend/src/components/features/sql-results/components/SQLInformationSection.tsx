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

export const SQLInformationSection = ({
  currentTheme,
}: {
  currentTheme: string;
}) => {
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
              <CardDescription className="text-sm">
                Understanding SQL workload characteristics and performance
                metrics
              </CardDescription>
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
            <div className="space-y-4">
              {Object.entries(SQL_WORKLOAD_INFO).map(
                ([key, { name, desc }]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      currentTheme === "dark"
                        ? "border-gray-800/50 hover:border-gray-700/50 bg-gray-900/30"
                        : "border-gray-200/50 hover:border-gray-300/50 bg-gray-50/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          SQL-{key}:{" "}
                          <span className="text-primary font-bold">{name}</span>
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === "metrics" && (
            <div className="space-y-4">
              {Object.entries(INFO_SECTION_SQL_METRICS).map(
                ([
                  key,
                  { label, unit, description, interpretation, badge },
                ]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      currentTheme === "dark"
                        ? "border-gray-800/50 hover:border-gray-700/50 bg-gray-900/30"
                        : "border-gray-200/50 hover:border-gray-300/50 bg-gray-50/30",
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{label}</h4>
                        <Badge variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {unit}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            interpretation.includes("Higher")
                              ? "text-green-600 dark:text-green-400"
                              : "text-amber-600 dark:text-amber-400",
                          )}
                        >
                          {interpretation}
                        </span>
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
