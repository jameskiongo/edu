import useSWR from "swr";
import { getEnrolledCourses } from "@/lib/courses";
import type { Course } from "@/types/courses/course";
import { useUser } from "@/hooks/auth/useAuth";

export function useEnrolledCourses() {
  const { user } = useUser();
  
  const { data, error, isLoading, mutate } = useSWR(
    user ? "/courses/enrolled" : null,
    getEnrolledCourses,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30 seconds as fallback
    }
  );

  return {
    courses: (data as Course[]) || [],
    isLoading,
    isError: error,
    mutate,
  };
}
