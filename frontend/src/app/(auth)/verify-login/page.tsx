import { GraduationCap } from "lucide-react";
import { Suspense } from "react";
import { VerifyLoginForm } from "@/components/auth/VerifyLoginForm";

export default function VerifyRegisterPage() {
  return (
    <div className="flex min-h-screen bg-secondary">
      <div className="flex w-full flex-col bg-background/95 backdrop-blur-sm">
        <div className="flex lg:hidden items-center justify-center p-6 border-b border-border">
          <a href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="size-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">App</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Sign in to your account
              </h2>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <VerifyLoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
