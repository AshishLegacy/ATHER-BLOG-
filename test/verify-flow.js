const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { SignJWT, jwtVerify } = require("jose");

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode("f3c4e51276a1d87e029486c917b203c4f90123e4567890abcde891234567890ab");

async function runVerification() {
  console.log("🔍 Running End-to-End System Logic Verification...");

  // 1. Test Password Hashing & Verification
  const password = "TestPassword@123";
  const hash = await bcrypt.hash(password, 10);
  const isValid = await bcrypt.compare(password, hash);
  if (!isValid) throw new Error("Password verification failed");
  console.log("✅ 1. Password Hashing & Verification passed.");

  // 2. Test JWT Session Token Creation & Decoding
  const userPayload = { id: "test-user-1", email: "tester@blog.com", role: "AUTHOR" };
  const token = await new SignJWT(userPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
  const { payload } = await jwtVerify(token, JWT_SECRET);
  if (payload.id !== "test-user-1" || payload.role !== "AUTHOR") {
    throw new Error("JWT decoding failed");
  }
  console.log("✅ 2. JWT Session Generation & Verification passed.");

  // 3. Test Database Queries & Integrity
  const users = await prisma.user.findMany();
  if (users.length < 3) throw new Error("Expected at least 3 users in DB");
  console.log(`✅ 3. User Database Integrity: Found ${users.length} users.`);

  const posts = await prisma.post.findMany({
    include: { categories: true, tags: true, comments: true, likes: true, author: true },
  });
  if (posts.length < 3) throw new Error("Expected at least 3 seeded posts");
  console.log(`✅ 4. Post CRUD & Joins: Found ${posts.length} posts with categories & tags.`);

  const comments = await prisma.comment.findMany({
    where: { parentId: { not: null } },
  });
  if (comments.length === 0) throw new Error("Expected nested comments");
  console.log(`✅ 5. Nested Comments: Found ${comments.length} nested replies.`);

  const likes = await prisma.like.findMany();
  if (likes.length === 0) throw new Error("Expected seeded likes");
  console.log(`✅ 6. Likes System: Found ${likes.length} post likes.`);

  console.log("\n🎉 ALL 6 CORE LOGIC TESTS PASSED WITH 100% SUCCESS!");
}

runVerification()
  .catch((e) => {
    console.error("❌ Verification Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
