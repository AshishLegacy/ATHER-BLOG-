"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./auth";

export async function updateProfileAction(formData: unknown): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const result = profileSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Please correct profile errors.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, bio, image, website, twitter, github } = result.data;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      bio: bio || null,
      image: image || null,
      website: website || null,
      twitter: twitter || null,
      github: github || null,
    },
  });

  revalidatePath("/dashboard/settings");
  if (updatedUser.name) {
    revalidatePath(`/profile/${encodeURIComponent(updatedUser.name)}`);
  }

  return {
    success: true,
    message: "Profile updated successfully!",
    data: updatedUser,
  };
}
