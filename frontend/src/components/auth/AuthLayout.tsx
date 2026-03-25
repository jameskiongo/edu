import { GraduationCap } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-secondary p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 size-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 size-96 rounded-full bg-accent blur-3xl" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="size-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">LearnHub</span>
        </Link>

        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-foreground text-balance">
            Unlock your potential with world-class learning
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Join over 50,000 learners who are advancing their careers through
            expert-led courses and hands-on projects.
          </p>

          {/* Stats */}
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Courses</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Learners</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">95%</p>
              <p className="text-sm text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 rounded-xl bg-card/50 backdrop-blur-sm p-6 border border-border">
          <p className="text-foreground italic">
            &quot;LearnHub transformed my career. The courses are practical,
            engaging, and helped me land my dream job.&quot;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">SK</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Sarah Kim</p>
              <p className="text-xs text-muted-foreground">
                Software Engineer at Google
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 flex-col bg-background">
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center justify-center p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="size-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LearnHub</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
