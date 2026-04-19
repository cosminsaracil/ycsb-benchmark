import { Database } from "lucide-react";
import type { DbStatusIndicatorProps } from "./types";

export const DbStatusIndicator = ({
  name,
  isOnline,
}: DbStatusIndicatorProps) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
    {/* Left Side: Icon + Name */}
    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
      <Database size={16} strokeWidth={2.5} className="opacity-80" />
      <span className="text-sm font-semibold tracking-tight">{name}</span>
    </div>

    {/* Right Side: Status dot + Label */}
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>
      <span
        className={`text-[11px] uppercase font-bold tracking-wider ${
          isOnline ? "text-green-600" : "text-red-600"
        }`}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  </div>
);
