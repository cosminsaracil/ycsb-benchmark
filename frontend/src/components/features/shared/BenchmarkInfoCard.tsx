"use client";
import React, { useState } from "react";
import { Database, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentTheme?: string;
  title: string;
  description: string;
  headerExtras?: React.ReactNode;
  workloadsContent: React.ReactNode;
  metricsContent: React.ReactNode;
  footer?: React.ReactNode;
};

export const BenchmarkInfoCard = ({
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
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="px-6 pt-6 pb-5 space-y-4">
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
              Reference
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {title}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-prose">
              {description}
            </p>
          </div>
          {headerExtras}
        </div>

        <div className="px-6 pb-6">
          <div className="inline-flex border-b border-neutral-200 dark:border-neutral-800 mb-5">
            <TabButton
              active={activeTab === "workloads"}
              onClick={() => setActiveTab("workloads")}
              icon={Database}
            >
              Workloads
            </TabButton>
            <TabButton
              active={activeTab === "metrics"}
              onClick={() => setActiveTab("metrics")}
              icon={Clock}
            >
              Metrics
            </TabButton>
          </div>

          {activeTab === "workloads" ? workloadsContent : metricsContent}
        </div>
      </div>

      {footer}
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Database;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "relative inline-flex items-center gap-2 px-3 py-2.5 -mb-px text-sm font-medium",
      "border-b transition-colors duration-150",
      active
        ? "border-neutral-900 dark:border-neutral-50 text-neutral-900 dark:text-neutral-50"
        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
    )}
  >
    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
    {children}
  </button>
);
