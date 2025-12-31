import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { DbStatusIndicator } from "./StatusIndicator";

export const BenchmarkCard = ({
  title,
  isReady,
  dashboardLink,
  handleStartBenchmark,
  databaseStatus,
  onCheckConnection,
  isRunning,
  isStarting,
}: {
  title: string;
  isReady: boolean;
  dashboardLink: string;
  handleStartBenchmark: () => void;
  databaseStatus: Record<string, string>;
  onCheckConnection: () => void;
  isRunning?: boolean;
  isStarting?: boolean;
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
      {/* DB Status Indicator */}
      {databaseStatus && Object.keys(databaseStatus).length > 0 && (
        <div className="mt-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-sm font-semibold mb-3 text-neutral-600 dark:text-neutral-400">
            Database Connections
          </p>

          <div className="flex flex-col gap-2">
            <DbStatusIndicator
              name="Redis"
              isOnline={databaseStatus.redis === "running"}
            />
            <DbStatusIndicator
              name="MongoDB"
              isOnline={databaseStatus.mongo === "running"}
            />
          </div>
        </div>
      )}
    </div>

    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      <Button
        disabled={isRunning}
        onClick={onCheckConnection}
        variant="outline"
        className="flex-1"
      >
        Check DB Connection
      </Button>
      <Button
        onClick={handleStartBenchmark}
        variant="outline"
        className="flex-1"
        disabled={isRunning || isStarting}
      >
        {isStarting ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Starting...
          </>
        ) : isRunning ? (
          "Benchmark Running..."
        ) : (
          "Start Benchmark"
        )}
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
