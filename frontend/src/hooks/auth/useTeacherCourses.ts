import useSWR from "swr";
import { api } from "@/lib/auth";

export function useTeacherCourses() {
  const { data, error, isLoading, mutate } = useSWR("/courses/teacher/my-courses", async (url) => {
    const res = await api.get(url);
    return res.data.data || res.data;
  });

  return {
    courses: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
