"use client";

import { Search, ChevronDown, Filter, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/courses/useCategories";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const levels = [
  { id: "BEGINNER", label: "Beginner" },
  { id: "INTERMEDIATE", label: "Intermediate" },
  { id: "ADVANCED", label: "Advanced" },
];

interface CourseFilterHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedLevels: string[];
  onLevelChange: (levels: string[]) => void;
}

export function CourseFilterHeader({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  selectedLevels,
  onLevelChange,
}: CourseFilterHeaderProps) {
  const { categories, isLoading } = useCategories();

  const handleCategoryChange = (val: string) => {
    if (val === "all") onCategoryChange([]);
    else onCategoryChange([val]);
  };

  const handleLevelChange = (val: string) => {
    if (val === "all") onLevelChange([]);
    else onLevelChange([val]);
  };

  const clearFilters = () => {
    onCategoryChange([]);
    onLevelChange([]);
    onSearchChange("");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedLevels.length > 0 || searchQuery.length > 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-border mb-8">
      <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">Explore Courses</h1>

      <div className="flex flex-1 items-center justify-end gap-3 max-w-4xl w-full">
        {/* Instructor-style Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Simple Category Select */}
          <Select 
            onValueChange={handleCategoryChange} 
            value={selectedCategories[0] || "all"}
          >
            <SelectTrigger className="w-[140px] text-xs font-medium">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Simple Level Select */}
          <Select 
            onValueChange={handleLevelChange} 
            value={selectedLevels[0] || "all"}
          >
            <SelectTrigger className="w-[120px] text-xs font-medium">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={clearFilters}
              className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              title="Clear all filters"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
