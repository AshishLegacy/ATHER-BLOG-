"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CommentWithRepliesAndAuthor, SessionUser } from "@/types";
import { addCommentAction, deleteCommentAction } from "@/actions/comments";
import { formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { MessageSquare, Reply, Trash2, Send } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  comments: CommentWithRepliesAndAuthor[];
  currentUser: SessionUser | null;
}

export function CommentSection({
  postId,
  comments,
  currentUser,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePostComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to leave a comment.");
      return;
    }

    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await addCommentAction({
        postId,
        content: text.trim(),
        parentId,
      });

      if (!res.success) {
        setError(res.message || "Failed to post comment");
        return;
      }

      if (parentId) {
        setReplyText("");
        setReplyToId(null);
      } else {
        setCommentText("");
      }
    } catch {
      setError("An unexpected error occurred while posting your comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteCommentAction(commentId);
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment.");
    }
  };

  // Group top-level and children comments
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <section className="space-y-8 pt-8 border-t border-border/80">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span>Discussion ({comments.length})</span>
        </h3>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Main Comment Input Box */}
      {currentUser ? (
        <form onSubmit={(e) => handlePostComment(e, null)} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted border border-border">
              {currentUser.image ? (
                <Image
                  src={currentUser.image}
                  alt={currentUser.name || "You"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                  {currentUser.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <span className="text-sm font-semibold">{currentUser.name}</span>
          </div>

          <Textarea
            placeholder="Share your thoughts or feedback on this article..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="rounded-xl min-h-[100px]"
            required
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              variant="gradient"
              isLoading={isSubmitting}
              className="gap-1.5 rounded-xl px-5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post Comment</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Join the conversation and leave a reply.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login">
              <Button size="sm" variant="default">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to spark a conversation!
          </p>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isOwnerOrAdmin =
              currentUser &&
              (currentUser.id === comment.authorId || currentUser.role === "ADMIN");

            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-4"
              >
                {/* Author Info & Content */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted border border-border">
                      {comment.author.image ? (
                        <Image
                          src={comment.author.image}
                          alt={comment.author.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                          {comment.author.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {comment.author.name || "Anonymous"}
                        </span>
                        {comment.author.role === "ADMIN" && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded">
                            Staff
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {isOwnerOrAdmin && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed pl-1">
                  {comment.content}
                </p>

                {/* Reply Action */}
                {currentUser && (
                  <div className="pl-1">
                    <button
                      onClick={() =>
                        setReplyToId(replyToId === comment.id ? null : comment.id)
                      }
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Reply className="h-3 w-3" />
                      <span>{replyToId === comment.id ? "Cancel Reply" : "Reply"}</span>
                    </button>
                  </div>
                )}

                {/* Inline Reply Form */}
                {replyToId === comment.id && currentUser && (
                  <form
                    onSubmit={(e) => handlePostComment(e, comment.id)}
                    className="pl-4 mt-3 space-y-2 border-l-2 border-primary/40"
                  >
                    <Textarea
                      placeholder={`Replying to ${comment.author.name || "comment"}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="text-xs min-h-[60px]"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyToId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        variant="gradient"
                        isLoading={isSubmitting}
                      >
                        Reply
                      </Button>
                    </div>
                  </form>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="pl-4 sm:pl-6 space-y-3 pt-2 border-l-2 border-border/80 mt-3">
                    {replies.map((reply) => {
                      const isReplyOwnerOrAdmin =
                        currentUser &&
                        (currentUser.id === reply.authorId ||
                          currentUser.role === "ADMIN");

                      return (
                        <div
                          key={reply.id}
                          className="rounded-xl bg-secondary/40 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted border border-border">
                                {reply.author.image ? (
                                  <Image
                                    src={reply.author.image}
                                    alt={reply.author.name || "User"}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-[10px]">
                                    {reply.author.name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-semibold">
                                {reply.author.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>

                            {isReplyOwnerOrAdmin && (
                              <button
                                onClick={() => handleDelete(reply.id)}
                                className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                title="Delete reply"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-foreground/90 pl-1 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
