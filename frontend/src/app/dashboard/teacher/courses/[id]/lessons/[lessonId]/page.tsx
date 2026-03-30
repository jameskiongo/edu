"use client";

import { 
  ChevronLeft, 
  FileText, 
  Loader2, 
  Save, 
  Upload, 
  Video, 
  PlayCircle,
  FileIcon
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function LessonEditorPage() {
  const params = useParams();
  const { id: courseId, lessonId } = params;
  const router = useRouter();

  const { data: lessonRes, isLoading, mutate } = useSWR(
    lessonId ? `/api/courses/lessons/${lessonId}` : null, // We need to fix this endpoint or use course endpoint
    async () => {
        // Since we don't have a direct GET /lessons/:id, we fetch the course and find the lesson
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        const course = data.data;
        let foundLesson = null;
        course.sections.forEach((s: any) => {
            const l = s.lessons.find((l: any) => l.id.toString() === lessonId);
            if (l) foundLesson = l;
        });
        return { data: foundLesson };
    }
  );

  const lesson = lessonRes?.data;

  const [title, setTitle] = useState("");
  const [type, setType] = useState("TEXT");
  const [contentBody, setContentBody] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || "");
      setType(lesson.type || "TEXT");
      setContentBody(lesson.contentBody || "");
      setContentUrl(lesson.contentUrl || "");
    }
  }, [lesson]);

  const onSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          contentBody: type === "TEXT" ? contentBody : null,
          contentUrl: type !== "TEXT" ? contentUrl : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save lesson");
      toast.success("Lesson saved successfully");
      router.push(`/dashboard/teacher/courses/${courseId}/curriculum`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("content", file);

    try {
      const res = await fetch("/api/courses/lessons/upload-content", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setContentUrl(data.data.contentUrl);
      toast.success("File uploaded successfully");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/teacher/courses/${courseId}/curriculum`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Lesson</h1>
            <p className="text-muted-foreground">Configure your lesson content and assets.</p>
          </div>
        </div>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save Lesson
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Introduction to React Hooks"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Lesson Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Text Article</SelectItem>
                    <SelectItem value="DOCUMENT">Video / File</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {type === "TEXT" && (
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <CardDescription>Write your lesson content using Markdown or plain text.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="min-h-[400px] font-mono text-sm"
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="Start writing your lesson content here..."
                />
              </CardContent>
            </Card>
          )}

          {type === "DOCUMENT" && (
            <Card>
              <CardHeader>
                <CardTitle>Video or Resource File</CardTitle>
                <CardDescription>Upload a video (MP4/WebM) or a document for this lesson.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contentUrl ? (
                  <div className="rounded-lg border border-border p-4 bg-secondary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {contentUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <PlayCircle className="size-8 text-primary" />
                      ) : (
                        <FileIcon className="size-8 text-primary" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Resource Attached</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">{contentUrl}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setContentUrl("")}>Change</Button>
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-secondary/5">
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading content...</p>
                        </div>
                    ) : (
                        <>
                            <Video className="size-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">Upload lesson resource</p>
                            <p className="text-xs text-muted-foreground mb-4">MP4, WebM, PDF, or Zip (Max 100MB)</p>
                            <Button variant="secondary" size="sm" className="relative pointer-events-none">
                                Select File
                            </Button>
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={handleFileUpload}
                                accept="video/*,.pdf,.zip,.doc,.docx"
                            />
                        </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Preview</CardTitle>
              <CardDescription>How this lesson looks to students.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        {type === "TEXT" && <FileText className="size-4 text-primary" />}
                        {type === "DOCUMENT" && <PlayCircle className="size-4 text-primary" />}
                        <span className="font-semibold text-sm">{title || "Untitled Lesson"}</span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/3" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Approx. 5 mins to complete</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
