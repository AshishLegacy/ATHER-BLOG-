import React from "react";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PostForm } from "@/components/editor/post-form";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { id: resolvedParams.id },
    include: {
      categories: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    notFound();
  }

  // Permission check
  if (post.authorId !== user.id && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    status: post.status as "DRAFT" | "PUBLISHED",
    featured: post.featured,
    categoryIds: post.categories.map((c) => c.categoryId),
    tagNames: post.tags.map((t) => t.tag.name),
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Article</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Make updates to your draft or published article.
        </p>
      </div>

      <PostForm
        initialData={initialData}
        categories={categories}
        isEditing={true}
      />
    </div>
  );
}
