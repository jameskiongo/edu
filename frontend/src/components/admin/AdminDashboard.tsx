"use client";

import { useAdminUsers, useAdminCategories } from "@/hooks/auth/useAdmin";
import { Users, Layers, ShieldCheck, GraduationCap, Loader2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function AdminDashboard() {
  const { users, isLoading: loadingUsers } = useAdminUsers();
  const { categories, isLoading: loadingCategories } = useAdminCategories();

  if (loadingUsers || loadingCategories) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const teacherCount = users?.filter(u => u.role === "TEACHER").length || 0;
  const studentCount = users?.filter(u => u.role === "STUDENT").length || 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          Quick summary of your platform's activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">Total Users</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardHeader className="pt-0">
              <CardTitle className="text-2xl font-bold">{users?.length || 0}</CardTitle>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">Teachers</CardDescription>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardHeader className="pt-0">
              <CardTitle className="text-2xl font-bold">{teacherCount}</CardTitle>
              <p className="text-xs text-muted-foreground">Active instructors</p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">Students</CardDescription>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardHeader className="pt-0">
              <CardTitle className="text-2xl font-bold">{studentCount}</CardTitle>
              <p className="text-xs text-muted-foreground">Enrolled learners</p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/admin/categories">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">Categories</CardDescription>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardHeader className="pt-0">
              <CardTitle className="text-2xl font-bold">{categories?.length || 0}</CardTitle>
              <p className="text-xs text-muted-foreground">Course taxonomies</p>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
