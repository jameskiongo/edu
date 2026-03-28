"use client";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordForm } from "@/hooks/auth/useForgotPasswordForm";

export function ForgotPasswordForm() {
  const formik = useForgotPasswordForm();

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10"
          />
        </div>
        {formik.touched.email && formik.errors.email && (
          <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending code...
          </>
        ) : (
          "Send Reset Code"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
