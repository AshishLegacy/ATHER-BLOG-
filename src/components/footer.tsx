"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border/70 bg-secondary/30 mt-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Newsletter */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Aether<span className="text-primary">Blog</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              An open platform for software engineers, designers, and system architects
              sharing cutting-edge insights, blueprints, and tutorials.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <p className="text-sm font-semibold mb-2">Subscribe to our weekly dispatch</p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Thank you for subscribing! You are on the VIP list.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                  <Button type="submit" size="default" variant="gradient" className="rounded-xl shrink-0">
                    Join <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Col 2: Topics */}
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-wider uppercase text-foreground/80">
              Popular Topics
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/category/web-development" className="hover:text-primary transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/category/artificial-intelligence" className="hover:text-primary transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link href="/category/architecture-scale" className="hover:text-primary transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link href="/category/ui-ux-design" className="hover:text-primary transition-colors">
                  UI & UX Design
                </Link>
              </li>
              <li>
                <Link href="/category/devops-cloud" className="hover:text-primary transition-colors">
                  DevOps & Cloud
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Legal */}
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-wider uppercase text-foreground/80">
              Platform
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-primary transition-colors">
                  Explore All Posts
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About the Platform
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-primary transition-colors">
                  Become an Author
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AetherBlog Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
