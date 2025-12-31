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
  const {
    data: ycsbData,
    isFetching: isFetchingYCSB,
    error: errorYCSB,
    refetch: refetchYCSB,
  } = useGetAllYCSBResults();

  const {
    data: ycsbDBStatus,
    isFetching: isFetchingStatus,
    error: errorStatus,
    refetch: refetchDBStatus,
  } = useGetDBStatusConnections();

  const {
    startBenchmark,
    isLoading: isStarting,
    error: startError,
  } = useStartBenchmark();
  const { status: benchmarkStatus, error: statusError } = useBenchmarkStatus();

  // Refetch results when benchmark completes
  useEffect(() => {
    if (!benchmarkStatus.isRunning && benchmarkStatus.progress === 100) {
      // Wait a bit for the CSV to be fully written
      setTimeout(() => {
        refetchYCSB();
      }, 2000);
    }
  }, [benchmarkStatus.isRunning, benchmarkStatus.progress, refetchYCSB]);

  if (isFetchingYCSB || isFetchingStatus) return <div>Loading...</div>;
  if (errorYCSB || errorStatus) return <div>Error loading data</div>;
  if (!ycsbData.data || !ycsbDBStatus) return <div>No data</div>;

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

      {/* Show benchmark status if running */}
      {benchmarkStatus.isRunning && (
        <div className="w-full max-w-6xl bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-900">
              Benchmark in Progress
            </h2>
            <span className="text-sm text-blue-700">
              {benchmarkStatus.progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-blue-200 rounded-full h-4 mb-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${benchmarkStatus.progress}%` }}
            />
          </div>

          <div className="space-y-2 text-sm">
            {benchmarkStatus.currentWorkload && (
              <p className="text-blue-800">
                <span className="font-medium">Current:</span>{" "}
                {benchmarkStatus.currentWorkload}
              </p>
            )}
            <p className="text-blue-700">{benchmarkStatus.message}</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {(startError || statusError) && (
        <div className="w-full max-w-6xl bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {startError || statusError}</p>
        </div>
      )}

      {/* Two cards side by side on large screens */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-8">
        {/* YCSB Card with DB status indicators */}
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
        {/* SQL Benchmark Card (placeholder, no status) */}
        <div className="flex-1">
          <BenchmarkCard
            title="SQL Benchmark"
            isReady={false}
            dashboardLink={ROUTES.YCSB}
            handleStartBenchmark={handleStartSQLBenchmark}
            databaseStatus={{}}
            onCheckConnection={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
