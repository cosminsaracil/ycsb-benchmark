"use client";
import { useEffect } from "react";
import { ROUTES } from "@/utils/routes";
import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { useGetDBStatusConnections } from "@/utils/hooks/api/ycsb/useGetStatusConnections";
import { BenchmarkCard } from "./components/BenchmarkCard";
import {
  useStartBenchmark,
  useBenchmarkStatus,
} from "@/utils/hooks/api/ycsb/useBenchmark";

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

  // Benchmark control hooks
  const {
    startBenchmark,
    isLoading: isStarting,
    error: startError,
  } = useStartBenchmark();

  const { status: benchmarkStatus, error: statusError } = useBenchmarkStatus();

  // Refetch results when benchmark completes
  useEffect(() => {
    if (!benchmarkStatus.isRunning && benchmarkStatus.progress === 100) {
      setTimeout(() => {
        refetchYCSB();
      }, 2000);
    }
  }, [benchmarkStatus.isRunning, benchmarkStatus.progress, refetchYCSB]);

  // Loading states
  if (isFetchingYCSB || isFetchingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Error states
  if (errorYCSB || errorStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading data</div>
      </div>
    );
  }

  // No data states
  if (!ycsbData?.data || !ycsbDBStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  const resultsYCSB = ycsbData.data;
  const hasResults = resultsYCSB.length > 0;

  const handleStartYCSBBenchmark = async () => {
    try {
      await startBenchmark();
      console.log("YCSB benchmark started successfully");
    } catch (err) {
      console.error("Failed to start benchmark:", err);
    }
  };

  const handleStartSQLBenchmark = () => {
    console.log("Start SQL benchmark clicked");
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Benchmarks</h1>

      {/* Enhanced Benchmark Progress Section */}
      {benchmarkStatus.isRunning && (
        <div className="w-full max-w-6xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-xl p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
              </div>
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Benchmark in Progress
              </h2>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 font-mono">
                {benchmarkStatus.progress.toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Overall Progress
              </div>
            </div>
          </div>

          {/* Main Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out flex items-center justify-end px-3"
                style={{ width: `${benchmarkStatus.progress}%` }}
              >
                {benchmarkStatus.progress > 10 && (
                  <span className="text-xs font-semibold text-white">
                    {benchmarkStatus.progress.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Redis/MongoDB Split Indicator */}
            <div className="flex mt-2 text-xs text-blue-700 dark:text-blue-300">
              <div className="flex-1 text-left">
                <span className="font-medium">Redis (0-50%)</span>
              </div>
              <div className="flex-1 text-right">
                <span className="font-medium">MongoDB (50-100%)</span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white dark:bg-blue-900/30 rounded-lg p-5 space-y-3">
            {benchmarkStatus.currentDatabase && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Database:
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                  {benchmarkStatus.currentDatabase}
                </span>
              </div>
            )}

            {benchmarkStatus.currentWorkload && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Workload:
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                  {benchmarkStatus.currentWorkload}
                </span>
              </div>
            )}

            {benchmarkStatus.currentStep && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Step:
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {benchmarkStatus.currentStep}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {benchmarkStatus.message}
              </p>
            </div>
          </div>

          {/* Completed Workloads Counter */}
          {benchmarkStatus.completedWorkloads &&
            benchmarkStatus.completedWorkloads.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  Completed: {benchmarkStatus.completedWorkloads.length} / 12
                  workloads
                </span>
              </div>
            )}
        </div>
      )}

      {/* Error Display Section */}
      {(startError || statusError) && (
        <div className="w-full max-w-6xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-800 dark:text-red-200">
              <span className="font-semibold">Error:</span>{" "}
              {startError || statusError}
            </p>
          </div>
        </div>
      )}

      {/* Benchmark Cards */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-8">
        <div className="flex-1">
          <BenchmarkCard
            title="YCSB"
            isReady={hasResults}
            dashboardLink={ROUTES.YCSB}
            handleStartBenchmark={handleStartYCSBBenchmark}
            databaseStatus={ycsbDBStatus}
            onCheckConnection={refetchDBStatus}
            isRunning={benchmarkStatus.isRunning}
            isStarting={isStarting}
          />
        </div>
        <div className="flex-1">
          <BenchmarkCard
            title="SQL Benchmark"
            isReady={false}
            dashboardLink={""}
            handleStartBenchmark={handleStartSQLBenchmark}
            databaseStatus={{}}
            onCheckConnection={() => console.log("SQL connection check")}
          />
        </div>
      </div>
    </div>
  );
}
