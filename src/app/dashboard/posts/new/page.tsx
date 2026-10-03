import React from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PostForm } from "@/components/editor/post-form";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check role: Author or Admin
  if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Create New Article</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Draft your ideas, insert images, format rich code blocks, and publish.
        </p>
      </div>

      <PostForm categories={categories} />
    </div>
  );
}
