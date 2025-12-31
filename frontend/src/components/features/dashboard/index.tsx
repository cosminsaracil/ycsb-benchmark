"use client";
import { ROUTES } from "@/utils/routes";
import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { BenchmarkCard } from "./components/BenchmarkCard";

export default function Dashboard() {
  const {
    data: ycsbData,
    isFetching: isFetchingYCSB,
    error: errorYCSB,
  } = useGetAllYCSBResults();

  if (isFetchingYCSB || errorYCSB) return <div>Loading...</div>;
  if (!ycsbData.data) return <div>No data</div>;

  const resultsYCSB = ycsbData.data;
  const hasResults = resultsYCSB.length > 0;

  const handleCheckYCSBConnection = () => {
    console.log("Check YCSB connection clicked");
  };

  const handleCheckSQLConnection = () => {
    console.log("Check SQL connection clicked");
  };

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
        <BenchmarkCard
          title="YCSB"
          isReady={hasResults}
          dashboardLink={ROUTES.YCSB}
          handleConnectionCheck={handleCheckYCSBConnection}
          handleStartBenchmark={handleStartYCSBBenchmark}
        />
        <BenchmarkCard
          title="SQL Benchmark"
          isReady={hasResults}
          dashboardLink={ROUTES.YCSB}
          handleConnectionCheck={handleCheckSQLConnection}
          handleStartBenchmark={handleStartSQLBenchmark}
        />
      </div>
    </div>
  );
}
