"use client";

import { useEffect } from "react";
import { incrementViewCountAction } from "@/actions/posts";

interface PostViewTrackerProps {
  slug: string;
}

export function PostViewTracker({ slug }: PostViewTrackerProps) {
  useEffect(() => {
    // Only increment once per browser tab session
    const storageKey = `viewed_post_${slug}`;
    if (!sessionStorage.getItem(storageKey)) {
      sessionStorage.setItem(storageKey, "true");
      incrementViewCountAction(slug);
    }
  }, [slug]);

  return null;
}
