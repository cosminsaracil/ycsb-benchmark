import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbStatusIndicatorProps } from "./types";

export const DbStatusIndicator = ({
  name,
  isOnline,
}: DbStatusIndicatorProps) => (
  <div
    className={cn(
      "group/db flex items-center justify-between px-3.5 py-2.5 rounded-lg",
      "border border-neutral-200/70 dark:border-neutral-800/70",
      "bg-white/60 dark:bg-neutral-900/50 backdrop-blur-sm",
      "transition-colors hover:bg-white dark:hover:bg-neutral-900/80",
    )}
  >
    <div className="flex items-center gap-2.5 text-neutral-700 dark:text-neutral-200">
      <Database size={15} strokeWidth={2.25} className="opacity-70" />
      <span className="text-sm font-semibold tracking-tight">{name}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            isOnline ? "bg-emerald-500" : "bg-rose-500",
          )}
        />
      </span>
      <span
        className={cn(
          "text-[10px] uppercase font-bold tracking-[0.18em]",
          isOnline
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400",
        )}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  </div>
);
