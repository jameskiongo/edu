import { ArrowUpRight, BookOpen, Clock, Star, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Course } from "@/types/courses/course";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        <img
          src={course.thumbnailUrl || ""}
          alt={course.title || ""}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Overlay button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="gap-2">
            View Course
            <ArrowUpRight className="size-4" />
          </Button>
        </div>

        {/* Category Badge */}
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 bg-background/80 backdrop-blur-sm text-foreground"
        >
          {course.category}
        </Badge>

        {/* Level Badge */}
        <Badge
          variant="outline"
          className="absolute right-3 top-3 border-primary/50 bg-primary text-secondary backdrop-blur-sm"
        >
          {course.level}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={course.thumbnailUrl || ""} />
            {/* <AvatarFallback>{course.instructor.name[0]}</AvatarFallback> */}
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            by <span className="text-foreground">James</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="text-foreground font-medium">{course.rating}</span>
            <span>({course.rating})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="size-3.5" />
            <span>{course.enrollmentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="size-3.5" />
            <span>11 lessons</span>
          </div>
        </div>

        {/* Duration & Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{course.durationHours}</span>
          </div>
          <div className="text-right">{course.price}</div>
        </div>
      </div>
    </Card>
  );
}
