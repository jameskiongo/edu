"use client";

import {
  Plus,
  MoreHorizontal,
  Users,
  BookOpen,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeacherCourses } from "@/hooks/auth/useTeacherCourses";
import { cn } from "@/lib/utils";

export default function TeacherCoursesPage() {
  const { courses, isLoading } = useTeacherCourses();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course: any) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Courses</h1>
          <p className="text-muted-foreground">
            Create and manage your courses, lessons, and content.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teacher/courses/new">
            <Plus className="mr-2 size-4" />
            New Course
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <Button variant="ghost" size="icon" className="rounded-none bg-primary/10">
            <List className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-none">
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Course</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course: any) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-muted-foreground">
                            <BookOpen className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">
                          {course.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {course.description}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {course.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-medium",
                        course.status === "PUBLISHED"
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          : course.status === "DRAFT"
                          ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span>{course.enrollments?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${course.price}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/teacher/courses/${course.id}`}>
                            Edit Course
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/teacher/courses/${course.id}/curriculum`}>
                            Manage Curriculum
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
