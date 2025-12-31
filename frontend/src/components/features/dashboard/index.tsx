"use client";
import { ROUTES } from "@/utils/routes";
import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { useGetDBStatusConnections } from "@/utils/hooks/api/ycsb/useGetStatusConnections";
import { BenchmarkCard } from "./components/BenchmarkCard";

export default function Dashboard() {
  const {
    data: ycsbData,
    isFetching: isFetchingYCSB,
    error: errorYCSB,
    refetch: refetchDBStatus,
  } = useGetAllYCSBResults();

  const {
    data: ycsbDBStatus,
    isFetching: isFetchingStatus,
    error: errorStatus,
  } = useGetDBStatusConnections();

  if (isFetchingYCSB || isFetchingStatus) return <div>Loading...</div>;
  if (errorYCSB || errorStatus) return <div>Error loading data</div>;
  if (!ycsbData.data || !ycsbDBStatus) return <div>No data</div>;

  const resultsYCSB = ycsbData.data;
  const hasResults = resultsYCSB.length > 0;

  const handleStartYCSBBenchmark = () => {
    console.log("Start YCSB benchmark clicked");
  };

  const handleStartSQLBenchmark = () => {
    console.log("Start SQL benchmark clicked");
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Benchmarks</h1>

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
          />
        </div>
        {/* SQL Benchmark Card (placeholder, no status) */}
        <div className="flex-1">
          <BenchmarkCard
            title="SQL Benchmark"
            isReady={hasResults}
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
