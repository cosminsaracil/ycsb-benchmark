"use client";

import { ReactNode } from "react";
import { useTheme } from "./ThemeProvider";
import dayjs from "dayjs";
import Sidebar from "./Sidebar";

export default function LayoutProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const currentDate = dayjs().format("YYYY-MM-DD");

  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      } min-h-screen flex`}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Persistent Top Bar */}
        <header className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">YCSB Benchmark</h1>
          <div className="flex items-center gap-4">
            <span>{currentDate}</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
