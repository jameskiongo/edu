"use client";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePasswordForm } from "@/hooks/auth/useChangePasswordForm";
import { useUser } from "@/hooks/auth/useAuth";
import { ResendOtpButton } from "../ui/resend-button";

export function ChangePasswordForm() {
  const { user } = useUser();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { formik, step, handleResend } = useChangePasswordForm(user);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {step === "request" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                name="currentPassword"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {formik.touched.currentPassword &&
              formik.errors.currentPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {formik.errors.currentPassword as string}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                name="newPassword"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="mt-1 text-xs text-red-600">
                {formik.errors.newPassword as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Confirm new password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 pr-10"
              />
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {formik.errors.confirmPassword as string}
                </p>
              )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A verification code has been sent to {user?.email}
          </p>
          {formik.touched.code && formik.errors.code && (
            <p className="mt-1 text-xs text-red-600">
              {formik.errors.code as string}
            </p>
          )}
          <div className="pt-2">
            <ResendOtpButton onResend={handleResend} />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            {step === "request" ? "Requesting..." : "Verifying..."}
          </>
        ) : step === "request" ? (
          "Request Password Change"
        ) : (
          "Verify & Change Password"
        )}
      </Button>
    </form>
  );
}
