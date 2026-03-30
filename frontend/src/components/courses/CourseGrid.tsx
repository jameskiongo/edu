"use client";

import { Grid3X3, Loader2 } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { Button } from "@/components/ui/button";
import { getCourses } from "@/lib/courses";
import { type Course, CourseCard } from "./CourseCard";

interface CourseGridProps {
  searchQuery: string;
  selectedCategories: string[];
  selectedLevels: string[];
}

const PAGE_SIZE = 6;

export function CourseGrid({
  searchQuery,
  selectedCategories,
  selectedLevels,
}: CourseGridProps) {
  const getKey = (pageIndex: number, previousPageData: Course[]) => {
    if (previousPageData && !previousPageData.length) return null;
    return { key: "courses", limit: PAGE_SIZE, offset: pageIndex * PAGE_SIZE };
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    async ({ limit, offset }) => getCourses({ limit, offset })
  );

  const courses = data ? data.flat() : [];
  const isReachingEnd = 
    data && (data[data.length - 1]?.length < PAGE_SIZE);

  if (isLoading && !data) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // selectedCategories contains category names from the filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(course.category?.name ?? "");
      
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
        <div className="flex flex-col items-center gap-4 pt-10 pb-6">
          {!isReachingEnd ? (
            <Button 
              variant="outline" 
              size="lg" 
              className="min-w-48 font-semibold border-2"
              onClick={() => setSize(size + 1)}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Courses"
              )}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-px w-24 bg-border" />
              <p className="text-sm text-muted-foreground font-medium">
                You've reached the end of the catalog
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
