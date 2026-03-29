"use client";
import { Loader2, Mail, MessageCircle, Phone, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/auth/useAuth";
import { useProfileForm } from "@/hooks/auth/useProfileForm";
import { toast } from "sonner";
import { userApi, authApi } from "@/lib/auth";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ResendOtpButton } from "../ui/resend-button";

export function AccountSettingsForm() {
  const { user, isLoading, mutate } = useUser();
  const formik = useProfileForm(user);
  const [step, setStep] = useState<"input" | "verify">("input");
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePhoneChangeRequest = async () => {
    try {
      await userApi.requestPhoneChange({
        phoneNumber: formik.values.phoneNumber,
      });
      setStep("verify");
      toast.success("Verification code sent to your new number");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to request phone change",
      );
    }
  };

  const handleVerifyPhone = async () => {
    setIsVerifying(true);
    try {
      const response = await userApi.verifyPhoneChange({
        phoneNumber: formik.values.phoneNumber,
        code: otpCode,
      });
      const updatedUser = response.data.data || response.data;
      await mutate(updatedUser, false);
      setStep("input");
      setOtpCode("");
      toast.success("Phone number updated successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Invalid verification code",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (!user?.id) return;
    try {
      // Assuming you have or will add a specific resend for phone change, 
      // or we can reuse the request endpoint since it resets the OTP.
      await userApi.requestPhoneChange({
        phoneNumber: formik.values.phoneNumber,
      });
      toast.success("New verification code sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const phoneHasChanged = formik.values.phoneNumber !== user?.phoneNumber;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your security settings and account preferences
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium">Account & Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Update your phone number and notification preferences.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-6">
            {step === "input" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <PhoneInput
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={(value) =>
                      formik.setFieldValue("phoneNumber", value)
                    }
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {formik.errors.phoneNumber as string}
                    </p>
                  )}
                  {phoneHasChanged && !formik.errors.phoneNumber && (
                    <p className="text-xs text-amber-600 font-medium">
                      Changing your phone number requires verification.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Preferred Delivery Method</Label>
                  <Tabs
                    value={formik.values.defaultSmsDelivery ? "sms" : "email"}
                    onValueChange={(value) =>
                      formik.setFieldValue("defaultSmsDelivery", value === "sms")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email" className="gap-2">
                        <Mail className="size-4" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger
                        value="sms"
                        className="gap-2"
                        disabled={user?.isBlacklisted}
                      >
                        <MessageCircle className="size-4" />
                        SMS
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground">
                    {user?.isBlacklisted
                      ? "You may have disabled promotional messages or our service. Please try enabling it or contact support to receive SMS again."
                      : "Choose where you'd like to receive notifications and OTPs."}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    if (phoneHasChanged) {
                      handlePhoneChangeRequest();
                    } else {
                      formik.handleSubmit();
                    }
                  }}
                  className="w-full md:w-auto px-8"
                  disabled={
                    formik.isSubmitting ||
                    (!formik.dirty && !phoneHasChanged) ||
                    (phoneHasChanged && !!formik.errors.phoneNumber)
                  }
                >
                  {formik.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processing...
                    </>
                  ) : phoneHasChanged ? (
                    "Verify New Phone Number"
                  ) : (
                    "Update Preferences"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setStep("input")}
                      className="h-auto p-0 text-xs gap-1"
                    >
                      <ArrowLeft className="size-3" />
                      Back to edit
                    </Button>
                  </div>
                  <Input
                    id="otp"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    A 6-digit code has been sent to{" "}
                    <span className="font-medium text-foreground">
                      {formik.values.phoneNumber}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleVerifyPhone}
                    className="w-full"
                    disabled={isVerifying || otpCode.length !== 6}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Confirm & Update Phone"
                    )}
                  </Button>
                  <div className="flex justify-center">
                    <ResendOtpButton onResend={handleResendPhoneOtp} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium">Security</h3>
            <p className="text-sm text-muted-foreground">
              Change your password to keep your account secure.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
