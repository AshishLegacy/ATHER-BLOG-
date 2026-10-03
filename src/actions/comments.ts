"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validations";
import { sanitizeHtml } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./auth";

export async function addCommentAction(formData: unknown): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "You must be logged in to leave a comment." };
  }

  const result = commentSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Please write a valid comment (2-1000 characters).",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { postId, content, parentId } = result.data;

  // Rate limit comments: max 5 per minute per user
  const rate = checkRateLimit(`comment:${user.id}`, 5, 60 * 1000);
  if (!rate.success) {
    return {
      success: false,
      message: "You are posting comments too fast. Please wait a moment.",
    };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { slug: true },
  });

  if (!post) {
    return { success: false, message: "Post not found." };
  }

  // If parentId provided, check it exists on this post
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
    });
    if (!parentComment || parentComment.postId !== postId) {
      return { success: false, message: "Invalid parent comment." };
    }
  }

  const sanitizedContent = sanitizeHtml(content);

  const comment = await prisma.comment.create({
    data: {
      content: sanitizedContent,
      postId,
      authorId: user.id,
      parentId: parentId || null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
  });

  revalidatePath(`/post/${post.slug}`);

  return {
    success: true,
    message: "Comment posted successfully!",
    data: comment,
  };
}

export async function deleteCommentAction(commentId: string): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });

  if (!comment) {
    return { success: false, message: "Comment not found." };
  }

  if (comment.authorId !== user.id && user.role !== "ADMIN") {
    return { success: false, message: "You are not authorized to delete this comment." };
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  if (comment.post?.slug) {
    revalidatePath(`/post/${comment.post.slug}`);
  }

  return { success: true, message: "Comment deleted successfully." };
}
