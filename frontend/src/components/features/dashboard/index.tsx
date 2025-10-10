// "use client";

// import Link from "next/link";
// import { ROUTES } from "@/utils/routes";
// import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// export default function Dashboard() {
//   const { data, isFetching, error } = useGetAllYCSBResults();

//   if (isFetching) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <p className="text-lg text-gray-500">Loading YCSB results...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen text-red-500">
//         Failed to load data.
//       </div>
//     );
//   }

//   const resultsYCSB = data?.data ?? [];
//   const hasResults = resultsYCSB.length > 0;

//   const handleCheckConnection = () => {
//     console.log("Checking connection...");
//   };

//   const handleGetResults = () => {
//     console.log("Getting results...");
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
//       <Card className="w-full max-w-3xl shadow-md border border-gray-200 dark:border-gray-700">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-center">
//             YCSB Benchmark Dashboard
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-col items-center gap-6 py-6">
//           {!hasResults ? (
//             <>
//               <p className="text-gray-600 dark:text-gray-300 text-center">
//                 📊 YCSB results are not ready or unavailable.
//               </p>
//               <div className="flex gap-4">
//                 <Button onClick={handleCheckConnection} variant="outline">
//                   Check Connection
//                 </Button>
//                 <Button onClick={handleGetResults}>Get Results</Button>
//               </div>
//             </>
//           ) : (
//             <>
//               <p className="text-green-600 dark:text-green-400 text-center">
//                 ✅ YCSB results are available!
//               </p>
//               <Link
//                 href={ROUTES.YCSB}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Go to YCSB Dashboard
//               </Link>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </main>
//   );
// }

"use client";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { useGetAllYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { data, isFetching, error } = useGetAllYCSBResults();

  if (isFetching || error) return <div>Loading...</div>;
  if (!data.data) return <div>No data</div>;

  const resultsYCSB = data.data;
  const hasResults = resultsYCSB.length > 0;

  const handleCheckConnection = () => {
    console.log("Check connection clicked");
  };

  const handleGetResults = () => {
    console.log("Get Results clicked");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 bg-neutral-50 dark:bg-neutral-950">
      <h1 className="text-3xl font-semibold mb-4 text-neutral-900 dark:text-neutral-50">
        YCSB Dashboard
      </h1>

      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm p-8">
        {/* Status Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3 text-neutral-700 dark:text-neutral-300">
            Results Status
          </h2>
          {hasResults ? (
            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md">
              <svg
                className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                YCSB results are ready
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md">
              <svg
                className="w-5 h-5 text-neutral-500 dark:text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                YCSB results are not ready or not available
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleCheckConnection}
            variant="outline"
            className="flex-1"
          >
            Check Connection
          </Button>
          <Button
            onClick={handleGetResults}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-900"
          >
            Get Results
          </Button>
        </div>

        <Separator className="bg-neutral-200 dark:bg-neutral-800" />

        {/* Link to YCSB Dashboard */}
        {hasResults && (
          <div className="pt-6">
            <Link
              href={ROUTES.YCSB}
              className="block w-full px-4 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-center rounded-md transition font-medium"
            >
              View YCSB Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
