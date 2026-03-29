"use client";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyRegisterOtpForm } from "@/hooks/auth/useVerifyRegisterForm";
import { authApi } from "@/lib/auth";
import { ResendOtpButton } from "../ui/resend-button";

export function VerifyRegisterForm() {
  const router = useRouter();
  const formik = useVerifyRegisterOtpForm();
  const handleResend = async () => {
    const id = sessionStorage.getItem("tempUserId");
    if (!id) {
      router.push("/login");
      return;
    }
    const userId = parseInt(id);

    try {
      const response = await authApi.resendRegisterOTP({
        userId,
        purpose: "registration",
      });
      toast.success(response.data.message || "New code sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to resend code");
      throw error;
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Code</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="code"
            type="text"
            placeholder="Enter OTP Code"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10"
          />
        </div>
        {formik.touched.code && formik.errors.code && (
          <p className="mt-1 text-xs text-red-600">{formik.errors.code}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>

      <ResendOtpButton onResend={handleResend} initialCountdown={60} />
    </form>
  );
}
