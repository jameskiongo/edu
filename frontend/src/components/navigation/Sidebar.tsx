"use client";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  CompassIcon,
  GraduationCap,
  LayoutDashboard,
  LogInIcon,
  Trophy,
  UserIcon,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/auth/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: CompassIcon, label: "Browse Courses", href: "/courses" },
  { icon: BookOpen, label: "My Courses", href: "#" },
  { icon: Calendar, label: "Schedule", href: "#" },
  { icon: Trophy, label: "Certificates", href: "#" },
];

export function Sidebar() {
  const { user, mutate } = useUser();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="size-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-foreground">App</span>
          )}
        </div>
        {/* FIX: Fix the collapsed icon hover  */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft
            className={cn(
              "size-5 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="mt-3">
          {!user ? (
            <div
              className={cn("flex gap-2", collapsed ? "flex-col" : "flex-row")}
            >
              <a
                href="/login"
                className={cn(
                  "flex w-full items-center gap-3 text-primary rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                )}
              >
                <LogInIcon className="size-5 shrink-0" />
                {!collapsed && <span>Login</span>}
              </a>
              <a
                href="/register"
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                )}
              >
                <UserPlus className="size-5 shrink-0" />
                {!collapsed && <span>Register</span>}
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
              <UserIcon className="size-5 text-muted-foreground hover:bg-secondary hover:text-foreground" />
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">
                    Jane Doe
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Student
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
