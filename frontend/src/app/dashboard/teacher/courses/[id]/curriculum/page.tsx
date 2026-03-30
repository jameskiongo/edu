"use client";

import { 
  ChevronLeft, 
  GripVertical, 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText, 
  PlayCircle, 
  MoreVertical,
  Layout,
  ChevronDown,
  ChevronUp,
  Save,
  Video,
  FileIcon,
  X,
  Upload
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CurriculumPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: courseRes, isLoading, mutate } = useSWR(
    id ? `/api/courses/${id}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    }
  );

  const course = courseRes?.data;
  const sections = course?.sections || [];

  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const activeLesson = sections
    .flatMap((s: any) => s.lessons)
    .find((l: any) => l.id === activeLessonId);

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const res = await fetch(`/api/courses/${id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSectionTitle }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewSectionTitle("");
      setIsAddingSection(false);
      mutate();
      toast.success("Section created");
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/teacher/courses/${id}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold truncate max-w-[400px]">{course?.title}</h1>
          <Badge variant="outline">Curriculum Builder</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/courses/${id}`} target="_blank">Preview</Link>
          </Button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: The Curriculum List */}
        <aside className="w-80 border-r bg-secondary/5 flex flex-col">
          <div className="p-4 border-b bg-background/50 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Course Structure</span>
            <Button size="icon" variant="ghost" className="size-8" onClick={() => setIsAddingSection(true)}>
                <Plus className="size-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {sections.map((section: any, idx: number) => (
                <SectionItem 
                    key={section.id} 
                    section={section} 
                    index={idx} 
                    activeLessonId={activeLessonId}
                    onSelectLesson={setActiveLessonId}
                    refresh={mutate}
                />
              ))}

              {isAddingSection ? (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Input 
                        autoFocus 
                        placeholder="Section title..." 
                        value={newSectionTitle}
                        onChange={e => setNewSectionTitle(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addSection()}
                    />
                    <div className="flex gap-1">
                        <Button size="sm" onClick={addSection} className="flex-1">Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAddingSection(false)}>Cancel</Button>
                    </div>
                </div>
              ) : (
                <Button variant="ghost" className="w-full justify-start text-muted-foreground border-dashed border-2 h-12" onClick={() => setIsAddingSection(true)}>
                    <Plus className="mr-2 size-4" /> New Section
                </Button>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Right Panel: The Interactive Editor */}
        <main className="flex-1 bg-background overflow-y-auto">
          {activeLesson ? (
            <LessonInlineEditor 
                lesson={activeLesson} 
                courseId={id} 
                onClose={() => setActiveLessonId(null)}
                onUpdate={mutate}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <Layout className="size-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Editor Canvas</h2>
                <p className="text-muted-foreground max-w-sm">
                    Select a lesson from the left sidebar to start editing its content, or add a new lesson to your curriculum.
                </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionItem({ section, index, activeLessonId, onSelectLesson, refresh }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const addLesson = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/courses/sections/${section.id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, type: "TEXT" }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewTitle("");
        setIsAddingLesson(false);
        refresh();
        onSelectLesson(data.data.id);
        toast.success("Lesson added");
      }
    } catch (e) { toast.error("Error"); }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between group">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors py-1"
        >
            {isOpen ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
            <span className="truncate">{index + 1}. {section.title}</span>
        </button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="size-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsAddingLesson(true)}>Add Lesson</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete Section</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isOpen && (
        <div className="pl-4 space-y-1 border-l-2 ml-1.5 border-muted">
          {section.lessons?.map((lesson: any) => (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                activeLessonId === lesson.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {lesson.type === "TEXT" ? <FileText className="size-3.5" /> : <PlayCircle className="size-3.5" />}
              <span className="truncate text-left flex-1 font-medium">{lesson.title}</span>
            </button>
          ))}
          
          {isAddingLesson ? (
            <div className="pt-2 space-y-2">
                <Input 
                    size={1}
                    className="h-8 text-xs" 
                    placeholder="Lesson name..." 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addLesson()}
                    autoFocus
                />
                <div className="flex gap-1">
                    <Button size="xs" className="h-7 text-[10px] flex-1" onClick={addLesson}>Add</Button>
                    <Button size="xs" variant="ghost" className="h-7 text-[10px]" onClick={() => setIsAddingLesson(false)}>Cancel</Button>
                </div>
            </div>
          ) : (
            <button 
                onClick={() => setIsAddingLesson(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 italic"
            >
                <Plus className="size-3" /> Add lesson...
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LessonInlineEditor({ lesson, onUpdate, onClose }: any) {
  const [title, setTitle] = useState(lesson.title);
  const [type, setType] = useState(lesson.type);
  const [contentBody, setContentBody] = useState(lesson.contentBody || "");
  const [contentUrl, setContentUrl] = useState(lesson.contentUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setTitle(lesson.title);
    setType(lesson.type);
    setContentBody(lesson.contentBody || "");
    setContentUrl(lesson.contentUrl || "");
  }, [lesson]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            title, 
            type, 
            contentBody: type === "TEXT" ? contentBody : null,
            contentUrl: type !== "TEXT" ? contentUrl : null 
        }),
      });
      if (res.ok) {
        toast.success("Lesson saved");
        onUpdate();
      }
    } catch (e) { toast.error("Error saving"); }
    finally { setIsSaving(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("content", file);
    try {
      const res = await fetch("/api/courses/lessons/upload-content", { method: "POST", body: formData });
      const data = await res.json();
      setContentUrl(data.data.contentUrl);
      toast.success("Upload complete");
    } catch (e) { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                {type === "TEXT" ? <FileText className="size-5 text-primary" /> : <PlayCircle className="size-5 text-primary" />}
            </div>
            <div>
                <h2 className="font-bold text-lg leading-tight">{title || "Untitled Lesson"}</h2>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{type} MODE</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="px-6 shadow-lg shadow-primary/20">
                {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                Update Lesson
            </Button>
        </div>
      </div>

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Lesson Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Setting up your workspace" className="h-11" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Content Type</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-11">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TEXT">Text Article</SelectItem>
                        <SelectItem value="DOCUMENT">Video / File Upload</SelectItem>
                        <SelectItem value="QUIZ">Interactive Quiz</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {type === "TEXT" ? (
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Article Body</Label>
                <Textarea 
                    value={contentBody} 
                    onChange={e => setContentBody(e.target.value)} 
                    placeholder="Share your knowledge here..."
                    className="min-h-[500px] text-lg leading-relaxed focus-visible:ring-1 p-6"
                />
            </div>
        ) : (
            <Card className="border-dashed border-2 bg-secondary/5">
                <CardContent className="p-12">
                    {contentUrl ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                                {contentUrl.match(/\.(mp4|webm)$/i) ? <Video className="size-8 text-primary" /> : <FileIcon className="size-8 text-primary" />}
                            </div>
                            <div className="text-center">
                                <p className="font-bold">Resource is ready</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{contentUrl}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setContentUrl("")}>Replace Content</Button>
                        </div>
                    ) : (
                        <div className="relative flex flex-col items-center gap-4">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="size-10 animate-spin text-primary" />
                                    <p className="font-medium">Uploading your content...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="size-16 rounded-full bg-secondary flex items-center justify-center">
                                        <Upload className="size-8 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold">Upload Lesson Material</p>
                                        <p className="text-xs text-muted-foreground">Video (MP4), Document (PDF), or Source Files</p>
                                    </div>
                                    <Button variant="secondary">Select File</Button>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

const Label = ({ children, className }: any) => (
    <label className={cn("block text-sm font-medium mb-1.5", className)}>{children}</label>
);
