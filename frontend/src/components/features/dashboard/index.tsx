"use client";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { ROUTES } from "@/utils/routes";
import {
  useBenchmarkStatus,
  useGetAllYCSBResults,
  useGetDBStatusConnections,
  useStartBenchmark,
} from "@/hooks/api/ycsb";
import { BenchmarkCard } from "./components/BenchmarkCard";
import { ProgressCard } from "./components/ProgressCard";
import { useSQLBenchmarkStatus, useStartSQLBenchmark } from "@/hooks/api/sql";

export default function Dashboard() {
  // Fetch YCSB benchmark results
  const {
    data: ycsbData,
    isFetching: isFetchingYCSB,
    error: errorYCSB,
    refetch: refetchYCSB,
  } = useGetAllYCSBResults();

  // Fetch database connection status
  const {
    data: ycsbDBStatus,
    isFetching: isFetchingStatus,
    error: errorStatus,
    refetch: refetchDBStatus,
  } = useGetDBStatusConnections();

  const {
    status: sqlBenchmarkStatus,
    error: sqlStatusError,
    refetch: refetchSQLStatus,
  } = useSQLBenchmarkStatus();

  // Benchmark control hooks
  const {
    startBenchmark,
    isLoading: isStarting,
    error: startError,
  } = useStartBenchmark();

  const {
    startSQLBenchmark,
    isLoading: isStartingSQL,
    error: startSQLError,
  } = useStartSQLBenchmark();

  const { status: benchmarkStatus, error: statusError } = useBenchmarkStatus();

  // Refetch results when benchmark completes
  useEffect(() => {
    if (!benchmarkStatus.isRunning && benchmarkStatus.progress === 100) {
      setTimeout(() => {
        refetchYCSB();
      }, 2000);
    }
  }, [benchmarkStatus.isRunning, benchmarkStatus.progress, refetchYCSB]);

  // Loading state — skeleton matches layout instead of spinner
  if (isFetchingYCSB || isFetchingStatus) {
    return <DashboardSkeleton />;
  }

  // Error state — inline, not a full-screen block
  if (errorYCSB || errorStatus) {
    return (
      <Shell>
        <DashboardHeader />
        <InlineError message="Could not load benchmark data." />
      </Shell>
    );
  }

  // No data — clean composition rather than a centered message
  if (!ycsbData?.data || !ycsbDBStatus) {
    return (
      <Shell>
        <DashboardHeader />
        <EmptyState />
      </Shell>
    );
  }

  const resultsYCSB = ycsbData.data;
  const hasResults = resultsYCSB.length > 0;

  const ycsbConnectionStatus = {
    redis: ycsbDBStatus.redis,
    mongo: ycsbDBStatus.mongo,
  };

  const sqlConnectionStatus = {
    postgres: ycsbDBStatus.postgres,
    mysql: ycsbDBStatus.mysql,
  };

  const handleStartYCSBBenchmark = async () => {
    try {
      await startBenchmark();
      console.log("YCSB benchmark started successfully");
    } catch (err) {
      console.error("Failed to start benchmark:", err);
    }
  };

  const handleStartSQLBenchmark = async () => {
    try {
      await startSQLBenchmark();
      refetchSQLStatus();
    } catch (err) {
      console.error("Failed to start SQL benchmark:", err);
    }
  };

  const ycsbError = startError || statusError;
  const sqlError = startSQLError || sqlStatusError;

  return (
    <Shell>
      <DashboardHeader />

      {benchmarkStatus.isRunning && (
        <ProgressCard benchmarkStatus={benchmarkStatus} />
      )}

      {sqlBenchmarkStatus.isRunning && (
        <ProgressCard
          benchmarkStatus={sqlBenchmarkStatus}
          title="SQL benchmark in progress"
          databaseLabels={["PostgreSQL", "MySQL"]}
          completedWorkloadsLabel="workloads"
          totalWorkloads={8}
        />
      )}

      {ycsbError && <InlineError message={`YCSB: ${ycsbError}`} />}
      {sqlError && <InlineError message={`SQL: ${sqlError}`} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BenchmarkCard
          title="YCSB"
          accent="ycsb"
          tagline="Tier 1 — NoSQL"
          isReady={hasResults}
          dashboardLink={ROUTES.YCSB}
          handleStartBenchmark={handleStartYCSBBenchmark}
          databaseStatus={ycsbConnectionStatus}
          onCheckConnection={refetchDBStatus}
          isRunning={benchmarkStatus.isRunning}
          isStarting={isStarting}
        />
        <BenchmarkCard
          title="SQL Benchmark"
          accent="sql"
          tagline="Tier 2 — Relational"
          isReady={true}
          dashboardLink={ROUTES.SQL}
          handleStartBenchmark={handleStartSQLBenchmark}
          databaseStatus={sqlConnectionStatus}
          onCheckConnection={refetchSQLStatus}
          isRunning={sqlBenchmarkStatus.isRunning}
          isStarting={isStartingSQL}
        />
      </div>
    </Shell>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 py-2">
    {children}
  </div>
);

const DashboardHeader = () => (
  <div className="flex flex-col gap-1.5 pb-2">
    <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
      Overview
    </div>
    <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
      Benchmarks
    </h1>
    <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-prose">
      Run NoSQL (YCSB) and relational (SQL) workloads. Check database connections before starting.
    </p>
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

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 px-6 py-12 text-center">
    <p className="text-sm text-neutral-600 dark:text-neutral-400">
      No data available yet.
    </p>
  </div>
);

const DashboardSkeleton = () => (
  <Shell>
    <div className="flex flex-col gap-1.5 pb-2">
      <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mt-1" />
      <div className="h-4 w-80 max-w-full bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mt-1" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </Shell>
);

const SkeletonCard = () => (
  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-20 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
          <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-5 w-16 bg-neutral-100 dark:bg-neutral-900 rounded-full animate-pulse" />
    </div>
    <div className="h-12 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 animate-pulse" />
    <div className="flex flex-col gap-1.5">
      <div className="h-9 rounded-md bg-neutral-50 dark:bg-neutral-900/60 animate-pulse" />
      <div className="h-9 rounded-md bg-neutral-50 dark:bg-neutral-900/60 animate-pulse" />
    </div>
    <div className="flex gap-2 mt-1">
      <div className="flex-1 h-9 rounded-md bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
      <div className="flex-1 h-9 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    </div>
  </div>
);
