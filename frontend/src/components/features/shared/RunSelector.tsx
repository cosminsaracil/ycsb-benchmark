"use client";
import { useState } from "react";
import { Trash2, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteRun, useRuns } from "@/hooks/api/runs";
import type { BenchmarkModule, BenchmarkRun } from "@/types/benchmark";

const LATEST_VALUE = "__latest__";

const formatLabel = (run: BenchmarkRun) => {
  const dt = new Date(run.timestamp);
  if (Number.isNaN(dt.getTime())) return run.id;
  return dt.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type Props = {
  module: BenchmarkModule;
  selectedRunId: string | null;
  onChange: (runId: string | null) => void;
  /** Parent's results query isFetching, used to show a "loading new run" hint. */
  isFetching?: boolean;
};

export const RunSelector = ({
  module,
  selectedRunId,
  onChange,
  isFetching = false,
}: Props) => {
  const { data, isLoading } = useRuns(module);
  const deleteMutation = useDeleteRun(module);
  const [confirmTarget, setConfirmTarget] = useState<BenchmarkRun | null>(null);

  const runs = data?.runs ?? [];
  const selected = runs.find((r) => r.id === selectedRunId) ?? null;
  const viewingLabel = selected ? formatLabel(selected) : "Latest run";

  const options = [
    { value: LATEST_VALUE, label: "Latest run" },
    ...runs.map((run) => ({
      value: run.id,
      label: formatLabel(run),
    })),
  ];

  const handleChange = (value: string) => {
    onChange(value === LATEST_VALUE ? null : value);
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    await deleteMutation.mutateAsync(confirmTarget.id);
    if (selectedRunId === confirmTarget.id) onChange(null);
    setConfirmTarget(null);
  };

  return (
    <div className="flex flex-col gap-2 min-w-[260px]">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500 shrink-0">
          <History className="w-3 h-3" strokeWidth={1.75} />
          Report
        </div>
        <div className="flex-1 min-w-[180px]">
          <Select
            value={selectedRunId ?? LATEST_VALUE}
            onChange={handleChange}
            options={options}
            placeholder={isLoading ? "Loading…" : "Select a run"}
            fullWidth
            disabled={isLoading || runs.length === 0}
          />
        </div>
        {selected && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setConfirmTarget(selected)}
            disabled={deleteMutation.isPending}
            aria-label="Delete this run"
            className="shrink-0 transition-transform duration-150 ease-[var(--ease-out-strong)] active:scale-[0.96] hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span className="shrink-0">Viewing</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 font-mono text-neutral-700 dark:text-neutral-300 truncate">
          {viewingLabel}
        </span>
        {isFetching ? (
          <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading
          </span>
        ) : (
          <span className="shrink-0 font-mono tabular-nums text-neutral-400 dark:text-neutral-600">
            {runs.length === 0 ? "No history" : `${runs.length} saved`}
          </span>
        )}
      </div>

      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this run?</DialogTitle>
            <DialogDescription>
              This will permanently remove the saved snapshot at{" "}
              <span className="font-mono">
                {confirmTarget ? formatLabel(confirmTarget) : ""}
              </span>{" "}
              from disk. The latest summary CSV is not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete run"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
