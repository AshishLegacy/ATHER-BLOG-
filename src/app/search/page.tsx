import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";
import { PostWithAuthorAndMeta } from "@/types";
import { Search, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || "";
  const categoryFilter = resolvedSearchParams.category;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const whereClause: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (query) {
    whereClause.OR = [
      { title: { contains: query } },
      { content: { contains: query } },
      { excerpt: { contains: query } },
    ];
  }

  if (categoryFilter) {
    whereClause.categories = {
      some: {
        category: {
          slug: categoryFilter,
        },
      },
    };
  }

  const posts = await prisma.post.findMany({
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
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 min-h-screen">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Explore Articles & Blueprints
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Search across tutorials, architecture case studies, and engineering guidelines.
        </p>

        {/* Search Input Form */}
        <form method="GET" action="/search" className="relative flex items-center shadow-lg rounded-2xl">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search keywords, topics, frameworks (e.g. Next.js, AI, Architecture)..."
            className="w-full h-14 pl-12 pr-32 rounded-2xl border border-border bg-card/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base"
          />
          {categoryFilter && (
            <input type="hidden" name="category" value={categoryFilter} />
          )}
          <Button
            type="submit"
            variant="gradient"
            size="default"
            className="absolute right-2 h-10 rounded-xl px-5"
          >
            Search
          </Button>
        </form>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link
            href={`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              !categoryFilter
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Topics
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span>
            {posts.length} {posts.length === 1 ? "result" : "results"}{" "}
            {query && (
              <span>
                for &ldquo;<strong className="text-foreground">{query}</strong>&rdquo;
              </span>
            )}
          </span>
        </p>

        {(query || categoryFilter) && (
          <Link href="/search">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Reset search
            </Button>
          </Link>
        )}
      </div>

      {/* Results Grid */}
      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/20 p-16 text-center space-y-4">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-xl font-bold">No articles matched your search</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Try searching for broader terms, checking your spelling, or browsing our popular categories.
          </p>
          <Link href="/search">
            <Button variant="outline" size="sm" className="rounded-xl">
              Browse all articles
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
    </div>
  );
}
