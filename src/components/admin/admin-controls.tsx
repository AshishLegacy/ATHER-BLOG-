"use client";

import React, { useTransition } from "react";
import {
  updateUserRoleAction,
  toggleUserBanAction,
  deleteUserAction,
  deleteAnyPostAction,
  deleteAnyCommentAction,
} from "@/actions/admin";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle, Trash2, Loader2 } from "lucide-react";

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  isCurrent: boolean;
}

export function UserRoleSelect({
  userId,
  currentRole,
  isCurrent,
}: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    startTransition(async () => {
      await updateUserRoleAction(userId, newRole);
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        defaultValue={currentRole}
        disabled={isCurrent || isPending}
        onChange={handleRoleChange}
        className="text-xs rounded-lg border border-border bg-background px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
      >
        <option value="READER">Reader</option>
        <option value="AUTHOR">Author</option>
        <option value="ADMIN">Admin</option>
      </select>
      {isPending && (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-1.5" />
      )}
    </div>
  );
}

export function BanUserButton({
  userId,
  isBanned,
}: {
  userId: string;
  isBanned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggleBan = () => {
    const confirmMsg = isBanned
      ? "Are you sure you want to lift the suspension for this user?"
      : "Are you sure you want to suspend this user? They will not be able to log in.";
    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      await toggleUserBanAction(userId, !isBanned);
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleToggleBan}
      className={`text-xs rounded-xl h-8 px-2.5 transition-colors ${
        isBanned
          ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
          : "border-destructive/30 text-destructive hover:bg-destructive/10"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : isBanned ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : (
        <Ban className="h-3 w-3 mr-1" />
      )}
      <span>{isBanned ? "Unban" : "Ban"}</span>
    </Button>
  );
}

export function DeleteUserButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user? All their posts and comments will also be removed."
      )
    ) {
      return;
    }

    startTransition(async () => {
      await deleteUserAction(userId);
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-xl transition-colors"
      title="Delete user"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !window.confirm("Are you sure you want to permanently delete this post?")
    ) {
      return;
    }

    startTransition(async () => {
      await deleteAnyPostAction(postId);
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
      title="Delete post"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this comment?"
      )
    ) {
      return;
    }

    startTransition(async () => {
      await deleteAnyCommentAction(commentId);
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg shrink-0 transition-colors"
      title="Delete comment"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
