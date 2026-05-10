"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import { useTheme } from "@/providers/ThemeProvider";
import {
  Activity,
  Database,
  Home,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = {
  text: string;
  icon: LucideIcon;
  href: string;
  section: "main" | "modules";
};

const MENU: MenuItem[] = [
  { text: "Home", icon: Home, href: ROUTES.HOME, section: "main" },
  {
    text: "YCSB Dashboard",
    icon: Activity,
    href: ROUTES.YCSB,
    section: "modules",
  },
  {
    text: "SQL Dashboard",
    icon: Database,
    href: ROUTES.SQL,
    section: "modules",
  },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const renderItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.text}
        href={item.href}
        className={cn(
          "group/nav relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
          "transition-all duration-200",
          isActive
            ? theme === "dark"
              ? "bg-neutral-800/80 text-neutral-50 shadow-sm"
              : "bg-white text-neutral-900 shadow-sm"
            : theme === "dark"
              ? "text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-100"
              : "text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900",
        )}
      >
        {isActive && (
          <span
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full",
              theme === "dark"
                ? "bg-gradient-to-b from-neutral-50 to-neutral-400"
                : "bg-gradient-to-b from-neutral-900 to-neutral-500",
            )}
            aria-hidden
          />
        )}
        <Icon
          className={cn(
            "w-4 h-4 transition-transform",
            "group-hover/nav:scale-110",
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <span className="tracking-tight">{item.text}</span>
      </Link>
    );
  };

  const main = MENU.filter((m) => m.section === "main");
  const modules = MENU.filter((m) => m.section === "modules");

  return (
    <aside
      className={cn(
        "w-64 min-w-64 h-screen flex flex-col border-r backdrop-blur-xl",
        theme === "dark"
          ? "bg-neutral-950/80 border-neutral-800/60"
          : "bg-neutral-50/80 border-neutral-200/60",
      )}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2.5 group/brand"
        >
          <div
            className={cn(
              "relative w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md",
              "bg-gradient-to-br from-neutral-700 via-neutral-900 to-black",
              "dark:from-neutral-200 dark:via-neutral-50 dark:to-white",
              "ring-1 ring-black/10 dark:ring-white/10",
            )}
          >
            <Activity
              className="w-5 h-5 dark:text-neutral-900"
              strokeWidth={2.5}
            />
            <span
              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-neutral-50 dark:ring-neutral-950"
              aria-hidden
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">Benchmark</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
              Suite
            </div>
          </div>
        </Link>
      </div>

      <div
        className={cn(
          "h-px mx-3",
          theme === "dark" ? "bg-neutral-800/70" : "bg-neutral-200/70",
        )}
      />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div className="space-y-1">{main.map(renderItem)}</div>

        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground font-mono">
            Modules
          </div>
          <div className="space-y-1">{modules.map(renderItem)}</div>
        </div>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "px-5 py-4 border-t text-[11px] font-mono",
          theme === "dark"
            ? "border-neutral-800/70 text-neutral-500"
            : "border-neutral-200/70 text-neutral-500",
        )}
      >
        <div className="flex items-center justify-between">
          <span>v1.0</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            online
          </span>
        </div>
      </div>
    </aside>
  );
}
