"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-destructive/10 items-center justify-center text-destructive mb-2">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <p className="text-5xl font-black text-destructive">500</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while rendering this page. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            size="default"
            className="gap-2 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/">
            <Button variant="outline" size="default" className="gap-2 rounded-xl">
              <Home className="h-4 w-4" />
              <span>Back Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
