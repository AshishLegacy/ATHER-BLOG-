"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "@/actions/likes";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialHasLiked?: boolean;
  initialCount?: number;
  userId?: string | null;
}

export function LikeButton({
  postId,
  initialHasLiked = false,
  initialCount = 0,
  userId,
}: LikeButtonProps) {
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async () => {
    if (!userId) {
      alert("Please log in to like this post.");
      return;
    }

    if (isLoading) return;

    // Optimistic state
    const nextHasLiked = !hasLiked;
    const nextCount = nextHasLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setHasLiked(nextHasLiked);
    setLikeCount(nextCount);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    try {
      setIsLoading(true);
      const res = await toggleLikeAction(postId);
      if (res.success) {
        if (res.hasLiked !== undefined) setHasLiked(res.hasLiked);
        if (res.likeCount !== undefined) setLikeCount(res.likeCount);
      } else {
        // Rollback
        setHasLiked(hasLiked);
        setLikeCount(likeCount);
        alert(res.message || "Failed to toggle like");
      }
    } catch {
      setHasLiked(hasLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-semibold",
        hasLiked
          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 shadow-sm"
          : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/60"
      )}
      aria-label="Like post"
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          hasLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground group-hover:text-rose-500",
          isAnimating && "scale-125"
        )}
      />
      <span>{likeCount}</span>
      <span className="sr-only">likes</span>
    </button>
  );
}
