"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import { useTheme } from "@/providers/ThemeProvider";
import { Home, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const menuItems = [
    { text: "Home", icon: Home, href: ROUTES.HOME },
    { text: "YCSB Dashboard", icon: LayoutDashboard, href: ROUTES.YCSB },
  ];

  return (
    <aside
      className={cn(
        "w-60 min-w-60 min-h-screen border-r transition-colors",
        theme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <div className="p-6">
        <h2
          className={cn(
            "text-lg font-semibold",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          Menu
        </h2>
      </div>

      <Separator className={theme === "dark" ? "bg-gray-800" : "bg-gray-200"} />

      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.text}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
                isActive
                  ? theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-900"
                  : theme === "dark"
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.text}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
