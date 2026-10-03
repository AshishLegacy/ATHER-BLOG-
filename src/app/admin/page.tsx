import React from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  Users,
  FileText,
  MessageSquare,
  Eye,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  UserRoleSelect,
  BanUserButton,
  DeleteUserButton,
  DeletePostButton,
  DeleteCommentButton,
} from "@/components/admin/admin-controls";

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all counts
  const [totalUsers, totalPosts, totalComments, totalViewsAgg] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.post.aggregate({
      _sum: { viewCount: true },
    }),
  ]);

  // Fetch users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { posts: true, comments: true },
      },
    },
  });

  // Fetch recent posts
  const posts = await prisma.post.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  // Fetch recent comments
  const comments = await prisma.comment.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      post: { select: { title: true, slug: true } },
    },
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12 min-h-screen">
      {/* Admin Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Admin Console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, permissions, content moderation, and platform metrics.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalUsers}</p>
          <p className="text-xs text-muted-foreground">Registered platform accounts</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Articles</span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalPosts}</p>
          <p className="text-xs text-muted-foreground">Published and drafts</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Comments</span>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalComments}</p>
          <p className="text-xs text-muted-foreground">Community discussions</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
            <Eye className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">
            {(totalViewsAgg._sum.viewCount || 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Article impressions</p>
        </div>
      </div>

      {/* User Management Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>User Accounts & Roles</span>
          </h2>
          <span className="text-xs text-muted-foreground">{users.length} Total Users</span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 border-b border-border/60 text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Posts</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          {u.name || "Anonymous"}
                          {isCurrent && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <UserRoleSelect
                        userId={u.id}
                        currentRole={u.role as "ADMIN" | "AUTHOR" | "READER"}
                        isCurrent={isCurrent}
                      />
                    </td>

                    <td className="p-4">
                      {u.isBanned ? (
                        <Badge variant="destructive" className="text-xs">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </td>

                    <td className="p-4 text-xs text-muted-foreground font-semibold">
                      {u._count.posts}
                    </td>

                    <td className="p-4 text-xs text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrent && (
                          <>
                            <BanUserButton userId={u.id} isBanned={u.isBanned} />
                            <DeleteUserButton userId={u.id} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Post Moderation Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <span>Recent Posts & Moderation</span>
        </h2>

        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm divide-y divide-border/60">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={post.status === "PUBLISHED" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {post.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    by {post.author.name || post.author.email}
                  </span>
                  <span>•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <Link
                  href={`/post/${post.slug}`}
                  className="font-bold text-foreground hover:text-primary transition-colors text-base"
                >
                  {post.title}
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{post.viewCount} views</span>
                  <span>{post._count.likes} likes</span>
                  <span>{post._count.comments} comments</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/post/${post.slug}`} target="_blank">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>

                <DeletePostButton postId={post.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comment Moderation Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-500" />
          <span>Recent Comments</span>
        </h2>

        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm divide-y divide-border/60">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <strong className="text-foreground">{comment.author.name}</strong>
                  <span>on</span>
                  <Link
                    href={`/post/${comment.post.slug}`}
                    className="text-primary hover:underline truncate max-w-xs"
                  >
                    {comment.post.title}
                  </Link>
                  <span>•</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90">{comment.content}</p>
              </div>

              <DeleteCommentButton commentId={comment.id} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

