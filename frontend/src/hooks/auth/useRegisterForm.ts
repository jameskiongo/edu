import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type z from "zod";
import { authApi } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import type { ErrorResponse } from "@/types/auth/auth";
import { useAppForm } from "./useAppForm";

export function useRegistrationForm() {
  const router = useRouter();
  type RegistrationSchemaType = z.infer<typeof registerSchema>;
  const formik = useAppForm<RegistrationSchemaType>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    },
    schema: registerSchema,
    onSubmit: async (values) => {
      const { confirmPassword, ...registeredValues } = values;
      try {
        const response = await authApi.register(registeredValues);
        sessionStorage.setItem(
          "tempUserId",
          response.data.data.userId.toString(),
        );
        sessionStorage.setItem("verificationPurpose", "verification");
        sessionStorage.setItem(
          "deliveryMethod",
          response.data.data.deliveryMethod?.toString() || "",
        );

        const isEmail = response.data.data.deliveryMethod === "email";
        toast.success(
          isEmail
            ? "Account created! Please check your email for the OTP."
            : "Account created! Please check your phone for the OTP.",
        );
        router.push("/verify-register");
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
