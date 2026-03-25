import type { Course } from "@/components/courses/CourseCard";

export async function getCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses");
  if (!res.ok) throw new Error("Failed to fetch courses");
  const data = await res.json();
  return data.data;
}
