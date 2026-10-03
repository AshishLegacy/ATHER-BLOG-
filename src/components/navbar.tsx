"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/types";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { Button } from "./ui/button";
import {
  Sparkles,
  Search,
  PenSquare,
  Menu,
  X,
  Compass,
  Layers,
  Info,
  Mail,
} from "lucide-react";

interface NavbarProps {
  user: SessionUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/search", label: "Explore", icon: Search },
    { href: "/category/web-development", label: "Topics", icon: Layers },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo with 3D Depth */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group perspective-500">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 border border-white/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
                Aether<span className="text-primary font-black">Blog</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] font-black tracking-wider uppercase hidden sm:inline-block">
                3D
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Quick Search Icon */}
          <Link
            href="/search"
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60 transition-colors hidden sm:flex items-center"
            title="Search articles"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Write Button for Authors */}
          {user && (user.role === "AUTHOR" || user.role === "ADMIN") && (
            <Link href="/dashboard/posts/new" className="hidden sm:inline-flex">
              <Button size="sm" variant="outline" className="gap-1.5 rounded-xl">
                <PenSquare className="h-3.5 w-3.5 text-primary" />
                <span>Write</span>
              </Button>
            </Link>
          )}

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Nav */}
          <UserNav user={user} />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 animate-in slide-down">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          {user && (user.role === "AUTHOR" || user.role === "ADMIN") && (
            <Link
              href="/dashboard/posts/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary bg-primary/5"
            >
              <PenSquare className="h-4 w-4" />
              Write New Post
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
