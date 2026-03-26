"use client";

import useSWR from "swr";
import { userApi } from "@/lib/auth";

import type { User } from "@/types/auth/auth";

interface UserResponse {
  success: boolean;
  user: User;
}
export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>(
    "user",
    async () => {
      try {
        const response = await userApi.getProfile();
        return response.data;
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

  return {
    user: data?.user,
    isLoading,
    isError: error,
    mutate,
  };
}
export function useProfile() {
  const { user, isLoading, isError, mutate } = useUser();

  const updateProfile = async (data: { name?: string; image?: string }) => {
    try {
      const response = await userApi.updateProfile(data);
      await mutate(response.data, false);
      return { success: true, data: response.data };
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
