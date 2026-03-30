import useSWR from "swr";
import { api } from "@/lib/auth";
import type { Category } from "@/types/courses/course";

export function useCategories() {
  const { data, error, isLoading } = useSWR("/categories", async (url) => {
    const res = await api.get(url);
    return res.data.data || res.data;
  });

  return {
    categories: (data as Category[]) || [],
    isLoading,
    isError: error,
  };
}
