"use client";
import { useEffect } from "react";
import { ROUTES } from "@/utils/routes";
import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { useGetDBStatusConnections } from "@/utils/hooks/api/ycsb/useGetStatusConnections";
import { BenchmarkCard } from "./components/BenchmarkCard";
import { ProgressCard } from "./components/ProgressCard";
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

      {/* Benchmark Progress Section */}
      {benchmarkStatus.isRunning && (
        <ProgressCard benchmarkStatus={benchmarkStatus} />
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
