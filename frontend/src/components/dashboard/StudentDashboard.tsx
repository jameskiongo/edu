"use client";

import { useUser } from "@/hooks/auth/useAuth";
import { useEnrolledCourses } from "@/hooks/courses/useEnrolledCourses";
import { useCategories } from "@/hooks/courses/useCategories";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Star, 
  ArrowRight, 
  PlayCircle,
  TrendingUp,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentDashboard() {
  const { user } = useUser();
  const { courses: enrolledCourses, isLoading: isEnrolledLoading } = useEnrolledCourses();
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  const completedCourses = enrolledCourses.filter(c => c.enrollment?.progressPercent === 100);
  const inProgressCourses = enrolledCourses.filter(c => (c.enrollment?.progressPercent || 0) < 100);

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrolledCourses.length,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Completed",
      value: completedCourses.length,
      icon: Trophy,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "In Progress",
      value: inProgressCourses.length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Avg. Progress",
      value: `${enrolledCourses.length > 0 
        ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.enrollment?.progressPercent || 0), 0) / enrolledCourses.length) 
        : 0}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    }
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your learning today.</p>
        </div>
        <Button asChild size="lg" className="rounded-full font-bold shadow-lg shadow-primary/20">
          <Link href="/courses">
            <Search className="size-4 mr-2" />
            Explore New Courses
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <PlayCircle className="size-5 text-primary" />
              Continue Learning
            </h2>
            {enrolledCourses.length > 3 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/courses" className="text-primary font-bold">View all</Link>
              </Button>
            )}
          </div>

          {isEnrolledLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.slice(0, 3).map((course) => (
                <Card key={course.id} className="group hover:shadow-md transition-all duration-300 border-none bg-card/50">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="size-20 rounded-lg overflow-hidden bg-muted flex-none">
                        <img 
                          src={course.thumbnailUrl || ""} 
                          alt={course.title || ""} 
                          className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3 w-full">
                        <div className="space-y-1">
                          <Badge variant="secondary" className="text-[10px] font-bold uppercase">{course.category?.name}</Badge>
                          <h3 className="font-bold text-base truncate">{course.title}</h3>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-primary">{Math.round(course.enrollment?.progressPercent || 0)}%</span>
                          </div>
                          <Progress value={course.enrollment?.progressPercent} className="h-1.5" />
                        </div>
                      </div>
                      <Button asChild className="sm:ml-4 w-full sm:w-auto font-bold rounded-full group-hover:px-6 transition-all">
                        <Link href={`/dashboard/courses/${course.id}`}>
                          Resume
                          <ArrowRight className="size-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="size-8 text-primary opacity-40" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">No courses enrolled yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Start your learning journey today by exploring our wide range of courses.
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-full font-bold">
                  <Link href="/courses">Browse Catalog</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Recommendations/Categories */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="size-5 text-amber-500" />
            Top Categories
          </h2>
          <Card className="border-none bg-card/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {isCategoriesLoading ? (
                  [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full" />)
                ) : (
                  categories.slice(0, 6).map((category) => (
                    <Link 
                      key={category.id} 
                      href={`/courses?category=${category.name}`}
                      className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group"
                    >
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">{category.name}</span>
                      <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))
                )}
              </div>
              <div className="p-4 bg-primary/5">
                <Button variant="link" className="w-full text-primary font-bold text-xs p-0 h-auto" asChild>
                  <Link href="/courses">View all categories</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tip Card */}
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 size-24 bg-white/10 rounded-full blur-2xl" />
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg">Pro Tip! 💡</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                Consistent learning is key. Try to spend at least 15 minutes a day to build a strong habit!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
