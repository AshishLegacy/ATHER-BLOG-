"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleLikeAction(postId: string): Promise<{
  success: boolean;
  hasLiked?: boolean;
  likeCount?: number;
  message?: string;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "You must be signed in to like this post." };
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: user.id,
      },
    },
  });

  let hasLiked = false;

  if (existingLike) {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });
    hasLiked = false;
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId: user.id,
      },
    });
    hasLiked = true;
  }

  const likeCount = await prisma.like.count({
    where: { postId },
  });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { slug: true },
  });

  if (post?.slug) {
    revalidatePath(`/post/${post.slug}`);
  }

  return {
    success: true,
    hasLiked,
    likeCount,
  };
}

export async function getPostLikeStatus(postId: string) {
  const user = await getCurrentUser();
  const count = await prisma.like.count({ where: { postId } });
  
  if (!user) {
    return { hasLiked: false, count };
  }

  const existing = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: user.id,
      },
    },
  });

  return { hasLiked: !!existing, count };
}
