import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-primary/10 items-center justify-center text-primary mb-2">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <p className="text-6xl font-black text-primary">404</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The article, topic, or page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="default" size="default" className="gap-2 rounded-xl">
              <Home className="h-4 w-4" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="default" className="gap-2 rounded-xl">
              <Search className="h-4 w-4" />
              <span>Explore Search</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
