"use client";
import dayjs from "dayjs";
import { Calendar, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

type Props = {
  title?: string;
};

export default function Topbar({ title = "" }: Props) {
  const { theme, toggleTheme } = useTheme();
  const currentDate = dayjs().format("ddd, MMM D YYYY");

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-64 z-20",
        "border-b backdrop-blur-xl",
        theme === "dark"
          ? "border-neutral-800/60 bg-neutral-950/70"
          : "border-neutral-200/60 bg-white/70",
      )}
    >
      <div className="flex justify-between items-center px-6 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          {title && (
            <>
              <div
                className={cn(
                  "h-7 w-1 rounded-full",
                  theme === "dark"
                    ? "bg-gradient-to-b from-neutral-50 to-neutral-500"
                    : "bg-gradient-to-b from-neutral-900 to-neutral-400",
                )}
                aria-hidden
              />
              <h1 className="text-xl font-semibold tracking-tight truncate">
                {title}
              </h1>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono",
              "border",
              theme === "dark"
                ? "border-neutral-800/70 bg-neutral-900/60 text-neutral-400"
                : "border-neutral-200/70 bg-white/60 text-neutral-600",
            )}
          >
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            {currentDate}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
              "transition-colors",
              theme === "dark"
                ? "border-neutral-800/70 hover:bg-neutral-900"
                : "border-neutral-200/70 hover:bg-neutral-100",
            )}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
