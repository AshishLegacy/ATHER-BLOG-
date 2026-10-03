"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { postSchema } from "@/lib/validations";
import { slugify, calculateReadingTime, sanitizeHtml } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./auth";

export async function createPostAction(formData: unknown): Promise<ActionResponse> {
  const user = await requireAuth(["ADMIN", "AUTHOR"]);
  const result = postSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { title, slug: customSlug, content, excerpt, coverImage, status, featured, categoryIds, tagNames } =
    result.data;

  // Base slug or generate
  let finalSlug = customSlug ? slugify(customSlug) : slugify(title);
  if (!finalSlug) finalSlug = `post-${Date.now()}`;

  // Check unique slug and append timestamp if needed
  const existingPost = await prisma.post.findUnique({
    where: { slug: finalSlug },
  });

  if (existingPost) {
    finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const sanitizedContent = sanitizeHtml(content);
  const readingTime = calculateReadingTime(sanitizedContent);

  // Ensure tags exist or create them
  const tagConnects = [];
  if (tagNames && tagNames.length > 0) {
    for (const rawTag of tagNames) {
      const cleanTag = rawTag.trim();
      if (!cleanTag) continue;
      const tagSlug = slugify(cleanTag);
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name: cleanTag, slug: tagSlug },
      });
      tagConnects.push({ tagId: tag.id });
    }
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug: finalSlug,
      content: sanitizedContent,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      status,
      featured: featured || false,
      readingTime,
      authorId: user.id,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      categories: {
        create: categoryIds.map((catId) => ({ categoryId: catId })),
      },
      tags: {
        create: tagConnects,
      },
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/post/${finalSlug}`);

  return {
    success: true,
    message: status === "PUBLISHED" ? "Post published successfully!" : "Draft saved successfully!",
    data: post,
  };
}

export async function updatePostAction(id: string, formData: unknown): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "You must be signed in to edit posts." };
  }

  const existing = await prisma.post.findUnique({
    where: { id },
    include: { categories: true, tags: true },
  });

  if (!existing) {
    return { success: false, message: "Post not found." };
  }

  if (existing.authorId !== user.id && user.role !== "ADMIN") {
    return { success: false, message: "You do not have permission to edit this post." };
  }

  const result = postSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { title, slug: customSlug, content, excerpt, coverImage, status, featured, categoryIds, tagNames } =
    result.data;

  let finalSlug = customSlug ? slugify(customSlug) : existing.slug;
  if (finalSlug !== existing.slug) {
    const slugExists = await prisma.post.findUnique({
      where: { slug: finalSlug },
    });
    if (slugExists && slugExists.id !== id) {
      finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  const sanitizedContent = sanitizeHtml(content);
  const readingTime = calculateReadingTime(sanitizedContent);

  // Update tags
  const tagConnects = [];
  if (tagNames && tagNames.length > 0) {
    for (const rawTag of tagNames) {
      const cleanTag = rawTag.trim();
      if (!cleanTag) continue;
      const tagSlug = slugify(cleanTag);
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name: cleanTag, slug: tagSlug },
      });
      tagConnects.push({ tagId: tag.id });
    }
  }

  // Delete existing joins and recreate
  await prisma.postCategory.deleteMany({ where: { postId: id } });
  await prisma.postTag.deleteMany({ where: { postId: id } });

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug: finalSlug,
      content: sanitizedContent,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      status,
      featured: featured || false,
      readingTime,
      publishedAt:
        status === "PUBLISHED"
          ? existing.publishedAt || new Date()
          : existing.publishedAt,
      categories: {
        create: categoryIds.map((catId) => ({ categoryId: catId })),
      },
      tags: {
        create: tagConnects,
      },
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/post/${existing.slug}`);
  revalidatePath(`/post/${finalSlug}`);

  return {
    success: true,
    message: "Post updated successfully!",
    data: updatedPost,
  };
}

export async function deletePostAction(id: string): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return { success: false, message: "Post not found" };

  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return { success: false, message: "Forbidden" };
  }

  await prisma.post.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: true, message: "Post deleted successfully" };
}

export async function incrementViewCountAction(slug: string): Promise<void> {
  try {
    await prisma.post.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Ignore silent errors for analytics view counter
  }
}
