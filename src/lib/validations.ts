import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  role: z.enum(["READER", "AUTHOR"]).default("READER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(250)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z.string().optional().nullable().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  tagNames: z.array(z.string()).default([]),
});

export const commentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  content: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(1000, "Comment cannot exceed 1000 characters"),
  parentId: z.string().optional().nullable(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().max(500).optional().nullable(),
  image: z.string().url().or(z.string().startsWith("/uploads/")).optional().nullable(),
  website: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),
  twitter: z.string().max(100).optional().nullable().or(z.literal("")),
  github: z.string().max(100).optional().nullable().or(z.literal("")),
});

export const userManagementSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "AUTHOR", "READER"]).optional(),
  isBanned: z.boolean().optional(),
});
