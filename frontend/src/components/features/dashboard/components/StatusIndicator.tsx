import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbStatusIndicatorProps } from "./types";

export const DbStatusIndicator = ({
  name,
  isOnline,
}: DbStatusIndicatorProps) => (
  <div
    className={cn(
      "flex items-center justify-between px-3 py-2 rounded-md",
      "border border-neutral-200 dark:border-neutral-800",
      "bg-white dark:bg-neutral-950",
      "transition-colors duration-150",
      "hover:border-neutral-300 dark:hover:border-neutral-700",
    )}
  >
    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
      <Database size={14} strokeWidth={1.75} className="text-neutral-400 dark:text-neutral-500" />
      <span className="text-sm font-medium">{name}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex rounded-full h-1.5 w-1.5",
          isOnline ? "bg-emerald-500" : "bg-neutral-400 dark:bg-neutral-600",
        )}
      />
      <span
        className={cn(
          "text-[11px] font-medium tabular-nums",
          isOnline
            ? "text-neutral-600 dark:text-neutral-400"
            : "text-neutral-400 dark:text-neutral-500",
        )}
      >
        {isOnline ? "online" : "offline"}
      </span>
    </div>
  </div>
);
