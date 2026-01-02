// "use client";
// import { useState } from "react";
// import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
// import { METRICS } from "@/utils/constants";
// import Statistics from "./components/Statistics";
// import { Chart } from "./components/Chart";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const metricToFieldMap: Record<string, string> = {
//   "Throughput(ops/sec)": "throughput",
//   "AverageLatency(us)": "read_avg",
//   "95thPercentileLatency(us)": "read_95th",
//   "99thPercentileLatency(us)": "read_99th",
// };

// export default function YCSBResults() {
//   const [selectedMetric, setSelectedMetric] = useState<string>(METRICS[0]);
//   const { data: results, isError, error } = useGetAllYCSBResults();

//   if (isError) {
//     return (
//       <div className="flex justify-center items-center min-h-screen text-red-500">
//         {(error as Error)?.message || "Error loading results"}
//       </div>
//     );
//   }

//   if (!results) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         Loading benchmark results...
//       </div>
//     );
//   }

//   console.log("Results:", results);

//   return (
//     <main className="flex min-h-screen flex-col items-center p-10">
//       <h1 className="text-4xl font-bold mb-8">YCSB Benchmark Results</h1>
//       <Select value={selectedMetric} onValueChange={setSelectedMetric}>
//         <SelectTrigger
//           className="
//       w-[280px] mb-8
//       bg-gray-200 text-gray-900 border border-gray-300
//       hover:bg-gray-300
//       dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
//       dark:hover:bg-gray-700
//       transition-colors
//     "
//         >
//           <SelectValue placeholder="Select a metric" />
//         </SelectTrigger>

//         <SelectContent
//           className="
//       bg-gray-100 border border-gray-300
//       dark:bg-gray-900 dark:border-gray-700
//       transition-colors
//     "
//         >
//           {METRICS.map((metric) => (
//             <SelectItem
//               key={metric}
//               value={metric}
//               className="
//           bg-gray-100 hover:bg-red-100 focus:bg-red-200 text-gray-900
//           dark:bg-gray-900 dark:text-gray-100
//           dark:hover:bg-green-900 dark:focus:bg-red-800
//           cursor-pointer transition-colors
//         "
//             >
//               {metric}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Chart
//         results={results}
//         selectedMetric={selectedMetric}
//         metricToFieldMap={metricToFieldMap}
//       />
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-6xl">
//         {["A", "B", "C", "D", "E", "F"].map((workload) => (
//           <Statistics
//             key={workload}
//             workload={workload}
//             results={results}
//             selectedMetric={selectedMetric}
//             metricToFieldMap={metricToFieldMap}
//           />
//         ))}
//       </div>
//     </main>
//   );
// }

// "use client";
// import { useState, useMemo } from "react";
// import { ResponsiveBar } from "@nivo/bar";
// import { ResponsiveLine } from "@nivo/line";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Info, TrendingUp, Activity } from "lucide-react";
// import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
// import { useCurrentTheme } from "@/utils/useCurrentTheme";
// import {
//   NIVO_THEME_DARK,
//   NIVO_THEME_LIGHT,
//   WORKLOADS,
//   METRICS,
//   WORKLOAD_INFO,
//   DB_COLORS,
// } from "@/utils/constants";

// export default function EnhancedYCSBDashboard() {
//   const { data: results } = useGetAllYCSBResults();
//   const [selectedMetric, setSelectedMetric] = useState("throughput");
//   const [selectedWorkloads, setSelectedWorkloads] =
//     useState<string[]>(WORKLOADS);
//   const [chartType, setChartType] = useState<"bar" | "line">("bar");
//   const currentTheme = useCurrentTheme();
//   const NIVO_THEME =
//     currentTheme === "dark" ? NIVO_THEME_DARK : NIVO_THEME_LIGHT;

//   const chartData = useMemo(() => {
//     if (!results?.data) return [];
//     return selectedWorkloads.map((workload) => {
//       const workloadData: Record<string, string | number> = {
//         workload: `Workload ${workload}`,
//       };
//       ["redis", "mongodb"].forEach((db) => {
//         const entry = results.data.find(
//           (d) => d.database === db && d.workload === workload
//         );
//         const value = entry?.[selectedMetric as keyof typeof entry];
//         workloadData[db] =
//           value && value !== "" ? parseFloat(value as string) : 0;
//       });
//       return workloadData;
//     });
//   }, [results, selectedMetric, selectedWorkloads]);

//   const lineData = useMemo(() => {
//     if (!results?.data || chartType !== "line") return [];
//     return ["redis", "mongodb"].map((db) => ({
//       id: db,
//       color: DB_COLORS[db as keyof typeof DB_COLORS],
//       data: selectedWorkloads.map((workload) => {
//         const entry = results.data.find(
//           (d) => d.database === db && d.workload === workload
//         );
//         const value = entry?.[selectedMetric as keyof typeof entry];
//         return {
//           x: `WL ${workload}`,
//           y: value && value !== "" ? parseFloat(value as string) : 0,
//         };
//       }),
//     }));
//   }, [results, selectedMetric, selectedWorkloads, chartType]);

//   const summaryStats = useMemo(() => {
//     if (!results?.data) return null;
//     const calcStats = (db: string) => {
//       const values = results.data
//         .filter(
//           (d) => d.database === db && selectedWorkloads.includes(d.workload)
//         )
//         .map((d) => parseFloat(d[selectedMetric as keyof typeof d] as string))
//         .filter((v) => !isNaN(v) && v > 0);
//       if (values.length === 0) return { avg: 0, min: 0, max: 0 };
//       return {
//         avg: values.reduce((a, b) => a + b, 0) / values.length,
//         min: Math.min(...values),
//         max: Math.max(...values),
//       };
//     };
//     return { redis: calcStats("redis"), mongodb: calcStats("mongodb") };
//   }, [results, selectedMetric, selectedWorkloads]);

//   const metricInfo = METRICS[selectedMetric as keyof typeof METRICS];
//   const redisWins = summaryStats
//     ? metricInfo.higher
//       ? summaryStats.redis.avg > summaryStats.mongodb.avg
//       : summaryStats.redis.avg < summaryStats.mongodb.avg
//     : false;

//   if (!results) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-pulse">Loading benchmark results...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="text-center space-y-3 py-6">
//           <Badge variant="outline" className="mb-2">
//             <Activity className="w-3 h-3 mr-1" />
//             YCSB Benchmark Suite
//           </Badge>
//           <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
//             Performance Dashboard
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Redis vs MongoDB across multiple workload patterns
//           </p>
//         </div>

//         {/* Controls */}
//         <Card className="border-2">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Info className="w-5 h-5" />
//               Configuration
//             </CardTitle>
//             <CardDescription>Customize your benchmark view</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div>
//                 <label className="text-sm font-medium mb-2 block">Metric</label>
//                 <Select
//                   value={selectedMetric}
//                   onValueChange={setSelectedMetric}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Object.entries(METRICS).map(([key, { label }]) => (
//                       <SelectItem key={key} value={key}>
//                         {label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   Workloads
//                 </label>
//                 <Select
//                   value={selectedWorkloads.join(",")}
//                   onValueChange={(val) => setSelectedWorkloads(val.split(","))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value={WORKLOADS.join(",")}>
//                       All Workloads
//                     </SelectItem>
//                     <SelectItem value="A,B,C">A, B, C</SelectItem>
//                     <SelectItem value="D,E,F">D, E, F</SelectItem>
//                     {WORKLOADS.map((w) => (
//                       <SelectItem key={w} value={w}>
//                         Workload {w}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   Chart Type
//                 </label>
//                 <Select
//                   value={chartType}
//                   onValueChange={(v) => setChartType(v as "bar" | "line")}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="bar">Bar Chart</SelectItem>
//                     <SelectItem value="line">Line Chart</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">Winner</label>
//                 <div className="h-10 flex items-center px-3 rounded-md border bg-muted/50">
//                   <Badge
//                     variant={redisWins ? "destructive" : "default"}
//                     className="font-bold"
//                   >
//                     {redisWins ? "Redis" : "MongoDB"}
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {[
//             { db: "redis", color: "red", stats: summaryStats?.redis },
//             { db: "mongodb", color: "blue", stats: summaryStats?.mongodb },
//           ].map(({ db, color, stats }) => (
//             <Card
//               key={db}
//               className={`border-${color}-500/50 bg-${color}-500/5`}
//             >
//               <CardHeader className="pb-3">
//                 <CardTitle className="flex items-center justify-between">
//                   <span className="capitalize">{db}</span>
//                   {((db === "redis" && redisWins) ||
//                     (db === "mongodb" && !redisWins)) && (
//                     <Badge
//                       variant="outline"
//                       className="bg-green-500/10 text-green-600 border-green-500/50"
//                     >
//                       <TrendingUp className="w-3 h-3 mr-1" />
//                       Winner
//                     </Badge>
//                   )}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <div>
//                   <div className="text-xs text-muted-foreground">Average</div>
//                   <div className={`text-3xl font-bold text-${color}-500`}>
//                     {stats?.avg.toFixed(2)}
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 pt-2 border-t">
//                   <div>
//                     <div className="text-xs text-muted-foreground">Min</div>
//                     <div className="text-lg font-semibold">
//                       {stats?.min.toFixed(2)}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-xs text-muted-foreground">Max</div>
//                     <div className="text-lg font-semibold">
//                       {stats?.max.toFixed(2)}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-xs text-muted-foreground pt-1">
//                   {metricInfo?.unit}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Main Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle>{metricInfo?.label} Comparison</CardTitle>
//             <CardDescription>
//               {metricInfo.higher
//                 ? "Higher values are better"
//                 : "Lower values are better"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div style={{ height: 450 }}>
//               {chartType === "bar" ? (
//                 <ResponsiveBar
//                   data={chartData}
//                   keys={["redis", "mongodb"]}
//                   indexBy="workload"
//                   margin={{ top: 50, right: 130, bottom: 60, left: 80 }}
//                   padding={0.3}
//                   groupMode="grouped"
//                   colors={({ id }) => DB_COLORS[id as keyof typeof DB_COLORS]}
//                   theme={NIVO_THEME}
//                   borderRadius={6}
//                   axisBottom={{
//                     tickSize: 5,
//                     tickPadding: 5,
//                     legend: "Workload",
//                     legendPosition: "middle",
//                     legendOffset: 45,
//                   }}
//                   axisLeft={{
//                     tickSize: 5,
//                     tickPadding: 5,
//                     legend: metricInfo?.unit,
//                     legendPosition: "middle",
//                     legendOffset: -60,
//                   }}
//                   labelTextColor="#ffffff"
//                   legends={[
//                     {
//                       dataFrom: "keys",
//                       anchor: "bottom-right",
//                       direction: "column",
//                       translateX: 120,
//                       itemWidth: 100,
//                       itemHeight: 20,
//                       symbolSize: 20,
//                     },
//                   ]}
//                   animate={true}
//                   motionConfig="gentle"
//                 />
//               ) : (
//                 <ResponsiveLine
//                   data={lineData}
//                   margin={{ top: 50, right: 130, bottom: 60, left: 80 }}
//                   xScale={{ type: "point" }}
//                   yScale={{ type: "linear", min: "auto", max: "auto" }}
//                   curve="monotoneX"
//                   axisBottom={{
//                     tickSize: 5,
//                     tickPadding: 5,
//                     legend: "Workload",
//                     legendPosition: "middle",
//                     legendOffset: 45,
//                   }}
//                   axisLeft={{
//                     tickSize: 5,
//                     tickPadding: 5,
//                     legend: metricInfo?.unit,
//                     legendPosition: "middle",
//                     legendOffset: -60,
//                   }}
//                   colors={({ id }) => DB_COLORS[id as keyof typeof DB_COLORS]}
//                   theme={NIVO_THEME}
//                   pointSize={10}
//                   pointBorderWidth={2}
//                   pointBorderColor={{ from: "serieColor" }}
//                   enableArea={true}
//                   areaOpacity={0.1}
//                   legends={[
//                     {
//                       anchor: "bottom-right",
//                       direction: "column",
//                       translateX: 120,
//                       itemWidth: 100,
//                       itemHeight: 20,
//                       symbolSize: 20,
//                     },
//                   ]}
//                   animate={true}
//                   motionConfig="gentle"
//                 />
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Workload Info */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Workload Descriptions</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {WORKLOADS.map((w) => (
//                 <div key={w} className="p-4 rounded-lg border bg-muted/30">
//                   <div className="font-bold text-lg mb-1">Workload {w}</div>
//                   <div className="text-sm font-medium text-primary mb-1">
//                     {WORKLOAD_INFO[w as keyof typeof WORKLOAD_INFO].name}
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     {WORKLOAD_INFO[w as keyof typeof WORKLOAD_INFO].desc}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, Activity } from "lucide-react";
import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { useCurrentTheme } from "@/utils/useCurrentTheme";
import {
  NIVO_THEME_DARK,
  NIVO_THEME_LIGHT,
  WORKLOADS,
  METRICS,
  WORKLOAD_INFO,
  DB_COLORS,
} from "@/utils/constants";

export default function EnhancedYCSBDashboard() {
  const { data: results } = useGetAllYCSBResults();
  const [selectedMetric, setSelectedMetric] = useState("throughput");
  const [selectedWorkloads, setSelectedWorkloads] =
    useState<string[]>(WORKLOADS);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const currentTheme = useCurrentTheme();
  const NIVO_THEME =
    currentTheme === "dark" ? NIVO_THEME_DARK : NIVO_THEME_LIGHT;

  const chartData = useMemo(() => {
    if (!results?.data) return [];
    return selectedWorkloads.map((workload) => {
      const workloadData: Record<string, string | number> = {
        workload: `Workload ${workload}`,
      };
      ["redis", "mongodb"].forEach((db) => {
        const entry = results.data.find(
          (d) => d.database === db && d.workload === workload
        );
        const value = entry?.[selectedMetric as keyof typeof entry];
        workloadData[db] =
          value && value !== "" ? parseFloat(value as string) : 0;
      });
      return workloadData;
    });
  }, [results, selectedMetric, selectedWorkloads]);

  const lineData = useMemo(() => {
    if (!results?.data || chartType !== "line") return [];
    return ["redis", "mongodb"].map((db) => ({
      id: db,
      color: DB_COLORS[db as keyof typeof DB_COLORS],
      data: selectedWorkloads.map((workload) => {
        const entry = results.data.find(
          (d) => d.database === db && d.workload === workload
        );
        const value = entry?.[selectedMetric as keyof typeof entry];
        return {
          x: `WL ${workload}`,
          y: value && value !== "" ? parseFloat(value as string) : 0,
        };
      }),
    }));
  }, [results, selectedMetric, selectedWorkloads, chartType]);

  const summaryStats = useMemo(() => {
    if (!results?.data) return null;
    const calcStats = (db: string) => {
      const values = results.data
        .filter(
          (d) => d.database === db && selectedWorkloads.includes(d.workload)
        )
        .map((d) => parseFloat(d[selectedMetric as keyof typeof d] as string))
        .filter((v) => !isNaN(v) && v > 0);
      if (values.length === 0) return { avg: 0, min: 0, max: 0 };
      return {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };
    return { redis: calcStats("redis"), mongodb: calcStats("mongodb") };
  }, [results, selectedMetric, selectedWorkloads]);

  const metricInfo = METRICS[selectedMetric as keyof typeof METRICS];
  const redisWins = summaryStats
    ? metricInfo.higher
      ? summaryStats.redis.avg > summaryStats.mongodb.avg
      : summaryStats.redis.avg < summaryStats.mongodb.avg
    : false;

  const formatNumber = (num: number, decimals = 2) => {
    if (num === 0) return "0";
    if (num >= 1000) {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
    }
    return num.toFixed(decimals);
  };

  if (!results) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          Loading benchmark results...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <Badge variant="outline" className="mb-3 px-3 py-1">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            YCSB Benchmark Suite
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive performance analysis of Redis and MongoDB across
            multiple workload patterns
          </p>
        </div>

        {/* Controls */}
        <Card
          className={cn(
            "shadow-sm",
            currentTheme === "dark" ? "border-gray-800" : "border-gray-200"
          )}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info className="w-5 h-5 text-primary" />
                  Configuration
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Customize your benchmark view and analysis parameters
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Performance Metric
                </label>
                <Select
                  placeholder="Select a metric"
                  value={selectedMetric}
                  onChange={(value) => setSelectedMetric(value)}
                  options={Object.entries(METRICS).map(([key, { label }]) => ({
                    value: key,
                    label: label,
                  }))}
                  fullWidth
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Workload Selection
                </label>
                <Select
                  value={selectedWorkloads.join(",")}
                  onChange={(value) => setSelectedWorkloads(value.split(","))}
                  options={[
                    { value: WORKLOADS.join(","), label: "All Workloads" },
                    { value: "A,B,C", label: "A, B, C" },
                    { value: "D,E,F", label: "D, E, F" },
                    ...WORKLOADS.map((w) => ({
                      value: w,
                      label: `Workload ${w}`,
                    })),
                  ]}
                  fullWidth
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Visualization Type
                </label>
                <Select
                  value={chartType}
                  onValueChange={(v) => setChartType(v as "bar" | "line")}
                >
                  {/* <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                  </SelectContent> */}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Performance Leader
                </label>
                <div className="h-10 flex items-center justify-center px-4 rounded-md bg-muted/40">
                  <Badge
                    variant={redisWins ? "destructive" : "default"}
                    className="font-semibold text-sm"
                  >
                    {redisWins ? "Redis" : "MongoDB"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { db: "redis", label: "Redis", stats: summaryStats?.redis },
            { db: "mongodb", label: "MongoDB", stats: summaryStats?.mongodb },
          ].map(({ db, label, stats }) => {
            const isWinner =
              (db === "redis" && redisWins) || (db === "mongodb" && !redisWins);
            return (
              <Card
                key={db}
                className={`shadow-sm transition-all hover:shadow-md ${
                  isWinner ? "ring-1 ring-green-500/20" : ""
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div
                        className="w-3 h-8 rounded-full"
                        style={{
                          backgroundColor:
                            DB_COLORS[db as keyof typeof DB_COLORS],
                        }}
                      />
                      {label}
                    </CardTitle>
                    {isWinner && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                      >
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        Leader
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Average
                    </div>
                    <div
                      className="text-4xl font-bold tabular-nums"
                      style={{
                        color: DB_COLORS[db as keyof typeof DB_COLORS],
                      }}
                    >
                      {formatNumber(stats?.avg || 0)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Minimum
                      </div>
                      <div className="text-xl font-semibold tabular-nums">
                        {formatNumber(stats?.min || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Maximum
                      </div>
                      <div className="text-xl font-semibold tabular-nums">
                        {formatNumber(stats?.max || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Unit: <span className="font-mono">{metricInfo?.unit}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">
                  {metricInfo?.label} Comparison
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {metricInfo.higher
                    ? "Higher values indicate better performance"
                    : "Lower values indicate better performance"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div style={{ height: 480 }}>
              {chartType === "bar" ? (
                <ResponsiveBar
                  data={chartData}
                  keys={["redis", "mongodb"]}
                  indexBy="workload"
                  margin={{ top: 50, right: 140, bottom: 70, left: 90 }}
                  padding={0.25}
                  groupMode="grouped"
                  colors={({ id }) => DB_COLORS[id as keyof typeof DB_COLORS]}
                  theme={NIVO_THEME}
                  borderRadius={4}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    legend: "Workload",
                    legendPosition: "middle",
                    legendOffset: 50,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 8,
                    legend: metricInfo?.unit,
                    legendPosition: "middle",
                    legendOffset: -70,
                    format: (value) => formatNumber(value, 0),
                  }}
                  labelSkipWidth={16}
                  labelSkipHeight={16}
                  labelTextColor="#ffffff"
                  label={(d) => formatNumber(d.value as number, 2)}
                  legends={[
                    {
                      dataFrom: "keys",
                      anchor: "bottom-right",
                      direction: "column",
                      translateX: 130,
                      translateY: 0,
                      itemsSpacing: 8,
                      itemWidth: 100,
                      itemHeight: 24,
                      symbolSize: 18,
                      itemDirection: "left-to-right",
                    },
                  ]}
                  tooltip={({ id, value, indexValue }) => (
                    <div
                      style={{
                        padding: "10px 14px",
                        background:
                          currentTheme === "dark" ? "#1f2937" : "#ffffff",
                        border: `1px solid ${
                          currentTheme === "dark" ? "#374151" : "#e5e7eb"
                        }`,
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        {indexValue}
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor:
                              DB_COLORS[id as keyof typeof DB_COLORS],
                            marginRight: 8,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {id}:
                        </span>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "monospace",
                          }}
                        >
                          {formatNumber(value as number, 2)} {metricInfo?.unit}
                        </span>
                      </div>
                    </div>
                  )}
                  animate={true}
                  motionConfig="gentle"
                />
              ) : (
                <ResponsiveLine
                  data={lineData}
                  margin={{ top: 50, right: 140, bottom: 70, left: 90 }}
                  xScale={{ type: "point" }}
                  yScale={{ type: "linear", min: "auto", max: "auto" }}
                  curve="monotoneX"
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    legend: "Workload",
                    legendPosition: "middle",
                    legendOffset: 50,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 8,
                    legend: metricInfo?.unit,
                    legendPosition: "middle",
                    legendOffset: -70,
                    format: (value) => formatNumber(value, 0),
                  }}
                  colors={({ id }) => DB_COLORS[id as keyof typeof DB_COLORS]}
                  theme={NIVO_THEME}
                  pointSize={11}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  enableArea={true}
                  areaOpacity={0.08}
                  lineWidth={3}
                  legends={[
                    {
                      anchor: "bottom-right",
                      direction: "column",
                      translateX: 130,
                      translateY: 0,
                      itemsSpacing: 8,
                      itemWidth: 100,
                      itemHeight: 24,
                      symbolSize: 18,
                    },
                  ]}
                  tooltip={({ point }) => (
                    <div
                      style={{
                        padding: "10px 14px",
                        background:
                          currentTheme === "dark" ? "#1f2937" : "#ffffff",
                        border: `1px solid ${
                          currentTheme === "dark" ? "#374151" : "#e5e7eb"
                        }`,
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        {point.data.x}
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: point.seriesColor,
                            marginRight: 8,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {point.seriesId}:
                        </span>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "monospace",
                          }}
                        >
                          {formatNumber(point.data.y as number, 2)}{" "}
                          {metricInfo?.unit}
                        </span>
                      </div>
                    </div>
                  )}
                  animate={true}
                  motionConfig="gentle"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workload Info */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Workload Descriptions</CardTitle>
            <CardDescription className="mt-1.5">
              Understanding YCSB benchmark workload characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {WORKLOADS.map((w) => (
                <div
                  key={w}
                  className="p-5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold text-xl">Workload {w}</div>
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">
                    {WORKLOAD_INFO[w as keyof typeof WORKLOAD_INFO].name}
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {WORKLOAD_INFO[w as keyof typeof WORKLOAD_INFO].desc}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
