import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validators";
import { useAppForm } from "./useAppForm";

export function useForgotPasswordForm() {
  const router = useRouter();

  return useAppForm({
    initialValues: {
      email: "",
    },
    schema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await authApi.forgotPassword(values);
        toast.success(response.data.message || "Reset code sent!");
        sessionStorage.setItem("resetEmail", values.email);
        router.push("/reset-password");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to send reset code",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });
}
