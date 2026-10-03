import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { PostCard } from "@/components/post/post-card";
import { PostWithAuthorAndMeta } from "@/types";
import { Globe, Twitter, Github, BookOpen, Heart, Eye, CheckCircle2, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAuthorTech } from "@/components/author-tech-stack";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedName = decodeURIComponent(resolvedParams.username);

  const user = await prisma.user.findFirst({
    where: { name: decodedName },
  });

  if (!user) return { title: "Author Not Found | AetherBlog" };

  return {
    title: `${user.name} — Author Profile | AetherBlog`,
    description: user.bio || `Read articles and tutorials by ${user.name} on AetherBlog.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const decodedName = decodeURIComponent(resolvedParams.username);

  const user = await prisma.user.findFirst({
    where: { name: decodedName },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
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
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const totalViews = user.posts.reduce((acc, p) => acc + p.viewCount, 0);
  const authorTech = getAuthorTech(user.name, user.role);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 min-h-screen">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 p-8 sm:p-12 shadow-sm relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-[3px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-xl shrink-0">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-background">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Author"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-muted-foreground">
                  {user.name ? user.name.charAt(0) : "A"}
                </div>
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-background" />
          </div>

          <div className="space-y-4 text-center sm:text-left flex-1">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  {user.name}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <Badge variant="accent" className="text-xs">
                  {user.role}
                </Badge>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                  {authorTech.level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-primary font-medium">{authorTech.spec}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            {user.bio && (
              <p className="text-sm sm:text-base text-foreground/90 max-w-2xl leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Active Modern Programming Languages */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
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

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Website</span>
                </a>
              )}
              {user.twitter && (
                <a
                  href={`https://twitter.com/${user.twitter.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Twitter className="h-3.5 w-3.5" />
                  <span>@{user.twitter.replace(/^@/, "")}</span>
                </a>
              )}
              {user.github && (
                <a
                  href={`https://github.com/${user.github.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>github.com/{user.github.replace(/^@/, "")}</span>
                </a>
              )}
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-4 border-t border-border/60 text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                {user.posts.length} {user.posts.length === 1 ? "Article" : "Articles"}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-500" />
                {totalViews.toLocaleString()} Total Reads
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500" />
                {user._count.likes} Likes Given
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Author's Articles */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Articles by {user.name} ({user.posts.length})
        </h2>

        {user.posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/20 p-12 text-center text-muted-foreground text-sm">
            {user.name} has not published any public articles yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post as unknown as PostWithAuthorAndMeta}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
