"use client";

import { Grid3X3, LayoutList } from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourses } from "@/lib/courses";
import { type Course, CourseCard } from "./CourseCard";

interface CourseGridProps {
  searchQuery: string;
  selectedCategories: string[];
  selectedLevels: string[];
}

export function CourseGrid({
  searchQuery,
  selectedCategories,
  selectedLevels,
}: CourseGridProps) {
  const { data: courses = [], isLoading } = useSWR("courses", getCourses);
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(course.category ?? "");
    const matchesLevel =
      selectedLevels.length === 0 ||
      selectedLevels.includes(course.level ?? "");

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Explore Courses
          </h1>
          <p className="text-muted-foreground">
            {filteredCourses.length} courses available
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs defaultValue="all" className="hidden sm:block">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="enrolled">My Courses</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select defaultValue="popular">
            <SelectTrigger className="w-40 bg-secondary/50 border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden lg:flex items-center border border-border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-none bg-primary/10"
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none">
              <LayoutList className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Grid3X3 className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No courses found
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Try adjusting your filters or search query to find what you are
            looking for.
          </p>
        </div>
      )}

      {filteredCourses.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" size="lg" className="min-w-48">
            Load More Courses
          </Button>
        </div>
      )}
    </div>
  );
}
