"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./auth";

export async function updateUserRoleAction(userId: string, role: "ADMIN" | "AUTHOR" | "READER"): Promise<ActionResponse> {
  await requireAuth(["ADMIN"]);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin");
  return { success: true, message: `User role updated to ${role}.`, data: user };
}

export async function toggleUserBanAction(userId: string, isBanned: boolean): Promise<ActionResponse> {
  const admin = await requireAuth(["ADMIN"]);

  if (admin.id === userId) {
    return { success: false, message: "You cannot ban yourself." };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isBanned },
  });

  revalidatePath("/admin");
  return {
    success: true,
    message: isBanned ? "User has been suspended." : "User suspension lifted.",
    data: user,
  };
}

export async function deleteUserAction(userId: string): Promise<ActionResponse> {
  const admin = await requireAuth(["ADMIN"]);

  if (admin.id === userId) {
    return { success: false, message: "You cannot delete your own admin account." };
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin");
  return { success: true, message: "User and all their data deleted." };
}

export async function deleteAnyPostAction(postId: string): Promise<ActionResponse> {
  await requireAuth(["ADMIN"]);

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, message: "Post removed by admin." };
}

export async function deleteAnyCommentAction(commentId: string): Promise<ActionResponse> {
  await requireAuth(["ADMIN"]);

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath("/admin");
  return { success: true, message: "Comment removed by admin." };
}
