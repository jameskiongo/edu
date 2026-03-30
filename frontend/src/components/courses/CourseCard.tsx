import { ArrowUpRight, BookOpen, Star, User, Users, CheckCircle2, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { Course } from "@/types/courses/course";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const cardLink = course.isEnrolled 
    ? `/dashboard/courses/${course.id}` 
    : `/courses/${course.id}`;

  return (
    <Link href={cardLink} className="block group h-full">
      <Card 
        className={cn(
          "overflow-hidden bg-card border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 h-full flex flex-col gap-0 py-0 relative",
          course.isEnrolled && "border-primary/20 bg-secondary/30 ring-1 ring-primary/5"
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted shrink-0">
          <img
            src={course.thumbnailUrl || ""}
            alt={course.title || ""}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          
          {/* Subtle overlay for better badge readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-60" />

          {/* Overlay button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
            <Button size="sm" className={cn("gap-2 pointer-events-none", course.isEnrolled && "bg-foreground text-background hover:bg-foreground/90")}>
              {course.isEnrolled ? (
                <>
                  Continue Learning
                  <PlayCircle className="size-4" />
                </>
              ) : (
                <>
                  View Course
                  <ArrowUpRight className="size-4" />
                </>
              )}
            </Button>
          </div>

          {/* Category Badge */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-md text-foreground shadow-sm"
            >
              {course.category?.name || "Uncategorized"}
            </Badge>
          </div>

          {/* Enrolled Status Badge */}
          {course.isEnrolled && (
            <div className="absolute right-3 top-3 flex items-center justify-center">
              <div className="bg-foreground text-background rounded-full p-1 shadow-lg border border-background/20 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
          )}

          {/* Level Badge (moved if enrolled) */}
          {!course.isEnrolled && (
            <Badge
              variant="outline"
              className="absolute right-3 top-3 border-primary/20 bg-primary/90 text-primary-foreground backdrop-blur-md capitalize shadow-sm"
            >
              {course.level?.toLowerCase()}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {course.title}
              </h3>
              {course.isEnrolled && (
                <span className="text-[10px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 border border-border">
                  Enrolled
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="size-7 border border-background">
                  <AvatarImage src={course.teacher?.image || ""} />
                  <AvatarFallback className="text-[10px]">
                    <User className="size-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
                  {course.teacher?.firstName} {course.teacher?.lastName}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                <span className="text-sm font-bold text-foreground">{Number(course.averageRating).toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  <span>{course.enrollmentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="size-3.5" />
                  <span>{course.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0} lessons</span>
                </div>
              </div>
              
              {!course.isEnrolled && (
                <span className="text-lg font-bold text-foreground">
                  ${course.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
