"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { cn } from "@/lib/utils";

export default function LayoutProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const title = pathname === "/" ? "" : "Statistics";

  return (
    <div
      className={cn(
        "min-h-screen flex",
        theme === "dark" ? "bg-neutral-950 text-neutral-50" : "bg-white text-neutral-900",
      )}
    >
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Main content area with left margin for sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        <Topbar title={title} />

        {/* Scrollable Page content with top padding for fixed header */}
        <main className="p-6 flex-1 mt-[65px] overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
