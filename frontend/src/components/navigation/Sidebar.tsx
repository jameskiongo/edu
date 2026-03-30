"use client";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  CircleUserRoundIcon,
  CompassIcon,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Users,
  LogInIcon,
  LogOutIcon,
  Settings,
  Trophy,
  UserPlus,
  BookMarked,
  PlayCircle,
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
import { useEnrolledCourses } from "@/hooks/courses/useEnrolledCourses";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CompassIcon, label: "Browse Courses", href: "/courses" },
];

const adminItems = [
  { icon: Users, label: "Manage Users", href: "/dashboard/admin/users" },
  { icon: Layers, label: "Manage Categories", href: "/dashboard/admin/categories" },
];

const teacherItems = [
  { icon: BookOpen, label: "Manage Courses", href: "/dashboard/teacher/courses" },
];

export function Sidebar() {
  const { user, logout, isLoading: isUserLoading } = useUser();
  const { courses: enrolledCourses, isLoading: isEnrolledLoading } = useEnrolledCourses();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 overflow-visible",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* ... previous content ... */}
      <div className="absolute -right-4 top-20 z-[100]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-transform duration-300",
            collapsed && "rotate-180",
          )}
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

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

      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-3">
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

          {/* Enrolled Courses Section */}
          {!collapsed && user && enrolledCourses.length > 0 && (
            <div className="pt-4 pb-1">
              <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>My Learning</span>
                <BookMarked className="size-3 opacity-50" />
              </div>
              <div className="space-y-0.5">
                {enrolledCourses.slice(0, 5).map((course) => {
                  const isActive = pathname === `/dashboard/courses/${course.id}`;
                  return (
                    <Link
                      key={course.id}
                      href={`/dashboard/courses/${course.id}`}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
                        isActive 
                          ? "bg-primary/5 text-primary border-r-2 border-primary" 
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <div className="relative flex-none">
                        <PlayCircle className={cn(
                          "size-4 transition-transform duration-300 group-hover:scale-110",
                          isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary"
                        )} />
                        {course.enrollment?.progressPercent > 0 && (
                          <div className="absolute -bottom-1 -right-1 size-1.5 rounded-full bg-emerald-500 ring-1 ring-background" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate text-[11px] font-bold leading-none mb-1.5">
                          {course.title}
                        </span>
                        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/60 transition-all duration-700 ease-out rounded-full"
                            style={{ width: `${course.enrollment?.progressPercent || 0}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {!collapsed && user?.role === "ADMIN" && (
            <div className="px-3 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin Panel
            </div>
          )}

          {user?.role === "ADMIN" && adminItems.map((item) => {
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

          {!collapsed && (user?.role === "TEACHER" || user?.role === "ADMIN") && (
            <div className="px-3 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Instructor Panel
            </div>
          )}

          {(user?.role === "TEACHER" || user?.role === "ADMIN") && teacherItems.map((item) => {
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
      </ScrollArea>

      <div className="border-t border-border p-3">
        {isUserLoading ? (
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
