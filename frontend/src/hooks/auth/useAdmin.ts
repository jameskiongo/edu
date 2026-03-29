import useSWR from "swr";
import { adminApi } from "@/lib/auth";
import { toast } from "sonner";
import type { User } from "@/types/auth/auth";
import type { Category } from "@/types/courses/course";

export function useAdminUsers() {
  const { data, error, mutate, isLoading } = useSWR("/users", () =>
    adminApi.getAllUsers().then((res) => {
      console.log("[useAdminUsers] API Raw Response:", res.data);
      const extracted = (res.data as any).data || res.data;
      console.log("[useAdminUsers] Extracted:", extracted);
      return extracted;
    }),
  );

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await adminApi.toggleUserStatus({ userId, isActive });
      toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user status");
    }
  };

  const assignRole = async (userId: number, role: string) => {
    try {
      await adminApi.assignRole({ userId, role });
      toast.success(`Role assigned successfully`);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to assign role");
    }
  };

  return {
    users: data as User[] | undefined,
    isLoading,
    error,
    toggleUserStatus,
    assignRole,
    mutate,
  };
}

export function useAdminCategories() {
  const { data, error, mutate, isLoading } = useSWR("/categories", () =>
    adminApi.getAllCategories().then((res) => {
      console.log("[useAdminCategories] API Raw Response:", res.data);
      const extracted = (res.data as any).data || res.data;
      console.log("[useAdminCategories] Extracted:", extracted);
      return extracted;
    }),
  );

  const createCategory = async (data: { name: string; description?: string }) => {
    try {
      await adminApi.createCategory(data);
      toast.success("Category created successfully");
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create category");
    }
  };

  const updateCategory = async (id: number, data: { name?: string; description?: string }) => {
    try {
      await adminApi.updateCategory(id, data);
      toast.success("Category updated successfully");
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update category");
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await adminApi.deleteCategory(id);
      toast.success("Category deleted successfully");
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete category");
    }
  };

  return {
    categories: data as Category[] | undefined,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    mutate,
  };
}
