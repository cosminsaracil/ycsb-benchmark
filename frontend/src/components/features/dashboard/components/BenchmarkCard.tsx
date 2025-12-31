import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const BenchmarkCard = ({
  title,
  isReady,
  dashboardLink,
  handleConnectionCheck,
  handleStartBenchmark,
}: {
  title: string;
  isReady: boolean;
  dashboardLink: string;
  handleConnectionCheck: () => void;
  handleStartBenchmark: () => void;
}) => (
  <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
    <div>
      <h2 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
        {title} Status
      </h2>
      <div
        className={`flex items-center gap-3 p-4 rounded-md border ${
          isReady
            ? "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700"
            : "bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700"
        }`}
      >
        {isReady ? (
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400"
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
        ) : (
          <svg
            className="w-5 h-5 text-yellow-500 dark:text-yellow-400"
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
        )}
        <p
          className={`font-medium ${
            isReady
              ? "text-green-700 dark:text-green-300"
              : "text-yellow-700 dark:text-yellow-300"
          }`}
        >
          {isReady
            ? `${title} results are ready`
            : `${title} results are not ready or not available`}
        </p>
      </div>
    </div>

    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      <Button
        onClick={handleConnectionCheck}
        variant="outline"
        className="flex-1"
      >
        Check Connection
      </Button>
      <Button
        onClick={handleStartBenchmark}
        variant="outline"
        className="flex-1"
      >
        Start Benchmark
      </Button>
    </div>

    {dashboardLink && (
      <>
        <Separator className="my-6 bg-neutral-200 dark:bg-neutral-800" />
        <Link
          href={dashboardLink}
          className="block w-full px-4 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-center rounded-md transition font-medium"
        >
          View {title} Dashboard →
        </Link>
      </>
    )}
  </div>
);
