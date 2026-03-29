"use client";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  CircleUserRoundIcon,
  CompassIcon,
  GraduationCap,
  LayoutDashboard,
  LogInIcon,
  LogOutIcon,
  Settings,
  Trophy,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/auth/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CompassIcon, label: "Browse Courses", href: "/courses" },
  { icon: BookOpen, label: "My Courses", href: "#" },
  { icon: Calendar, label: "Schedule", href: "#" },
  { icon: Trophy, label: "Certificates", href: "#" },
];

export function Sidebar() {
  const { user, logout, isLoading } = useUser();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-border transition-all duration-300",
          collapsed ? "justify-center px-0" : "justify-between px-4",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="size-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-foreground animate-in fade-in duration-300">
              App
            </span>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-4 top-20 z-10 flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground",
          collapsed && "rotate-180",
        )}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex w-full items-center rounded-lg transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && (
                <span className="truncate text-sm font-medium animate-in fade-in duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-2.5">
            <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !user ? (
          <div
            className={cn("flex gap-2", collapsed ? "flex-col" : "flex-row")}
          >
            <Link
              href="/login"
              title="Login"
              className={cn(
                "flex w-full items-center rounded-lg text-sm font-medium text-primary transition-colors hover:bg-secondary",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
              )}
            >
              <LogInIcon className="size-5 shrink-0" />
              {!collapsed && <span>Login</span>}
            </Link>
            <Link
              href="/register"
              title="Register"
              className={cn(
                "flex w-full items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
              )}
            >
              <UserPlus className="size-5 shrink-0" />
              {!collapsed && <span>Register</span>}
            </Link>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-lg bg-secondary/50 transition-colors hover:bg-secondary/70 focus:outline-none focus-visible:ring-0",
                  collapsed ? "justify-center p-2.5" : "p-3",
                )}
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 overflow-hidden text-left animate-in fade-in duration-300">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={collapsed ? "right" : "top"}
              align={collapsed ? "start" : "center"}
              className="w-56"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <CircleUserRoundIcon className="size-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                variant="destructive"
                className="flex w-full cursor-pointer items-center gap-2"
              >
                <LogOutIcon className="size-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
