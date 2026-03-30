"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Loader2, 
  PlayCircle,
  Menu,
  X,
  Lock
} from "lucide-react";
import { api } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useSWR, { mutate as globalMutate } from "swr";

export default function LearningDashboard() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  
  // Fetch course with curriculum
  const { data: courseRes, error: courseError, isLoading: isLoadingCourse } = useSWR(
    id ? `/courses/${id}` : null,
    async (url) => {
      const res = await api.get(url);
      return res.data.data || res.data;
    }
  );

  // Fetch enrollment status for progress
  const { data: enrollmentRes, isLoading: isLoadingEnrollment, mutate: mutateEnrollment } = useSWR(
    id ? `/courses/${id}/enrollment-status` : null,
    async (url) => {
      const res = await api.get(url);
      return res.data.data || res.data;
    }
  );

  // Fetch individual lesson progress
  const { data: lessonProgressData, mutate: mutateLessonProgress } = useSWR(
    id ? `/courses/${id}/progress` : null,
    async (url) => {
      const res = await api.get(url);
      return res.data.data || res.data;
    }
  );

  const course = courseRes;
  const sections = course?.sections || [];
  const enrollment = enrollmentRes?.enrollment;
  const completedLessonIds = new Set((lessonProgressData || []).map((p: any) => p.lessonId));
  const isLoading = isLoadingCourse || isLoadingEnrollment;

  // Set initial active lesson
  useEffect(() => {
    if (sections.length > 0 && !activeLesson) {
      const firstLesson = sections[0].lessons?.[0];
      if (firstLesson) setActiveLesson(firstLesson);
    }
  }, [sections, activeLesson]);

  const handleToggleComplete = async (lessonId: number) => {
    if (!lessonId) return;
    const isCompleted = completedLessonIds.has(lessonId);
    setIsUpdatingProgress(true);
    
    try {
      await api.post(`/courses/lessons/${lessonId}/progress`, { 
        isCompleted: !isCompleted 
      });
      
      // Refresh local data
      mutateLessonProgress();
      mutateEnrollment();
      
      // Refresh sidebar progress
      globalMutate("/courses/enrolled");
      
      toast.success(!isCompleted ? "Lesson completed!" : "Lesson marked as incomplete");
    } catch (error: any) {
      toast.error("Failed to update progress");
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const isLessonCompleted = (lessonId: number) => completedLessonIds.has(lessonId);

  const allLessons = sections.flatMap((s: any) => s.lessons || []);
  const currentIndex = allLessons.findIndex((l: any) => l.id === activeLesson?.id);

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">Failed to load course</h2>
        <Button variant="link" onClick={() => router.push("/courses")}>Return to courses</Button>
      </div>
    );
  }

  const totalLessons = sections.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0);
  const progressPercent = enrollment?.progressPercent || 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {!sidebarOpen && (
        <Button 
          variant="secondary" 
          size="icon" 
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/courses/${id}`)} className="rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate">{course.title}</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {activeLesson?.title || "Select a lesson"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-3 mr-4">
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                  {progressPercent.toFixed(0)}% Complete
                </span>
                <Progress value={progressPercent} className="w-32 h-1.5" />
             </div>
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setSidebarOpen(!sidebarOpen)}
               className={cn("hidden lg:flex", !sidebarOpen && "bg-muted")}
             >
               <Menu className="size-5" />
             </Button>
          </div>
        </header>

        {/* Video / Content Container */}
        <main className="flex-1 overflow-y-auto bg-black/5 dark:bg-white/5 p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center">
              {activeLesson?.type === 'VIDEO' ? (
                <div className="size-full flex flex-col items-center justify-center text-white gap-4">
                    <PlayCircle className="size-20 text-white/20" />
                    <p className="text-sm font-medium text-white/40">Video Content: {activeLesson.contentUrl || "No URL provided"}</p>
                </div>
              ) : activeLesson?.contentBody ? (
                <div className="size-full bg-card p-8 md:p-12 overflow-y-auto text-foreground">
                    <h2 className="text-2xl font-bold mb-6">{activeLesson.title}</h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {activeLesson.contentBody}
                    </div>
                </div>
              ) : (
                <div className="size-full flex flex-col items-center justify-center text-muted-foreground gap-4 bg-card">
                    <FileText className="size-16 text-muted-foreground/20" />
                    <p className="text-sm font-medium">This lesson has no preview content.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-border">
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto gap-2"
                  onClick={handlePrevious}
                  disabled={currentIndex <= 0}
                >
                    <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button 
                  onClick={() => handleToggleComplete(activeLesson?.id)}
                  disabled={isUpdatingProgress || !activeLesson}
                  className={cn(
                    "w-full md:w-auto gap-2 transition-all",
                    isLessonCompleted(activeLesson?.id) 
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md"
                  )}
                  variant={isLessonCompleted(activeLesson?.id) ? "outline" : "default"}
                >
                  {isUpdatingProgress ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isLessonCompleted(activeLesson?.id) ? (
                    <>Completed <CheckCircle2 className="size-4 fill-emerald-600 text-white" /></>
                  ) : (
                    <>Mark as Complete <CheckCircle2 className="size-4" /></>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto gap-2"
                  onClick={handleNext}
                  disabled={currentIndex >= allLessons.length - 1}
                >
                    Next <ChevronRight className="size-4" />
                </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Curriculum Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-40 w-80 bg-card border-l transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:hidden"
      )}>
        <div className="flex flex-col h-full">
            <div className="h-14 flex items-center justify-between px-6 border-b shrink-0">
                <span className="font-bold text-sm">Course Content</span>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                    <X className="size-4" />
                </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <div className="divide-y">
                    {sections.map((section: any, sIdx: number) => (
                        <div key={section.id} className="bg-muted/30">
                            <div className="px-6 py-3 bg-muted/50">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Section {sIdx + 1}: {section.title}
                                </span>
                            </div>
                            <div className="bg-card">
                                {section.lessons?.map((lesson: any) => {
                                    const isActive = activeLesson?.id === lesson.id;
                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className={cn(
                                                "w-full px-6 py-4 flex items-start gap-3 text-left transition-colors hover:bg-muted/50",
                                                isActive && "bg-primary/5 border-l-4 border-primary"
                                            )}
                                        >
                                            {lesson.type === 'VIDEO' ? (
                                                <PlayCircle className={cn("size-4 mt-0.5", isActive ? "text-primary" : "text-muted-foreground")} />
                                            ) : (
                                                <FileText className={cn("size-4 mt-0.5", isActive ? "text-primary" : "text-muted-foreground")} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm font-medium leading-tight", isActive ? "text-primary" : "text-foreground")}>
                                                    {lesson.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground">10:00</span>
                                            </div>
                                            {isLessonCompleted(lesson.id) && (
                                              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </aside>
    </div>
  );
}
