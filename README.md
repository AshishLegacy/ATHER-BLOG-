# 🌟 AetherBlog — Full-Stack Production Blogging Platform

A modern, high-performance, full-stack blogging platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript (strict)**, **Tailwind CSS**, **Prisma ORM**, **Auth.js / JWT Sessions**, **Tiptap Rich Text Editor**, and **PostgreSQL / SQLite**.

---

## ✨ Features

- 🔐 **Authentication & RBAC:**
  - Email + password credentials registration, login, logout.
  - Password reset with secure 1-hour token lifecycle (simulated email in dev).
  - Google OAuth integration support.
  - Role-Based Access Control (`ADMIN`, `AUTHOR`, `READER`) protecting server actions and routes.
  - Rate limiting on authentication and comment submission.

- 📝 **Rich Content Authoring:**
  - Tiptap WYSIWYG editor with Headings (H1-H3), bold/italic/strike, lists, blockquotes, code blocks, links, and direct image insertion.
  - Automatic URL slug generation with collision prevention.
  - Cover image uploads with `sharp` image optimization to WebP.
  - Categories and Tags (many-to-many relationships).
  - Draft vs. Published status toggles.

- 📖 **Reader Experience:**
  - Hero spotlight with featured articles.
  - Paginated home feed with topic pills and dynamic filtering.
  - Single article page: reading time estimate, view counter, social sharing (Twitter/X, LinkedIn, Facebook, Copy link), related articles.
  - Category archive (`/category/[slug]`) and Tag archive (`/tag/[slug]`) pages.
  - Full-text search (`/search?q=...`) across post titles, excerpts, and content.

- 💬 **Engagement:**
  - Discussion system with multi-level nested replies.
  - Authors and admins can delete comments.
  - Interactive Like button with optimistic UI and counter.

- 📊 **Dashboards:**
  - **Author Dashboard (`/dashboard`):** "My Posts" with Published and Draft tabs, deletion, editing, view stats, like count, and comment count.
  - **Profile Settings (`/dashboard/settings`):** Edit display name, bio, avatar, website, Twitter, and GitHub links.
  - **Admin Control Center (`/admin`):** User management, role modification, account suspension/ban, global content deletion, platform metric aggregation.
  - **Public Author Profile (`/profile/[username]`):** Public author bio, social links, and author articles.

- 🌐 **SEO & Accessibility:**
  - Dynamic `generateMetadata` OpenGraph and Twitter cards per article.
  - Auto-generated `sitemap.xml` (`/sitemap.xml`) and `robots.txt` (`/robots.txt`).
  - JSON-LD Article structured data.
  - Dark / Light mode toggle with `next-themes`.
  - Custom 404 (`not-found.tsx`) and 500 (`error.tsx`) pages.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components + Server Actions)
- **Language:** TypeScript (Strict mode)
- **Database & ORM:** Prisma with PostgreSQL (Production / Neon / Supabase) and SQLite (Local Zero-Config)
- **Editor:** Tiptap 2.x
- **Image Processing:** Sharp
- **Validation:** Zod
- **Icons & UI:** Lucide React, Tailwind CSS, Custom Glassmorphism UI tokens
- **Unit Testing:** Vitest

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18.17+` (v20+ recommended)
- npm or pnpm or yarn

### 2. Clone & Install
```bash
git clone <repository-url>
cd blogging
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default zero-config local `.env`:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="f3c4e51276a1d87e029486c917b203c4f90123e4567890abcde891234567890ab"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **For PostgreSQL (Neon, Supabase, Vercel Postgres):**
> 1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
> 2. Set `DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"` in `.env`.

### 4. Database Setup & Seeding
```bash
# Push schema to database
npx prisma db push

# Seed sample users, articles, categories, comments, and likes
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

The database seed includes 3 pre-configured demo accounts (with quick one-click autofill buttons on the login page):

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@blog.com` | `Admin@123456` | Full platform control, moderation, user roles, bans, write articles |
| **Author** | `author@blog.com` | `Author@123456` | Create/edit/delete own posts, comments, profile customization |
| **Reader** | `reader@blog.com` | `Reader@123456` | Read posts, like, write comments and replies |

---

## 🧪 Testing

Run unit tests via Vitest:
```bash
npm run test
```

---

## 🚢 Deployment to Vercel + Neon / Supabase

1. Push code to GitHub.
2. Import project in [Vercel](https://vercel.com).
3. Set environment variables:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string (Neon or Supabase).
   - `AUTH_SECRET`: Random 32+ char secret.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL.
4. Set Build Command: `npx prisma db push && next build`.
5. Deploy!
