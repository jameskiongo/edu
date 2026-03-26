import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/auth";
import { otpSchema } from "@/lib/validators";
import { useAppForm } from "./useAppForm";

export function useVerifyLoginOtpForm() {
  const router = useRouter();
  const formik = useAppForm({
    initialValues: {
      code: "",
    },
    schema: otpSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const id = sessionStorage.getItem("tempUserId");
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
        router.refresh();
        router.push("/dashboard/profile");
      } catch (error: any) {
        toast.error(error.response?.data?.error || "An error occurred");
      } finally {
        setSubmitting(false);
      }
    },
  });
  return formik;
}
