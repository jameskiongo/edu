"use client";

import useSWR from "swr";
import { authApi, userApi } from "@/lib/auth";

import type { User } from "@/types/auth/auth";

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<User>(
    "user",
    async () => {
      try {
        const response = await userApi.getProfile();
        return response.data.data || response.data.user || response.data;
      } catch (err: any) {
        console.error(
          "Profile fetch failed:",
          err.response?.status,
          err.response?.data || err.message,
        );
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      await mutate(null as any, false);
      window.location.href = "/login";
    }
  };

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
    logout,
  };
}
export function useProfile() {
  const { user, isLoading, isError, mutate } = useUser();

  const updateProfile = async (data: { name?: string; image?: string }) => {
    try {
      const response = await userApi.updateProfile(data);
      // Ensure we mutate with the user object, not the whole response
      const updatedUser =
        response.data.data || response.data.user || response.data;
      await mutate(updatedUser, false);
      return { success: true, data: updatedUser };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update profile",
      };
    }
  };

  return {
    user,
    isLoading,
    isError,
    updateProfile,
  };
}
