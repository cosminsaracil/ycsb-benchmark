"use client";
import { useState } from "react";
import { Trash2, History, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  /** Pass the parent's results query isFetching to show a "loading new run" hint */
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
    <Card className="shadow-sm border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground shrink-0">
            <History className="w-4 h-4 text-primary" />
            Report
          </div>
          <div className="flex-1 min-w-[220px]">
            <Select
              value={selectedRunId ?? LATEST_VALUE}
              onChange={handleChange}
              options={options}
              placeholder={isLoading ? "Loading runs..." : "Select a run"}
              fullWidth
              disabled={isLoading || runs.length === 0}
            />
          </div>
          <div className="text-xs text-muted-foreground shrink-0">
            {runs.length === 0
              ? "No historical runs yet"
              : `${runs.length} run${runs.length === 1 ? "" : "s"} available`}
          </div>
          {selected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget(selected)}
              disabled={deleteMutation.isPending}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Viewing:</span>
          <Badge variant="secondary" className="font-mono px-2 py-0.5">
            {viewingLabel}
          </Badge>
          {isFetching && (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading run data...
            </span>
          )}
        </div>
      </CardContent>

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
              {deleteMutation.isPending ? "Deleting..." : "Delete run"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
