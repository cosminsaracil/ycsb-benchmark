"use client";

import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { useTheme } from "@/providers/ThemeProvider";

export default function Sidebar() {
  const { theme } = useTheme();

  const linkClasses =
    "block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition";

  return (
    <aside
      className={`${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
      } w-64 min-h-screen p-4`}
    >
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <nav className="flex flex-col gap-2">
        <Link href={ROUTES.HOME} className={linkClasses}>
          Home
        </Link>
        <Link href={ROUTES.YCSB} className={linkClasses}>
          YCSB Dashboard
        </Link>
      </nav>
    </aside>
  );
}
