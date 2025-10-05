"use client";
import { ReactNode } from "react";
import { useTheme } from "./ThemeProvider";
import dayjs from "dayjs";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LayoutProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const currentDate = dayjs().format("YYYY-MM-DD");

  return (
    <div
      className={cn(
        "min-h-screen flex",
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      )}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Persistent Top Bar */}
        <header
          className={cn(
            "flex justify-between items-center p-4 border-b",
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          )}
        >
          <h1 className="text-2xl font-bold">YCSB Benchmark</h1>
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              {currentDate}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-100"
              )}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
