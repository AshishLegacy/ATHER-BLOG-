"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Sparkles, User, Mail, Lock, ArrowRight, PenSquare, BookOpen } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"READER" | "AUTHOR">("AUTHOR");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signUpAction({ name, email, password, role });
      if (!res.success) {
        setError(res.message || "Failed to create account");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white shadow-lg mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Join the community to publish articles, bookmark, and engage
          </p>
        </div>

        <Card className="shadow-xl border-border/80 bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>
              Choose your profile type and enter your details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">I want to join as:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("AUTHOR")}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === "AUTHOR"
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border/80 hover:bg-secondary/60 text-muted-foreground"
                  }`}
                >
                  <PenSquare className={`h-4 w-4 mt-0.5 ${role === "AUTHOR" ? "text-primary" : ""}`} />
                  <div>
                    <p className="text-xs font-bold text-foreground">Author</p>
                    <p className="text-[11px] text-muted-foreground">Write & publish stories</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("READER")}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === "READER"
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border/80 hover:bg-secondary/60 text-muted-foreground"
                  }`}
                >
                  <BookOpen className={`h-4 w-4 mt-0.5 ${role === "READER" ? "text-primary" : ""}`} />
                  <div>
                    <p className="text-xs font-bold text-foreground">Reader</p>
                    <p className="text-[11px] text-muted-foreground">Read, like & comment</p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Sarah Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 rounded-xl font-semibold text-base shadow-md"
                isLoading={isLoading}
              >
                Create Account <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-border/60 pt-4 pb-4">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
