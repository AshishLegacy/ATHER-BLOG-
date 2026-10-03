"use server";

import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  deleteSessionCookie,
  getCurrentUser,
} from "@/lib/auth";
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { randomBytes } from "crypto";
import { SessionUser, UserRole } from "@/types";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function signUpAction(formData: unknown): Promise<ActionResponse> {
  const result = signUpSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role } = result.data;

  // Rate limit
  const rate = checkRateLimit(`signup:${email}`, 5, 60 * 1000);
  if (!rate.success) {
    return { success: false, message: "Too many sign-up attempts. Please try again later." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email address already exists.",
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role as "READER" | "AUTHOR" | "ADMIN",
    },
  });

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role as UserRole,
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  return {
    success: true,
    message: "Account created successfully!",
    data: sessionUser,
  };
}

export async function loginAction(formData: unknown): Promise<ActionResponse> {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Please provide a valid email and password.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // Rate limit
  const rate = checkRateLimit(`login:${email}`, 10, 60 * 1000);
  if (!rate.success) {
    return { success: false, message: "Too many login attempts. Please wait 1 minute." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.passwordHash) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  if (user.isBanned) {
    return {
      success: false,
      message: "This account has been suspended. Please contact support.",
    };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role as UserRole,
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  return {
    success: true,
    message: "Logged in successfully!",
    data: sessionUser,
  };
}

export async function logoutAction(): Promise<ActionResponse> {
  await deleteSessionCookie();
  return { success: true, message: "Logged out successfully" };
}

export async function forgotPasswordAction(
  formData: unknown
): Promise<ActionResponse<{ resetToken?: string; resetUrl?: string }>> {
  const result = forgotPasswordSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  const { email } = result.data;

  const rate = checkRateLimit(`forgot:${email}`, 3, 60 * 1000);
  if (!rate.success) {
    return { success: false, message: "Too many reset attempts. Please wait a few minutes." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Return success to avoid email enumeration
    return {
      success: true,
      message: "If an account with that email exists, we sent a password reset link.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Delete old tokens and create new
  await prisma.passwordResetToken.deleteMany({
    where: { email: user.email },
  });

  await prisma.passwordResetToken.create({
    data: {
      token,
      email: user.email,
      expiresAt,
    },
  });

  // Simulated email link for local dev or SMTP
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  console.log(`[AUTH] Password Reset Link for ${user.email}: ${resetUrl}`);

  return {
    success: true,
    message: "Password reset instructions sent to your email!",
    data: { resetToken: token, resetUrl },
  };
}

export async function resetPasswordAction(formData: unknown): Promise<ActionResponse> {
  const result = resetPasswordSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { token, password } = result.data;

  const resetTokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetTokenRecord || new Date() > resetTokenRecord.expiresAt) {
    return {
      success: false,
      message: "Reset link has expired or is invalid.",
    };
  }

  const newHash = await hashPassword(password);

  await prisma.user.update({
    where: { email: resetTokenRecord.email },
    data: { passwordHash: newHash },
  });

  await prisma.passwordResetToken.deleteMany({
    where: { email: resetTokenRecord.email },
  });

  return {
    success: true,
    message: "Your password has been successfully reset! You can now log in.",
  };
}

export async function googleOAuthLoginAction(profile: {
  email: string;
  name?: string;
  image?: string;
}): Promise<ActionResponse> {
  if (!profile.email) {
    return { success: false, message: "Email required from Google OAuth" };
  }

  let user = await prisma.user.findUnique({
    where: { email: profile.email.toLowerCase() },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email.toLowerCase(),
        name: profile.name || profile.email.split("@")[0],
        image: profile.image || null,
        role: "AUTHOR", // Default google sign-in users get author
      },
    });
  } else if (user.isBanned) {
    return { success: false, message: "This account has been banned." };
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role as UserRole,
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  return {
    success: true,
    message: "Logged in via Google successfully!",
    data: sessionUser,
  };
}

export async function getSessionAction() {
  return await getCurrentUser();
}
