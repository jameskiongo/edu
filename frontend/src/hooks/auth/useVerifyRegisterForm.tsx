import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/auth";
import { otpSchema } from "@/lib/validators";
import type { ErrorResponse } from "@/types/auth/auth";
import { useAppForm } from "./useAppForm";

export function useVerifyRegisterOtpForm() {
  const router = useRouter();
  const formik = useAppForm({
    initialValues: {
      code: "",
    },
    schema: otpSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const id = sessionStorage.getItem("tempUserId");
      if (!id) {
        router.push("/register");
        return;
      }
      const userId = parseInt(id);

      try {
        await authApi.verifyRegistration({
          userId,
          code: values.code,
        });

        sessionStorage.removeItem("tempUserId");
        sessionStorage.removeItem("tempPhone");
        sessionStorage.removeItem("tempEmail");
        sessionStorage.removeItem("verificationPurpose");
        sessionStorage.removeItem("deliveryMethod");

        toast.success("Registration successful! Please login.");
        router.push("/login");
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const data = axiosError?.response?.data;

        const message = data?.error || data?.message || "Something went wrong";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });
  return formik;
}
