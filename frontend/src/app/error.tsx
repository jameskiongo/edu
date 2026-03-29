"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground max-w-md">
          {error.message ||
            "An unexpected error occurred. Please try again or contact support if the problem persists."}
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Reload Page
        </Button>
        <Button onClick={() => reset()} className="gap-2">
          Try again
        </Button>
      </div>
    </div>
  );
}
