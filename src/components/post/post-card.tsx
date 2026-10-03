import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PostWithAuthorAndMeta } from "@/types";
import { formatDate } from "@/lib/utils";
import { Clock, Eye, Heart, MessageSquare, Sparkles, CheckCircle2, Code2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { getAuthorTech } from "../author-tech-stack";

interface PostCardProps {
  post: PostWithAuthorAndMeta;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const primaryCategory = post.categories?.[0]?.category;
  const authorTech = getAuthorTech(post.author.name, post.author.role);

  if (featured) {
    return (
      <div className="group relative rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-secondary/30 p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-primary/40 overflow-hidden">
        {/* Background glow on hover */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Featured Cover Image */}
          <div className="lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted shadow-md group-hover:shadow-2xl transition-all duration-500">
            <Link href={`/post/${post.slug}`}>
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                  <Sparkles className="h-12 w-12 opacity-50" />
                </div>
              )}
            </Link>
            {primaryCategory && (
              <div className="absolute top-4 left-4">
                <Link href={`/category/${primaryCategory.slug}`}>
                  <Badge variant="default" className="shadow-md font-medium">
                    {primaryCategory.name}
                  </Badge>
                </Link>
              </div>
            )}
          </div>

          {/* Featured Post Meta & Content */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime} min read
                </span>
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <Sparkles className="h-3.5 w-3.5" /> Featured
                </span>
              </div>

              <Link href={`/post/${post.slug}`}>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="text-sm md:text-base text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>

            {/* Author Section with Modern Languages Stack */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <Link
                  href={`/profile/${encodeURIComponent(post.author.name || "author")}`}
                  className="flex items-center gap-3 group/author"
                >
                  <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-md">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-background">
                      {post.author.image ? (
                        <Image
                          src={post.author.image}
                          alt={post.author.name || "Author"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                          {post.author.name?.charAt(0) || "A"}
                        </div>
                      )}
                    </div>
                    {/* Online / Active status pulse */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground group-hover/author:text-primary transition-colors">
                        {post.author.name || "Anonymous"}
                      </p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {authorTech.level} • <span className="text-primary font-semibold">{post.author.role}</span>
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {post.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500" /> {post._count?.likes ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" /> {post._count?.comments ?? 0}
                  </span>
                </div>
              </div>

              {/* Modern Programming Languages Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                  <Code2 className="w-3 h-3 text-primary" /> Stack:
                </span>
                {authorTech.languages.map((lang) => (
                  <span
                    key={lang.name}
                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${lang.bg} ${lang.color} transition-transform hover:scale-105`}
                  >
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Post Card
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300">
      <div className="space-y-4">
        {/* Card Cover Image */}
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted">
          <Link href={`/post/${post.slug}`}>
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                <Sparkles className="h-8 w-8 opacity-40" />
              </div>
            )}
          </Link>
          {primaryCategory && (
            <div className="absolute top-3 left-3">
              <Link href={`/category/${primaryCategory.slug}`}>
                <Badge variant="secondary" className="backdrop-blur-md bg-background/80 hover:bg-background text-xs font-medium">
                  {primaryCategory.name}
                </Badge>
              </Link>
            </div>
          )}
        </div>

        {/* Card Header & Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime} min
            </span>
          </div>

          <Link href={`/post/${post.slug}`}>
            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer with Author & Engagement */}
      <div className="pt-3.5 mt-3 border-t border-border/60 flex items-center justify-between">
        <Link
          href={`/profile/${encodeURIComponent(post.author.name || "author")}`}
          className="flex items-center gap-2.5 group/author"
        >
          <div className="relative w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-background">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || "Author"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-[10px]">
                  {post.author.name?.charAt(0) || "A"}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground group-hover/author:text-primary transition-colors truncate max-w-[100px]">
              {post.author.name || "Author"}
            </span>
            <span className="text-[10px] text-primary/80 font-medium">
              {authorTech.languages[0]?.name || post.author.role}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" title="Views">
            <Eye className="h-3 w-3" /> {post.viewCount}
          </span>
          <span className="flex items-center gap-1" title="Likes">
            <Heart className="h-3 w-3 text-rose-500/80" /> {post._count?.likes ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Comments">
            <MessageSquare className="h-3 w-3" /> {post._count?.comments ?? 0}
          </span>
        </div>
      </div>
    </article>
  );
}
