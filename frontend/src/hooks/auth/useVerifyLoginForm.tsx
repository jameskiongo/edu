import type { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/auth";
import { otpSchema } from "@/lib/validators";
import type { ErrorResponse } from "@/types/auth/auth";
import { useAppForm } from "./useAppForm";

export function useVerifyLoginOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const userIdParam = searchParams.get("userId");

  const formik = useAppForm({
    initialValues: {
      code: codeParam || "",
    },
    schema: otpSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const id = userIdParam || sessionStorage.getItem("tempUserId");
      if (!id) {
        router.push("/login");
        return;
      }
      const userId = parseInt(id);

      try {
        const response = await authApi.verifyLogin({
          userId,
          code: values.code,
        });

        console.log("Login response:", response.data);
        sessionStorage.removeItem("tempUserId");
        sessionStorage.removeItem("verificationPurpose");
        sessionStorage.removeItem("deliveryMethod");

        toast.success("Login successful!");
        window.location.href = "/dashboard/profile";
      } catch (error: any) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const data = axiosError?.response?.data;

        const message = data?.error || data?.message || "Something went wrong";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (codeParam) {
      formik.setFieldValue("code", codeParam);
    }
  }, [codeParam]);

  return formik;
}
