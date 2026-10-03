"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { updateProfileAction } from "@/actions/profile";
import { getSessionAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  User,
  Upload,
  Globe,
  Twitter,
  Github,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getSessionAction();
      if (user) {
        setName(user.name || "");
        setBio(user.bio || "");
        setImage(user.image || null);
        setWebsite(user.website || "");
        setTwitter(user.twitter || "");
        setGithub(user.github || "");
      }
    }
    loadUser();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        setImage(data.url);
      }
    } catch {
      alert("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await updateProfileAction({
        name,
        bio: bio || null,
        image: image || null,
        website: website || null,
        twitter: twitter || null,
        github: github || null,
      });

      if (!res.success) {
        setError(res.message || "Failed to update profile.");
        return;
      }

      setMessage("Profile updated successfully!");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your public author profile, bio, and social presence.
        </p>
      </div>

      <Card className="shadow-md border-border/80 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Public Information</CardTitle>
          <CardDescription>
            This information will be displayed on your author profile and article bylines.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-secondary/30 border border-border/60">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0">
                {image ? (
                  <Image
                    src={image}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-muted-foreground">
                    {name ? name.charAt(0) : "U"}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <p className="text-sm font-bold">Profile Avatar</p>
                <p className="text-xs text-muted-foreground">
                  Upload a photo or avatar (JPG, PNG, WebP)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                  className="rounded-xl text-xs"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Change Avatar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Personal Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="url"
                    placeholder="https://yoursite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Bio / About You</label>
              <Textarea
                placeholder="Brief description about your background, engineering passions, and interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Twitter / X Username</label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">GitHub Username</label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="rounded-xl px-8 shadow-md"
              isLoading={isLoading}
            >
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
