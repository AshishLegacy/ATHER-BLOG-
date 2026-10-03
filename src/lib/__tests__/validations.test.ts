import { describe, it, expect } from "vitest";
import {
  signUpSchema,
  loginSchema,
  postSchema,
  commentSchema,
} from "../validations";

describe("Zod Validation Schemas", () => {
  it("validates user sign up schema", () => {
    const valid = signUpSchema.safeParse({
      name: "Alex Rivera",
      email: "alex@example.com",
      password: "password123",
      role: "AUTHOR",
    });
    expect(valid.success).toBe(true);

    const invalid = signUpSchema.safeParse({
      name: "A",
      email: "not-an-email",
      password: "123",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates login schema", () => {
    const valid = loginSchema.safeParse({
      email: "user@example.com",
      password: "secretpassword",
    });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({
      email: "invalid-email",
      password: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates post creation schema", () => {
    const valid = postSchema.safeParse({
      title: "Building Microservices with Node and Go",
      slug: "building-microservices-with-node-and-go",
      content: "<p>This is a complete comprehensive tutorial on microservices.</p>",
      status: "PUBLISHED",
      featured: true,
      categoryIds: ["cat-1"],
      tagNames: ["microservices", "node"],
    });
    expect(valid.success).toBe(true);
  });

  it("validates comment schema", () => {
    const valid = commentSchema.safeParse({
      postId: "post-123",
      content: "Great article, learned a lot!",
    });
    expect(valid.success).toBe(true);

    const invalid = commentSchema.safeParse({
      postId: "",
      content: "",
    });
    expect(invalid.success).toBe(false);
  });
});
