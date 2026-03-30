"use client";

import { use, useEffect, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { 
  Star, 
  Users, 
  Loader2,
  Heart,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  Lock
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@/hooks/auth/useAuth";
import { cn } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useUser();
  
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [openSections, setOpenSections] = useState<number[]>([]);

  // Use SWR for enrollment status to make it easier to mutate
  const { data: enrollmentData, mutate: mutateEnrollment } = useSWR(
    user && id ? `/courses/${id}/enrollment-status` : null,
    async (url) => {
      const res = await api.get(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  const isEnrolled = enrollmentData?.data?.isEnrolled || enrollmentData?.isEnrolled || false;

  const toggleSection = (sectionId: number) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId) 
        : [...prev, sectionId]
    );
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes] = await Promise.all([
          api.get(`/courses/${id}`)
        ]);

        const data = courseRes.data.data || courseRes.data;
        setCourse(data);
        setSections(data.sections || []);
        
        // Open the first section by default
        if (data.sections?.length > 0) {
          setOpenSections([data.sections[0].id]);
        }
      } catch (error: any) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success("Successfully enrolled!");
      mutateEnrollment({ data: { isEnrolled: true } }, false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.patch(`/courses/${id}`, { status: "PUBLISHED" });
      toast.success("Course published successfully!");
      setCourse({ ...course, status: "PUBLISHED" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish course");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
        <Button variant="link" onClick={() => router.push("/courses")}>Return to browse</Button>
      </div>
    );
  }

  const isTeacher = user?.id === course.teacherId;
  const isDraft = course.status === "DRAFT";

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <main className="container max-w-7xl mx-auto px-6 py-8 md:py-10 space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
            
            {/* Left Column: Content */}
            <div className="space-y-10">
                
                {/* Course Header Info */}
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {isDraft && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Draft Mode</Badge>}
                        <Badge variant="secondary" className="rounded-md font-medium">
                            {course.category?.name || "Uncategorized"}
                        </Badge>
                        <Badge variant="outline" className="rounded-md font-medium capitalize">
                            {course.level?.toLowerCase()}
                        </Badge>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                        {course.title}
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                        {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-8 pt-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-12 border-2 border-background shadow-sm">
                                <AvatarImage src={course.teacher?.image} />
                                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                    {course.teacher?.firstName?.[0]}{course.teacher?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Instructor</p>
                                <p className="font-semibold text-foreground">
                                  {course.teacher?.firstName} {course.teacher?.lastName}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center h-10 gap-8">
                            <Separator orientation="vertical" className="hidden sm:block" />
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="size-4 fill-amber-500 text-amber-500" />
                                        <span className="font-bold text-base">{course.averageRating || "0.0"}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{course.totalReviews || 0} reviews</span>
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 text-foreground">
                                        <Users className="size-4 text-muted-foreground" />
                                        <span className="font-bold text-base">{course.enrollmentCount || 0}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Curriculum Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Course Content</h2>
                        <span className="text-sm text-muted-foreground font-medium">
                            {sections.length} sections • {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} lessons
                        </span>
                    </div>

                    <div className="border rounded-lg overflow-hidden bg-card divide-y">
                        {sections.map((section, idx) => {
                            const isOpen = openSections.includes(section.id);
                            return (
                                <div key={section.id} className="flex flex-col">
                                    <button 
                                        onClick={() => toggleSection(section.id)}
                                        className={cn(
                                            "w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left",
                                            isOpen && "bg-muted/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-muted-foreground/60">{(idx + 1).toString().padStart(2, '0')}</span>
                                            <span className="font-semibold text-base">{section.title}</span>
                                        </div>
                                        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
                                    </button>
                                    
                                    <div className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <div className="overflow-hidden bg-muted/10">
                                            <div className="divide-y border-t">
                                                {section.lessons?.map((lesson: any) => (
                                                    <div key={lesson.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            {lesson.type === 'VIDEO' ? <PlayCircle className="size-4 text-primary" /> : <FileText className="size-4 text-muted-foreground" />}
                                                            <span className="text-sm font-medium">{lesson.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {!isEnrolled && !isTeacher && <Lock className="size-3 text-muted-foreground/40" />}
                                                            <span className="text-xs text-muted-foreground">10:45</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Instructor Section */}
                <section className="space-y-6 pt-4">
                    <h2 className="text-2xl font-bold tracking-tight">About the Instructor</h2>
                    <Card className="rounded-xl border shadow-none bg-muted/10">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <Avatar className="size-24 border-2 border-background shadow-sm">
                                    <AvatarImage src={course.teacher?.image} />
                                    <AvatarFallback className="text-2xl font-bold">
                                        {course.teacher?.firstName?.[0]}{course.teacher?.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-4 flex-1">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">{course.teacher?.firstName} {course.teacher?.lastName}</h3>
                                    <p className="text-sm font-medium text-primary">Instructor</p>
                                </div>
                                {course.teacher?.bio && (
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {course.teacher.bio}
                                    </p>
                                )}
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* Right Column: Sidebar CTA */}
            <aside className="lg:sticky lg:top-[88px] space-y-6">
                <Card className="rounded-2xl border shadow-xl shadow-black/5 overflow-hidden pt-0">
                    <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden group">
                        {course.thumbnailUrl ? (
                            <img 
                                src={course.thumbnailUrl} 
                                alt={course.title} 
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <ImageIcon className="size-16 text-muted-foreground/20" />
                        )}
                    </div>
                    
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold tracking-tight">${course.price}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {isTeacher ? (
                                <div className="space-y-3">
                                    <Button 
                                        variant="outline"
                                        className="w-full h-12 rounded-lg font-semibold text-base shadow-sm border-2" 
                                        asChild
                                    >
                                        <Link href={`/dashboard/teacher/courses/${id}`}>
                                            Manage Course
                                        </Link>
                                    </Button>
                                    {isDraft && (
                                        <Button 
                                            onClick={handlePublish} 
                                            disabled={publishing}
                                            className="w-full h-12 rounded-lg font-semibold text-base shadow-sm"
                                        >
                                            {publishing ? <Loader2 className="size-5 animate-spin mr-2" /> : "Publish Course"}
                                        </Button>
                                    )}
                                </div>
                            ) : isEnrolled ? (
                                <Button className="w-full h-12 rounded-lg font-semibold text-base shadow-sm flex items-center justify-center gap-2 group" asChild>
                                    <Link href={`/dashboard/courses/${id}`}>
                                        Go to Learning Dashboard
                                        <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleEnroll} 
                                    disabled={enrolling}
                                    className="w-full h-12 rounded-lg font-semibold text-base shadow-sm"
                                >
                                    {enrolling ? <Loader2 className="size-5 animate-spin mr-2" /> : "Enroll Now"}
                                </Button>
                            )}
                            {!isTeacher && (
                                <Button variant="outline" className="w-full h-12 rounded-lg font-semibold text-base border-2 hover:bg-muted/50 transition-colors">
                                    <Heart className="size-4 mr-2" />
                                    Add to Wishlist
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </aside>
        </div>
      </main>

      {/* Footer / Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-40">
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-2xl font-bold">${course.price}</p>
                <p className="text-xs font-semibold text-emerald-600">Special Offer</p>
            </div>
            {isTeacher ? (
                <Button className="h-12 rounded-lg px-8 font-bold" asChild>
                    <Link href={`/dashboard/teacher/courses/${id}`}>Manage</Link>
                </Button>
            ) : isEnrolled ? (
                <Button className="h-12 rounded-lg px-8 font-bold" asChild>
                    <Link href={`/dashboard/courses/${id}`}>Resume</Link>
                </Button>
            ) : (
                <Button onClick={handleEnroll} disabled={enrolling} className="h-12 rounded-lg px-8 font-bold flex-1">
                    {enrolling ? <Loader2 className="size-4 animate-spin" /> : "Enroll Now"}
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}
