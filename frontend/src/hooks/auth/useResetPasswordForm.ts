import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { useAppForm } from "./useAppForm";

export function useResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const emailParam = searchParams.get("email");

  const formik = useAppForm({
    initialValues: {
      code: codeParam || "",
      newPassword: "",
      confirmPassword: "",
    },
    schema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const email = emailParam || sessionStorage.getItem("resetEmail");
      if (!email) {
        toast.error("Email not found. Please try again.");
        router.push("/forgot-password");
        return;
      }

      try {
        const response = await authApi.resetPassword({
          email,
          code: values.code,
          newPassword: values.newPassword,
        });
        toast.success(response.data.message || "Password reset successful!");
        sessionStorage.removeItem("resetEmail");
        router.push("/login");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to reset password",
        );
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
