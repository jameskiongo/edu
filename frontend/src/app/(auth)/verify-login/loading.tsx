import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Preparing verification...
        </p>
      </div>
    </div>
  );
}
