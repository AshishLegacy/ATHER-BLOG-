import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";
import { PostWithAuthorAndMeta } from "@/types";
import { Sparkles, ArrowRight, TrendingUp, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero3DScene } from "@/components/hero-3d-scene";

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const categoryFilter = resolvedSearchParams.category;
  const pageSize = 6;

  // 1. Fetch categories
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // 2. Fetch featured post
  const featuredPost = await prisma.post.findFirst({
    where: {
      status: "PUBLISHED",
      featured: true,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          website: true,
          twitter: true,
          github: true,
          role: true,
        },
      },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: {
        select: { comments: true, likes: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  // 3. Fetch paginated posts
  const whereClause: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (categoryFilter) {
    whereClause.categories = {
      some: {
        category: {
          slug: categoryFilter,
        },
      },
    };
  }

  // If featured post is shown on page 1 without category filter, exclude it from regular list to avoid duplicates
  if (featuredPost && currentPage === 1 && !categoryFilter) {
    whereClause.id = { not: featuredPost.id };
  }

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            website: true,
            twitter: true,
            github: true,
            role: true,
          },
        },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <div className="min-h-screen space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-12 border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover Technical Insights & Deep Dives</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
            Ideas, code, and blueprints for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              builders of the future.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Exploring next-generation web platforms, AI architectures, distributed systems,
            and crafted user experiences.
          </p>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !categoryFilter
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              All Topics
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  categoryFilter === cat.slug
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.name} ({cat._count.posts})
              </Link>
            ))}
          </div>

          {/* Interactive 3D Hero Scene with Modern Languages */}
          <Hero3DScene />
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Featured Post Spotlight (shown on Page 1 if no specific filter) */}
        {featuredPost && currentPage === 1 && !categoryFilter && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Featured Spotlight</span>
            </div>
            <PostCard
              post={featuredPost as unknown as PostWithAuthorAndMeta}
              featured={true}
            />
          </section>
        )}

        {/* Latest Articles Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                <span>
                  {categoryFilter
                    ? `${categories.find((c) => c.slug === categoryFilter)?.name || "Category"} Articles`
                    : "Latest Articles"}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalPosts} {totalPosts === 1 ? "article" : "articles"} published
              </p>
            </div>

            <Link href="/search">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/20 p-12 text-center space-y-4">
              <Sparkles className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-xl font-semibold">No articles found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No articles match this criteria yet. Check back soon or explore other topics!
              </p>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Clear Filters
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as unknown as PostWithAuthorAndMeta}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              {currentPage > 1 && (
                <Link
                  href={`/?page=${currentPage - 1}${categoryFilter ? `&category=${categoryFilter}` : ""}`}
                >
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Previous
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/?page=${p}${categoryFilter ? `&category=${categoryFilter}` : ""}`}
                  >
                    <Button
                      variant={p === currentPage ? "default" : "ghost"}
                      size="sm"
                      className="w-9 h-9 p-0 rounded-xl"
                    >
                      {p}
                    </Button>
                  </Link>
                ))}
              </div>

              {currentPage < totalPages && (
                <Link
                  href={`/?page=${currentPage + 1}${categoryFilter ? `&category=${categoryFilter}` : ""}`}
                >
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
