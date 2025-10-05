"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import dayjs from "dayjs";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";

export default function LayoutProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const currentDate = dayjs().format("YYYY-MM-DD");
  const title = pathname === ROUTES.YCSB ? "Statistics" : "Benchmark app";

  return (
    <div
      className={cn(
        "min-h-screen flex",
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      )}
    >
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Main content area with left margin for sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Bar */}
        <header
          className={cn(
            "fixed top-0 right-0 left-64 flex justify-between items-center p-4 border-b z-20",
            theme === "dark"
              ? "border-gray-800 bg-gray-900"
              : "border-gray-200 bg-white"
          )}
        >
          <h1 className="text-2xl font-bold">{title}</h1>
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

        {/* Scrollable Page content with top padding for fixed header */}
        <main className="p-6 flex-1 mt-[73px] overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
