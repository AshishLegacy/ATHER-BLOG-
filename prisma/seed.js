const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.postCategory.deleteMany({});
  await prisma.postTag.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.user.deleteMany({});

  // Password hashes
  const adminPassword = await bcrypt.hash("Admin@123456", 10);
  const authorPassword = await bcrypt.hash("Author@123456", 10);
  const readerPassword = await bcrypt.hash("Reader@123456", 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "admin@blog.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      bio: "Chief Editor & Full-Stack Architect with 12+ years building modern distributed web systems and engineering platforms.",
      website: "https://alexrivera.dev",
      twitter: "alexrivera_dev",
      github: "alexrivera",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
  });

  const authorUser = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "author@blog.com",
      passwordHash: authorPassword,
      role: "AUTHOR",
      bio: "Senior Frontend Engineer & Design Systems Specialist. Passionate about Next.js 15, accessibility, and micro-interactions.",
      website: "https://sarahchen.design",
      twitter: "sarahchen_ui",
      github: "sarahchen",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    },
  });

  const readerUser = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "reader@blog.com",
      passwordHash: readerPassword,
      role: "READER",
      bio: "Tech enthusiast, avid reader, and aspiring software developer exploring modern web stacks.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
  });

  console.log("✅ Seeded Users: Admin, Author, Reader");

  // 2. Create Categories
  const categoriesData = [
    { name: "Web Development", slug: "web-development", description: "Modern frontend frameworks, Next.js, React 19, TypeScript and CSS techniques." },
    { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "LLMs, prompt engineering, generative models, and autonomous AI agents." },
    { name: "Architecture & Scale", slug: "architecture-scale", description: "Distributed systems, database design, caching strategies, and high-concurrency systems." },
    { name: "UI & UX Design", slug: "ui-ux-design", description: "Design systems, typography, micro-interactions, dark mode, and design psychology." },
    { name: "DevOps & Cloud", slug: "devops-cloud", description: "Docker, Kubernetes, CI/CD pipelines, serverless infrastructure, and observability." },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log("✅ Seeded Categories");

  // 3. Create Tags
  const tagsData = [
    "Next.js", "React 19", "TypeScript", "Tailwind CSS", "Prisma",
    "PostgreSQL", "AI Agents", "System Design", "Performance", "Web Security"
  ];

  const tags = {};
  for (const tagName of tagsData) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const created = await prisma.tag.create({
      data: { name: tagName, slug },
    });
    tags[slug] = created;
  }
  console.log("✅ Seeded Tags");

  // 4. Create Posts
  const post1 = await prisma.post.create({
    data: {
      title: "Mastering Next.js 15 App Router: Server Actions & Cache Semantics",
      slug: "mastering-nextjs-15-app-router-server-actions",
      excerpt: "Deep dive into Next.js 15 architecture, async request APIs, React 19 integration, and production-ready server actions.",
      content: `<h2>The Evolution of Modern Web Engineering</h2>
<p>Next.js 15 introduces revolutionary updates that streamline server-driven rendering while maintaining high interactivity. By integrating React 19 and optimizing streaming SSR, developers gain unprecedented control over rendering lifecycles.</p>

<h3>1. Async Request APIs & Cookies</h3>
<p>In Next.js 15, asynchronous headers and cookies provide cleaner boundaries between server-side data fetching and dynamic execution:</p>
<pre><code class="language-typescript">// Accessing cookies asynchronously in Next.js 15
import { cookies } from "next/headers";

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return verifySession(token);
}</code></pre>

<h3>2. Server Actions with Direct Database Mutation</h3>
<p>Gone are the days of manual API route scaffolding for basic mutations. With Server Actions, form submissions and asynchronous operations run directly on the server with end-to-end type safety and automatic cache revalidation:</p>
<blockquote>
<p>"Server Actions eliminate boilerplate while preserving security boundaries when paired with schema validation like Zod."</p>
</blockquote>

<h3>3. Optimistic UI and State Transitions</h3>
<p>Coupled with React 19's <code>useActionState</code> and <code>useOptimistic</code> hooks, user feedback is instantaneous before the network request even resolves.</p>

<h3>Summary</h3>
<p>Embracing these primitives allows engineering teams to ship faster, reduce bundle sizes to client browsers, and build robust digital experiences with zero compromise on performance.</p>`,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      featured: true,
      viewCount: 1420,
      readingTime: 4,
      authorId: authorUser.id,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      categories: {
        create: [
          { categoryId: categories["web-development"].id },
          { categoryId: categories["architecture-scale"].id },
        ],
      },
      tags: {
        create: [
          { tagId: tags["next-js"].id },
          { tagId: tags["react-19"].id },
          { tagId: tags["typescript"].id },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Building Autonomous AI Coding Agents: Patterns and Pitfalls",
      slug: "building-autonomous-ai-coding-agents",
      excerpt: "Explore architectural designs for agentic workflows, memory persistence, tool execution sandboxes, and automated verification loops.",
      content: `<h2>The Rise of Agentic Architecture</h2>
<p>Large Language Models are transitioning from passive conversational chatbots into active, autonomous agents capable of reasoning, decomposing tasks, executing terminal commands, and verifying outputs.</p>

<h3>Core Components of an Agent System</h3>
<ul>
  <li><strong>Perception & Context:</strong> Ingesting workspace trees, error logs, and user requirements.</li>
  <li><strong>Reasoning & Decomposition:</strong> Breaking multi-faceted briefs into structured, sequential execution plans.</li>
  <li><strong>Tool Invocation:</strong> Calling filesystem APIs, lint checkers, compilers, and browser testers.</li>
  <li><strong>Self-Correction & Reflection:</strong> Inspecting stack traces, running unit tests, and iterating until completion.</li>
</ul>

<h3>Handling Safe Tool Execution</h3>
<pre><code class="language-typescript">interface ToolExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

async function executeCommandSafely(cmd: string): Promise<ToolExecutionResult> {
  // Validate against unauthorized bash commands
  validateSecurityBoundaries(cmd);
  return runProcessSandbox(cmd);
}</code></pre>

<h3>Conclusion</h3>
<p>The future of software development belongs to human-agent symbiosis where engineers direct high-level architecture while autonomous agents implement, test, and polish the codebase.</p>`,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      featured: true,
      viewCount: 2890,
      readingTime: 5,
      authorId: adminUser.id,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      categories: {
        create: [
          { categoryId: categories["artificial-intelligence"].id },
          { categoryId: categories["architecture-scale"].id },
        ],
      },
      tags: {
        create: [
          { tagId: tags["ai-agents"].id },
          { tagId: tags["system-design"].id },
          { tagId: tags["typescript"].id },
        ],
      },
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: "Crafting High-Performance Glassmorphic UI with Tailwind CSS",
      slug: "crafting-high-performance-glassmorphic-ui-tailwind",
      excerpt: "Learn how to achieve fluid animations, vibrant dark-mode palettes, and modern backdrop-blur aesthetics without layout shifts.",
      content: `<h2>The Renaissance of Modern UI Design</h2>
<p>Modern web applications must captivate users within milliseconds. Combining subtle lighting gradients, translucent glass textures, and crisp typographic hierarchy transforms ordinary dashboards into luxurious software experiences.</p>

<h3>Design Principles for 2026</h3>
<p>1. <strong>Harmonious HSL Color Palettes:</strong> Avoid stark hex primaries. Use tailored HSL color tokens for seamless dark-to-light theme transitions.</p>
<p>2. <strong>Layered Depth:</strong> Use subtle borders (<code>border-white/10</code>) alongside <code>backdrop-blur-md</code> to simulate frosted glass.</p>
<p>3. <strong>Micro-Interactions:</strong> Subtle hover scales, spring physics, and focus rings give interfaces a tactile feel.</p>

<pre><code class="language-css">/* Sleek Glassmorphic Card Utility */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}</code></pre>`,
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      featured: false,
      viewCount: 980,
      readingTime: 3,
      authorId: authorUser.id,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      categories: {
        create: [
          { categoryId: categories["ui-ux-design"].id },
          { categoryId: categories["web-development"].id },
        ],
      },
      tags: {
        create: [
          { tagId: tags["tailwind-css"].id },
          { tagId: tags["react-19"].id },
        ],
      },
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: "Draft Guide: Zero Trust Security in Full-Stack Web Applications",
      slug: "zero-trust-security-full-stack-web-apps",
      excerpt: "An upcoming deep dive into HTTP-only cookie rotation, input sanitization, CSP headers, and rate limiting.",
      content: `<h2>Security is Not an Afterthought</h2>
<p>Draft post outlining defence-in-depth strategies for modern web developers...</p>`,
      coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
      status: "DRAFT",
      featured: false,
      viewCount: 0,
      readingTime: 2,
      authorId: authorUser.id,
      categories: {
        create: [
          { categoryId: categories["architecture-scale"].id },
        ],
      },
      tags: {
        create: [
          { tagId: tags["web-security"].id },
        ],
      },
    },
  });

  console.log("✅ Seeded Posts");

  // 5. Create Comments & Nested Replies
  const comment1 = await prisma.comment.create({
    data: {
      content: "This breakdown of Next.js 15 async cookies and server actions is crystal clear. Great job!",
      postId: post1.id,
      authorId: readerUser.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  });

  await prisma.comment.create({
    data: {
      content: "Thank you Marcus! Glad you enjoyed the explanation. Let me know if you want a part 2 on streaming suspense boundaries!",
      postId: post1.id,
      authorId: authorUser.id,
      parentId: comment1.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: "Fascinating perspective on autonomous agent sandboxing. What is your recommended approach for long-running background tasks?",
      postId: post2.id,
      authorId: readerUser.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
  });

  await prisma.comment.create({
    data: {
      content: "For long background tasks, asynchronous task queues with Redis or Postgres listen/notify paired with reactive worker wakeups work best.",
      postId: post2.id,
      authorId: adminUser.id,
      parentId: comment2.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });

  console.log("✅ Seeded Comments and Replies");

  // 6. Create Likes
  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: readerUser.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: adminUser.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: readerUser.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post3.id,
      userId: readerUser.id,
    },
  });

  console.log("✅ Seeded Likes");
  console.log("🎉 Database seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
