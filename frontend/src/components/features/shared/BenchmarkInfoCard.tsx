"use client";
import React, { useState } from "react";
import { Info, Database, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  currentTheme: string;
  title: string;
  description: string;
  headerExtras?: React.ReactNode;
  workloadsContent: React.ReactNode;
  metricsContent: React.ReactNode;
  footer?: React.ReactNode;
};

export const BenchmarkInfoCard = ({
  currentTheme,
  title,
  description,
  headerExtras,
  workloadsContent,
  metricsContent,
  footer,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"workloads" | "metrics">(
    "workloads",
  );

  return (
    <div className="space-y-6">
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
                {title}
              </CardTitle>
              <CardDescription className="text-sm max-w-2xl">
                {description}
              </CardDescription>
            </div>
          </div>
          {headerExtras}
        </CardHeader>

        <CardContent className="pt-0">
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

          {activeTab === "workloads" ? workloadsContent : metricsContent}
        </CardContent>
      </Card>

      {footer}
    </div>
  );
};
