"use client";

import { useState } from "react";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseFilterHeader } from "@/components/courses/CourseFilterHeader";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Filter & Search Header */}
          <CourseFilterHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            selectedLevels={selectedLevels}
            onLevelChange={setSelectedLevels}
          />

          {/* Course Grid */}
          <CourseGrid
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
            selectedLevels={selectedLevels}
          />
        </div>
      </main>
    </div>
  );
}
