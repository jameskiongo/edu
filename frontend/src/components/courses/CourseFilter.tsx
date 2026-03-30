import { ChevronDown, Search, Loader2 } from "lucide-react";
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
import { useCategories } from "@/hooks/courses/useCategories";

const levels = [
  { id: "BEGINNER", label: "Beginner" },
  { id: "INTERMEDIATE", label: "Intermediate" },
  { id: "ADVANCED", label: "Advanced" },
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
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground hover:text-primary transition-colors text-left">
        {title}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform shrink-0",
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
  selectedCategories: string[]; // These will be category IDs as strings
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
  const { categories, isLoading } = useCategories();

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
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>

      <div className="divide-y divide-border">
        {/* Categories */}
        <FilterSection title="Category">
          {isLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.id.toString())}
                  onCheckedChange={() => toggleCategory(category.id.toString())}
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {category.name}
                </Label>
              </div>
            ))
          )}
        </FilterSection>

        {/* Level */}
        <FilterSection title="Level">
          {levels.map((level) => (
            <div key={level.id} className="flex items-center gap-2">
              <Checkbox
                id={`level-${level.id}`}
                checked={selectedLevels.includes(level.id)}
                onCheckedChange={() => toggleLevel(level.id)}
              />
              <Label
                htmlFor={`level-${level.id}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {level.label}
              </Label>
            </div>
          ))}
        </FilterSection>
      </div>
    </div>
  );
}
