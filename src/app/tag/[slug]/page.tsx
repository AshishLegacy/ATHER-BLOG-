import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";
import { PostWithAuthorAndMeta } from "@/types";
import { ArrowLeft, Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!tag) return { title: "Tag Not Found | AetherBlog" };

  return {
    title: `#${tag.name} Articles | AetherBlog`,
    description: `Browse articles tagged with #${tag.name}.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const resolvedParams = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      posts: {
        where: {
          post: { status: "PUBLISHED" },
        },
        include: {
          post: {
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
          },
        },
        orderBy: {
          post: { publishedAt: "desc" },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  const posts = tag.posts.map((p) => p.post);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 min-h-screen">
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-3 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all posts</span>
        </Button>
      </Link>

      {/* Tag Header */}
      <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 space-y-4 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Hash className="h-3.5 w-3.5" />
          <span>Tag Archive</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          #{tag.name}
        </h1>
        <p className="text-xs font-semibold text-muted-foreground">
          {posts.length} {posts.length === 1 ? "article" : "articles"} tagged
        </p>
      </div>

      {/* Post Grid */}
      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/20 p-12 text-center space-y-3">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-lg font-semibold">No articles found</h3>
          <p className="text-sm text-muted-foreground">
            No published posts tagged with #{tag.name} yet.
          </p>
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
