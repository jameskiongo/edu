import type { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type z from "zod";
import { authApi } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import type { ErrorResponse, LoginApiResponse } from "@/types/auth/auth";
import { useAppForm } from "./useAppForm";

export function useLoginForm() {
  const router = useRouter();
  type LoginSchemaType = z.infer<typeof loginSchema>;
  const formik = useAppForm<LoginSchemaType>({
    initialValues: { email: "", password: "" },
    schema: loginSchema,
    onSubmit: async (values) => {
      try {
        const response: AxiosResponse<LoginApiResponse> =
          await authApi.login(values);
        if (response.data.data.requiresOTP) {
          sessionStorage.setItem(
            "tempUserId",
            response.data.data.userId.toString(),
          );
          sessionStorage.setItem("verificationPurpose", "login");

          if (response.data.data.deliveryMethod) {
            sessionStorage.setItem(
              "deliveryMethod",
              response.data.data.deliveryMethod,
            );
          }
          const isEmail = response.data.data.deliveryMethod === "email";
          toast.success(
            isEmail
              ? "Login code sent to your email"
              : "Login code sent to your phone",
          );
          setTimeout(() => {
            toast.dismiss();
            router.push("/verify-login");
          }, 1500);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const data = axiosError?.response?.data;

        const message = data?.error || data?.message || "Something went wrong";
        toast.error(message);
      }
    },
  });
  return formik;
}
