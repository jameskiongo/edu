"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const categories = [
  { id: "development", label: "Development", count: 128 },
  { id: "design", label: "Design", count: 86 },
  { id: "business", label: "Business", count: 64 },
  { id: "marketing", label: "Marketing", count: 52 },
  { id: "data-science", label: "Data Science", count: 47 },
  { id: "photography", label: "Photography", count: 31 },
];

const levels = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const durations = [
  { id: "0-2", label: "0-2 hours" },
  { id: "2-5", label: "2-5 hours" },
  { id: "5-10", label: "5-10 hours" },
  { id: "10+", label: "10+ hours" },
];

const ratings = [
  { id: "4.5+", label: "4.5 & up" },
  { id: "4.0+", label: "4.0 & up" },
  { id: "3.5+", label: "3.5 & up" },
];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground hover:text-primary transition-colors">
        {title}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        <div className="space-y-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedLevels: string[];
  onLevelChange: (levels: string[]) => void;
}

export function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  selectedLevels,
  onLevelChange,
}: CourseFiltersProps) {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((c) => c !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const toggleLevel = (levelId: string) => {
    if (selectedLevels.includes(levelId)) {
      onLevelChange(selectedLevels.filter((l) => l !== levelId));
    } else {
      onLevelChange([...selectedLevels, levelId]);
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Filter Courses
      </h2>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>

      <div className="divide-y divide-border">
        {/* Categories */}
        <FilterSection title="Category">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <Label
                  htmlFor={category.id}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {category.label}
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">
                {category.count}
              </span>
            </div>
          ))}
        </FilterSection>

        {/* Level */}
        <FilterSection title="Level">
          {levels.map((level) => (
            <div key={level.id} className="flex items-center gap-2">
              <Checkbox
                id={level.id}
                checked={selectedLevels.includes(level.id)}
                onCheckedChange={() => toggleLevel(level.id)}
              />
              <Label
                htmlFor={level.id}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {level.label}
              </Label>
            </div>
          ))}
        </FilterSection>

        {/* Duration */}
        <FilterSection title="Duration">
          {durations.map((duration) => (
            <div key={duration.id} className="flex items-center gap-2">
              <Checkbox id={`duration-${duration.id}`} />
              <Label
                htmlFor={`duration-${duration.id}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {duration.label}
              </Label>
            </div>
          ))}
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Rating">
          {ratings.map((rating) => (
            <div key={rating.id} className="flex items-center gap-2">
              <Checkbox id={`rating-${rating.id}`} />
              <Label
                htmlFor={`rating-${rating.id}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {rating.label}
              </Label>
            </div>
          ))}
        </FilterSection>
      </div>
    </div>
  );
}
