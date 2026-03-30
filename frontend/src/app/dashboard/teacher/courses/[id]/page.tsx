"use client";

import { ChevronLeft, Loader2, Upload, X } from "lucide-react";
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
import { useCategories } from "@/hooks/courses/useCategories";
import { courseSchema } from "@/lib/validators";
import { useAppForm } from "@/hooks/auth/useAppForm";
import { cn } from "@/lib/utils";
import { z } from "zod";

import { api } from "@/lib/auth";

export default function EditCoursePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Fetch current course data
  const { data: courseRes, isLoading: isLoadingCourse, mutate } = useSWR(
    id ? `/courses/${id}` : null,
    async (url) => {
      const res = await api.get(url);
      return res.data;
    }
  );

  const course = courseRes?.data;

  const formik = useAppForm({
    initialValues: {
      title: course?.title || "",
      description: course?.description || "",
      categoryId: course?.categoryId?.toString() || "",
      level: (course?.level?.toUpperCase() as any) || "BEGINNER",
      price: course?.price?.toString() || "0.00",
      status: (course?.status?.toUpperCase() as any) || "DRAFT",
    },
    schema: z.object({
      title: z.string().min(3).max(255),
      description: z.string().min(10).max(2000),
      categoryId: z.string().min(1, "Please select a category"),
      level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        let thumbnailUrl = course?.thumbnailUrl || "";

        // 1. Upload thumbnail if new one selected
        if (thumbnail) {
          const formData = new FormData();
          formData.append("thumbnail", thumbnail);
          const uploadRes = await api.post("/courses/upload-thumbnail", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          thumbnailUrl = uploadRes.data.data.thumbnailUrl || uploadRes.data.thumbnailUrl;
        }

        // 2. Update course
        const payload = {
          ...values,
          level: values.level.toUpperCase(),
          status: values.status.toUpperCase(),
          categoryId: Number(values.categoryId),
          thumbnailUrl,
        };
        
        console.log("[EditCourse] Sending payload:", payload);

        await api.patch(`/courses/${id}`, payload);

        toast.success("Course updated successfully!");
        mutate(); // Refresh local data
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || "Failed to create course");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Show validation errors if any
  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      console.log("[EditCourse] Validation Errors:", formik.errors);
      const firstError = Object.values(formik.errors)[0];
      if (firstError) {
        toast.error(firstError as string);
      }
    }
  }, [formik.submitCount, formik.isValid, formik.errors]);

  // Update thumbnail preview when course data is loaded
  useEffect(() => {
    if (course?.thumbnailUrl && !thumbnail) {
      setThumbnailPreview(course.thumbnailUrl);
    }
  }, [course, thumbnail]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/courses/${id}`, {
        status: "PUBLISHED",
      });
      toast.success("Course published successfully!");
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish course");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCourse || isLoadingCategories) {
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
            <Link href="/dashboard/teacher/courses">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
            <p className="text-muted-foreground">
              Update your course details and settings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/teacher/courses/${id}/curriculum`}>
                    Manage Curriculum
                </Link>
            </Button>
            <Button variant="secondary" asChild>
                <Link href={`/courses/${id}`} target="_blank">
                    Preview
                </Link>
            </Button>
            {course?.status !== "PUBLISHED" && (
              <Button onClick={handlePublish} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Publish Course
              </Button>
            )}
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="text-sm text-destructive">{formik.errors.title as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[120px]"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-sm text-destructive">{formik.errors.description as string}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    onValueChange={(value) => formik.setFieldValue("categoryId", value)}
                    value={formik.values.categoryId}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    onValueChange={(value) => formik.setFieldValue("level", value)}
                    value={formik.values.level}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Course Status</Label>
                  <Select
                    onValueChange={(value) => formik.setFieldValue("status", value)}
                    value={formik.values.status}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "relative aspect-video rounded-lg border-2 border-dashed border-border overflow-hidden flex flex-col items-center justify-center bg-secondary/30",
                    thumbnailPreview && "border-solid border-primary",
                  )}
                >
                  {thumbnailPreview ? (
                    <>
                      <img
                        src={thumbnailPreview.startsWith("data:") ? thumbnailPreview : thumbnailPreview}
                        alt="Thumbnail"
                        className="size-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 size-7"
                        onClick={removeThumbnail}
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="size-8 text-muted-foreground mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleThumbnailChange}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
