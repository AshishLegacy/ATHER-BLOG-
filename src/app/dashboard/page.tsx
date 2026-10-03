import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  PenSquare,
  FileText,
  Eye,
  Heart,
  MessageSquare,
  Trash2,
  ExternalLink,
  Plus,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deletePostAction } from "@/actions/posts";

interface DashboardPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab === "drafts" ? "DRAFT" : "PUBLISHED";

  // Fetch author posts
  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
      status: activeTab,
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: {
        select: { comments: true, likes: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Calculate statistics
  const allUserPosts = await prisma.post.findMany({
    where: { authorId: user.id },
    select: {
      id: true,
      viewCount: true,
      status: true,
      _count: {
        select: { comments: true, likes: true },
      },
    },
  });

  const totalViews = allUserPosts.reduce((acc, p) => acc + p.viewCount, 0);
  const totalLikes = allUserPosts.reduce((acc, p) => acc + p._count.likes, 0);
  const totalComments = allUserPosts.reduce((acc, p) => acc + p._count.comments, 0);
  const publishedCount = allUserPosts.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = allUserPosts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 min-h-screen">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Author Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <strong className="text-foreground">{user.name || user.email}</strong>.
            Manage your articles and review engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Panel</span>
              </Button>
            </Link>
          )}

          <Link href="/dashboard/posts/new">
            <Button variant="gradient" size="default" className="gap-2 rounded-xl shadow-md">
              <Plus className="h-4 w-4" />
              <span>Create New Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Articles</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{allUserPosts.length}</p>
          <p className="text-xs text-muted-foreground">
            {publishedCount} published • {draftCount} drafts
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reads</span>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Across all your published stories</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalLikes.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Reader appreciation</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Comments</span>
            <MessageSquare className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalComments.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Active discussions</p>
        </div>
      </div>

      {/* Tabs & Posts Table/List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "PUBLISHED"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              Published ({publishedCount})
            </Link>

            <Link
              href="/dashboard?tab=drafts"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "DRAFT"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              Drafts ({draftCount})
            </Link>
          </div>

          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Profile Settings
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/20 p-12 text-center space-y-4">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-lg font-bold">No {activeTab.toLowerCase()} articles found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {activeTab === "PUBLISHED"
                ? "You haven't published any articles yet. Create your first draft!"
                : "You don't have any drafts saved."}
            </p>
            <Link href="/dashboard/posts/new">
              <Button variant="default" size="sm" className="rounded-xl">
                Write a Story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <div className="divide-y divide-border/60">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.updatedAt)}
                      </span>
                      {post.featured && (
                        <Badge variant="accent" className="text-[10px]">
                          Featured
                        </Badge>
                      )}
                      {post.categories.map((c) => (
                        <Badge key={c.categoryId} variant="outline" className="text-[10px]">
                          {c.category.name}
                        </Badge>
                      ))}
                    </div>

                    <Link
                      href={`/post/${post.slug}`}
                      className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors block truncate"
                    >
                      {post.title}
                    </Link>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {post.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-rose-500" /> {post._count.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> {post._count.comments} comments
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/post/${post.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" title="View live article" className="h-9 w-9 rounded-xl">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                        <PenSquare className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                    </Link>

                    <form
                      action={async () => {
                        "use server";
                        await deletePostAction(post.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
