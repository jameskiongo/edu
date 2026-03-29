import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";
import { useAppForm } from "./useAppForm";
import type { User } from "@/types/auth/auth";
import { useState } from "react";

export function useChangePasswordForm(user?: User | null) {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");

  const formik = useAppForm({
    initialValues: {
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      code: "",
    },
    schema: changePasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (step === "request") {
          const response = await authApi.requestPasswordChange({
            email: values.email,
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });
          toast.success(
            response.data.message || "Verification code sent to your email!",
          );
          setStep("verify");
        } else {
          if (!values.code) {
            toast.error("Please enter the verification code.");
            return;
          }
          const response = await authApi.verifyPasswordChange({
            email: values.email,
            code: values.code,
            newPassword: values.newPassword,
          });
          toast.success(
            response.data.message ||
              "Password changed successfully! Please login again.",
          );
          await authApi.logout();
          router.push("/login");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to process request",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResend = async () => {
    if (!user?.id) return;
    try {
      const response = await authApi.resendPasswordChangeOTP({
        userId: user.id,
        purpose: "password_change",
      });
      toast.success(response.data.message || "New code sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to resend code");
    }
  };

  return {
    formik,
    step,
    setStep,
    handleResend,
  };
}
