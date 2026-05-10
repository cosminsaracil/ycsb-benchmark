import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleAlert, Sparkles } from "lucide-react";

type Props = {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  onGenerate: () => void;
  loadingMessage?: string;
};

export const AISummaryButton = ({
  isLoading,
  onGenerate,
}: {
  isLoading: boolean;
  onGenerate: () => void;
}) => (
  <div className="flex justify-center pt-4">
    <Button
      onClick={onGenerate}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
      disabled={isLoading}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {isLoading ? "Generating Summary..." : "Get AI Summary"}
    </Button>
  </div>
);

export const AISummaryCard = ({
  summary,
  isLoading,
  error,
  isFromCache,
  loadingMessage = "Analyzing throughput and latency trends...",
}: Omit<Props, "onGenerate">) => {
  if (!isLoading && !error && !summary) return null;

  return (
    <Card className="shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-violet-50/80 via-blue-50/60 to-gray-100 dark:from-gray-950 dark:via-violet-950/20 dark:to-gray-900 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          AI Benchmark Summary
          {isFromCache && (
            <span className="relative inline-flex items-center group">
              <CircleAlert className="w-4 h-4 text-amber-500" />
              <span className="pointer-events-none absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs font-normal text-amber-900 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:border-amber-800/60 dark:bg-amber-950 dark:text-amber-100">
                Showing cached summary. Check console for AI request details.
              </span>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600"
                style={{ animation: "spin 2.4s linear infinite" }}
              />
              <div
                className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-pink-500"
                style={{ animation: "spin 1.6s linear reverse infinite" }}
              />
              <div
                className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{
                  animation:
                    "pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              {loadingMessage}
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && !isLoading && !summary && (
          <div className="rounded-xl border border-red-300/70 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20 p-4">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Failed to generate AI summary
            </p>
            <p className="text-xs mt-2 text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="rounded-xl p-[1px] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 shadow-[0_0_0_1px_rgba(139,92,246,0.08)]">
            <div className="rounded-[11px] bg-white/85 dark:bg-gray-900/80 p-5">
              <p className="text-sm leading-7 whitespace-pre-wrap text-gray-800 dark:text-gray-100">
                {summary}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
