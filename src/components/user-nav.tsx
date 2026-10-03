"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SessionUser } from "@/types";
import { logoutAction } from "@/actions/auth";
import {
  User,
  LayoutDashboard,
  PenSquare,
  ShieldCheck,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";

interface UserNavProps {
  user: SessionUser | null;
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" variant="gradient">
            Get Started
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all focus:outline-none"
        aria-label="User menu"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-foreground uppercase">
              {user.name ? user.name.charAt(0) : user.email.charAt(0)}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.name || "Member"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {user.role}
            </span>
          </div>

          <div className="py-1">
            {(user.role === "AUTHOR" || user.role === "ADMIN") && (
              <Link
                href="/dashboard/posts/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                <PenSquare className="h-4 w-4 text-primary" />
                Write Post
              </Link>
            )}

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                Admin Panel
              </Link>
            )}

            {user.name && (
              <Link
                href={`/profile/${encodeURIComponent(user.name)}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Public Profile
              </Link>
            )}

            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
          </div>

          <div className="pt-1 border-t border-border/60">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
