"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  PackageCheck,
  CheckCircle2,
  Circle,
  Brain,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/system", label: "System", icon: Brain },
  { href: "/assistant", label: "BW Devs Team", icon: MessageSquare },
];

const dashboardSubItems = [
  { href: "/?status=in-progress", status: "in-progress", label: "In Progress", icon: Clock },
  { href: "/?status=dev-complete", status: "dev-complete", label: "Dev-Complete", icon: PackageCheck },
  { href: "/?status=done", status: "done", label: "Completed", icon: CheckCircle2 },
  { href: "/?status=pending", status: "pending", label: "Pending", icon: Circle },
];

/** Read current status filter from URL */
function useStatusParam(pathname: string) {
  const [status, setStatus] = useState<string | null>(null);

  const sync = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(pathname === "/" ? params.get("status") : null);
  }, [pathname]);

  useEffect(() => {
    sync();
    // Re-sync on back/forward navigation
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [sync]);

  return status;
}

export function Sidebar() {
  const pathname = usePathname();
  const currentStatus = useStatusParam(pathname);
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-background transition-all duration-300 md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {collapsed ? (
          <Image
            src="/BW_DEVS_AI_TEAM_LOGO.png"
            alt="BW Devs Team"
            width={1042}
            height={253}
            className="shrink-0 w-8 h-auto"
          />
        ) : (
          <Image
            src="/BW_DEVS_AI_TEAM_LOGO.png"
            alt="BW Devs Team"
            width={1042}
            height={253}
            className="shrink-0 h-8 w-auto"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isDashboard = item.href === "/";
          const isActive = isDashboard
            ? pathname === "/" && !currentStatus
            : pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>

              {/* Dashboard sub-items */}
              {isDashboard && !collapsed && (
                <div className="ml-4 mt-0.5 flex flex-col gap-0.5">
                  {dashboardSubItems.map((sub) => {
                    const isSubActive = currentStatus === sub.status;
                    return (
                      <Link
                        key={sub.status}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                          isSubActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <sub.icon className="size-3.5 shrink-0" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 px-3"
        >
          {theme === "dark" ? (
            <Sun className="size-5 shrink-0" />
          ) : (
            <Moon className="size-5 shrink-0" />
          )}
          {!collapsed && (
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          )}
        </Button>
      </div>
    </aside>
  );
}
