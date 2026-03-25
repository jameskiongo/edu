"use client";

import { Grid3X3, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Course, CourseCard } from "./CourseCard";

const allCourses: Course[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp 2024",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack developer.",
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop",
    instructor: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    category: "Development",
    level: "Beginner",
    duration: "42 hours",
    rating: 4.8,
    reviewCount: 12453,
    studentsEnrolled: 89234,
    lessonsCount: 284,
    price: 89.99,
    isEnrolled: true,
  },
  {
    id: "2",
    title: "UI/UX Design Masterclass",
    description:
      "Master the art of user interface and user experience design with Figma and modern principles.",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    instructor: {
      name: "Marcus Johnson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    category: "Design",
    level: "Intermediate",
    duration: "28 hours",
    rating: 4.9,
    reviewCount: 8932,
    studentsEnrolled: 45678,
    lessonsCount: 156,
    price: 79.99,
  },
  {
    id: "3",
    title: "Python for Data Science & Machine Learning",
    description:
      "From basics to advanced ML algorithms. Includes hands-on projects with real datasets.",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop",
    instructor: {
      name: "Dr. Emily Watson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    category: "Data Science",
    level: "Intermediate",
    duration: "56 hours",
    rating: 4.7,
    reviewCount: 15678,
    studentsEnrolled: 123456,
    lessonsCount: 342,
    price: 129.99,
  },
  {
    id: "4",
    title: "Digital Marketing Complete Guide",
    description:
      "SEO, Social Media, PPC, Content Marketing - everything you need to grow any business online.",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    instructor: {
      name: "Alex Rivera",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    category: "Marketing",
    level: "Beginner",
    duration: "35 hours",
    rating: 4.6,
    reviewCount: 6789,
    studentsEnrolled: 34567,
    lessonsCount: 198,
    price: 69.99,
  },
  {
    id: "5",
    title: "React & Next.js Advanced Patterns",
    description:
      "Deep dive into React 19 features, Server Components, and building production apps with Next.js.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    instructor: {
      name: "James Park",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    category: "Development",
    level: "Advanced",
    duration: "24 hours",
    rating: 4.9,
    reviewCount: 4521,
    studentsEnrolled: 23456,
    lessonsCount: 128,
    price: 99.99,
  },
  {
    id: "6",
    title: "Introduction to Photography",
    description:
      "Learn camera basics, composition, lighting, and editing to capture stunning photos.",
    thumbnail:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=225&fit=crop",
    instructor: {
      name: "Lisa Thompson",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    },
    category: "Photography",
    level: "Beginner",
    duration: "18 hours",
    rating: 4.8,
    reviewCount: 3456,
    studentsEnrolled: 19876,
    lessonsCount: 86,
    price: 0,
    isFree: true,
  },
  {
    id: "7",
    title: "Business Strategy & Leadership",
    description:
      "Develop strategic thinking skills and learn to lead teams effectively in modern organizations.",
    thumbnail:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    instructor: {
      name: "Michael Foster",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
    },
    category: "Business",
    level: "Intermediate",
    duration: "32 hours",
    rating: 4.5,
    reviewCount: 2890,
    studentsEnrolled: 15678,
    lessonsCount: 145,
    price: 89.99,
  },
  {
    id: "8",
    title: "AWS Cloud Practitioner Certification",
    description:
      "Prepare for the AWS Cloud Practitioner exam with hands-on labs and practice tests.",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop",
    instructor: {
      name: "David Kim",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
    category: "Development",
    level: "Beginner",
    duration: "22 hours",
    rating: 4.7,
    reviewCount: 7845,
    studentsEnrolled: 56789,
    lessonsCount: 112,
    price: 59.99,
  },
  {
    id: "9",
    title: "Motion Graphics with After Effects",
    description:
      "Create stunning animations and visual effects for videos, social media, and web.",
    thumbnail:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop",
    instructor: {
      name: "Nina Patel",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    category: "Design",
    level: "Advanced",
    duration: "38 hours",
    rating: 4.8,
    reviewCount: 2156,
    studentsEnrolled: 12345,
    lessonsCount: 178,
    price: 109.99,
  },
];

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
  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(
        course.category.toLowerCase().replace(" ", "-"),
      );

    const matchesLevel =
      selectedLevels.length === 0 ||
      selectedLevels.includes(course.level.toLowerCase());

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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
          {/* Tabs */}
          <Tabs defaultValue="all" className="hidden sm:block">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="enrolled">My Courses</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort */}
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

          {/* View Toggle */}
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

      {/* Course Grid */}
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

      {/* Load More */}
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
