import { AlertCircle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  onGenerate: () => void;
  onDismiss?: () => void;
  loadingMessage?: string;
};

export const AISummaryButton = ({
  isLoading,
  onGenerate,
}: {
  isLoading: boolean;
  onGenerate: () => void;
}) => (
  <button
    type="button"
    onClick={onGenerate}
    disabled={isLoading}
    className={cn(
      "ai-button inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md",
      "text-sm font-medium whitespace-nowrap",
      "transition-transform duration-150 ease-[var(--ease-out-strong)]",
      "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100",
      "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    )}
  >
    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
    {isLoading ? "Generating…" : "AI summary"}
  </button>
);

export const AISummaryCard = ({
  summary,
  isLoading,
  error,
  isFromCache,
  onDismiss,
  loadingMessage = "Analyzing throughput and latency trends…",
}: Omit<Props, "onGenerate">) => {
  if (!isLoading && !error && !summary) return null;

  return (
    <div className="ai-border">
      <div className="rounded-[15px] bg-white dark:bg-neutral-950">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="ai-icon-wrap inline-flex items-center justify-center w-6 h-6 rounded-md text-white"
              aria-hidden
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              AI summary
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isFromCache && (
              <span
                title="Showing cached summary. Check console for AI request details."
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] border border-neutral-200 dark:border-neutral-800 text-neutral-500"
              >
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                cached
              </span>
            )}
            {onDismiss && !isLoading && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Hide AI summary"
                title="Hide AI summary"
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0 cursor-pointer",
                  "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
                  "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors",
                  "outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          {isLoading && <SummarySkeleton message={loadingMessage} />}

          {error && !isLoading && !summary && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20">
              <AlertCircle
                className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-500 shrink-0"
                strokeWidth={2}
              />
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-rose-800 dark:text-rose-300">
                  Failed to generate AI summary
                </p>
                <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
                  {error}
                </p>
              </div>
            </div>
          )}

          {summary && !isLoading && (
            <p className="text-[13px] leading-7 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SummarySkeleton = ({ message }: { message: string }) => (
  <div className="space-y-3">
    {[88, 72, 95, 60].map((width, i) => (
      <div
        key={i}
        className={cn(
          "h-3 rounded bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100",
          "dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
          "animate-pulse",
        )}
        style={{ width: `${width}%` }}
      />
    ))}
    <p className="pt-2 text-xs text-neutral-500">{message}</p>
  </div>
);
