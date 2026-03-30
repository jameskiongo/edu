import { api } from "./auth";
import type { Course } from "@/types/courses/course";

export async function getCourses(params?: { limit?: number; offset?: number }): Promise<Course[]> {
  try {
    const response = await api.get("/courses", { params });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    throw error;
  }
}
