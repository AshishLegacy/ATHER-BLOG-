import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, stripHtml } from "@/lib/utils";
import { PostCard } from "@/components/post/post-card";
import { LikeButton } from "@/components/post/like-button";
import { ShareButtons } from "@/components/post/share-buttons";
import { CommentSection } from "@/components/comments/comment-section";
import { PostViewTracker } from "@/components/post/post-view-tracker";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Calendar, User, ArrowLeft, Sparkles, CheckCircle2, Code2, Globe, Twitter, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostWithAuthorAndMeta, CommentWithRepliesAndAuthor } from "@/types";
import { getAuthorTech } from "@/components/author-tech-stack";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
    include: { author: true },
  });

  if (!post) {
    return {
      title: "Post Not Found | AetherBlog",
    };
  }

  const cleanDescription = post.excerpt || stripHtml(post.content).slice(0, 160);

  return {
    title: `${post.title} | AetherBlog`,
    description: cleanDescription,
    authors: [{ name: post.author.name || "AetherBlog Author" }],
    openGraph: {
      type: "article",
      title: post.title,
      description: cleanDescription,
      publishedTime: (post.publishedAt || post.createdAt).toISOString(),
      authors: [post.author.name || "AetherBlog Author"],
      images: [
        {
          url:
            post.coverImage ||
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: cleanDescription,
      images: [
        post.coverImage ||
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      ],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const currentUser = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
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
      likes: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // If draft, only author or admin can view
  if (
    post.status === "DRAFT" &&
    (!currentUser || (currentUser.id !== post.authorId && currentUser.role !== "ADMIN"))
  ) {
    notFound();
  }

  const hasLiked = currentUser
    ? post.likes.some((l) => l.userId === currentUser.id)
    : false;

  // Fetch related posts from same categories
  const categoryIds = post.categories.map((c) => c.categoryId);
  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: post.id },
      status: "PUBLISHED",
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
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
    take: 3,
  });

  // JSON-LD Article Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || stripHtml(post.content).slice(0, 160),
    image:
      post.coverImage ||
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name || "AetherBlog Author",
    },
  };

  const authorTech = getAuthorTech(post.author.name, post.author.role);

  return (
    <div className="min-h-screen pb-20">
      {/* View Counter Tracker */}
      <PostViewTracker slug={post.slug} />

      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header / Meta Container */}
      <article className="container max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-8">
        {/* Back Link */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to articles</span>
          </Button>
        </Link>

        {/* Draft Notice if unpublished */}
        {post.status === "DRAFT" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-center justify-between">
            <span>This is an unpublished draft. Only you and admins can view it.</span>
            <Link href={`/dashboard/posts/${post.id}/edit`}>
              <Button size="sm" variant="outline" className="text-xs">
                Edit Draft
              </Button>
            </Link>
          </div>
        )}

        {/* Category Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {post.categories.map(({ category }) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Badge variant="default" className="text-xs font-medium">
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Article Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
          {post.title}
        </h1>

        {/* Post Metadata & Author Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/70">
          <Link
            href={`/profile/${encodeURIComponent(post.author.name || "author")}`}
            className="flex items-center gap-3.5 group"
          >
            <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-md">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-background">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || "Author"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                    {post.author.name?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {post.author.name || "Anonymous Author"}
                </p>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {authorTech.level} • <span className="text-primary font-semibold">{post.author.role}</span>
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {post.viewCount} views
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-muted shadow-lg border border-border/60">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Post Excerpt (Subtitle) */}
        {post.excerpt && (
          <p className="text-lg sm:text-xl text-muted-foreground font-medium italic border-l-4 border-primary pl-4 py-1 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Main Article Body (Sanitized Prose) */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none pt-4 text-foreground/90 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="pt-6 pb-4 border-b border-border/70">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Actions (Likes & Social Share) */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-border/70">
          <div className="flex items-center gap-3">
            <LikeButton
              postId={post.id}
              initialHasLiked={hasLiked}
              initialCount={post._count.likes}
              userId={currentUser?.id}
            />
            <span className="text-xs text-muted-foreground">
              Loved this article? Leave a like to support the author!
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Share:</span>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </div>

        {/* Modern Author Bio & Tech Stack Card */}
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-lg shrink-0">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-background">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || "Author"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl">
                    {post.author.name?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {post.author.name || "Staff Writer"}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold">
                      {authorTech.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {authorTech.spec}
                  </p>
                </div>

                <Link href={`/profile/${encodeURIComponent(post.author.name || "author")}`}>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.author.bio || "Staff writer and contributor exploring modern digital systems and design."}
              </p>
            </div>
          </div>

          {/* Author Active Tech Stack Badges */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-1">
                <Code2 className="w-3.5 h-3.5 text-primary" /> Active Languages:
              </span>
              {authorTech.languages.map((lang) => (
                <span
                  key={lang.name}
                  className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${lang.bg} ${lang.color}`}
                >
                  {lang.name}
                </span>
              ))}
            </div>

            {/* Social Tech Links */}
            <div className="flex items-center gap-3">
              {post.author.website && (
                <a
                  href={post.author.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {post.author.twitter && (
                <a
                  href={`https://twitter.com/${post.author.twitter.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {post.author.github && (
                <a
                  href={`https://github.com/${post.author.github.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Comment Section with Nested Replies */}
        <CommentSection
          postId={post.id}
          comments={post.comments as unknown as CommentWithRepliesAndAuthor[]}
          currentUser={currentUser}
        />

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="pt-16 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-bold tracking-tight">Related Articles</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <PostCard
                  key={related.id}
                  post={related as unknown as PostWithAuthorAndMeta}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
