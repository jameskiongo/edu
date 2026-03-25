"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { CourseFilters } from "@/components/courses/CourseFilter";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function CoursesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  return (
    <main>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}></Sheet>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          <div className="flex">
            {/* <aside className="hidden xl:block w-72 shrink-0 border-r border-border bg-card/50 p-6"> */}
            {/*   <CourseFilters */}
            {/*     searchQuery={searchQuery} */}
            {/*     onSearchChange={setSearchQuery} */}
            {/*     selectedCategories={selectedCategories} */}
            {/*     onCategoryChange={setSelectedCategories} */}
            {/*     selectedLevels={selectedLevels} */}
            {/*     onLevelChange={setSelectedLevels} */}
            {/*   /> */}
            {/* </aside> */}

            {/* Course Grid */}
            <div className="flex-1 p-6">
              {/* Mobile Filter Button */}
              <div className="xl:hidden mb-4">
                <Sheet
                  open={mobileFilterOpen}
                  onOpenChange={setMobileFilterOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <SlidersHorizontal className="size-4" />
                      Filters
                      {(selectedCategories.length > 0 ||
                        selectedLevels.length > 0) && (
                        <span className="ml-1 size-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                          {selectedCategories.length + selectedLevels.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-6">
                    <CourseFilters
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedCategories={selectedCategories}
                      onCategoryChange={setSelectedCategories}
                      selectedLevels={selectedLevels}
                      onLevelChange={setSelectedLevels}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <CourseGrid
                searchQuery={searchQuery}
                selectedCategories={selectedCategories}
                selectedLevels={selectedLevels}
              />
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}
