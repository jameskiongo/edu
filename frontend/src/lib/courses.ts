import { api } from "./auth";
import type { Course } from "@/types/courses/course";

export async function getCourses(params?: { 
  limit?: number; 
  offset?: number;
  search?: string;
  categoryIds?: number[];
  levels?: string[];
}): Promise<Course[]> {
  try {
    const response = await api.get("/courses", { 
      params,
      paramsSerializer: {
        indexes: null // Serialize arrays as categoryIds=1&categoryIds=2
      }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    throw error;
  }
}

export async function getEnrolledCourses(): Promise<Course[]> {
  try {
    const response = await api.get("/courses/enrolled");
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to fetch enrolled courses:", error);
    throw error;
  }
}
