import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground animate-pulse">
        Loading AetherBlog...
      </p>
    </div>
  );
}
