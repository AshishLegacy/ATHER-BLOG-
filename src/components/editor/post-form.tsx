"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPostAction, updatePostAction } from "@/actions/posts";
import { TipTapEditor } from "./tiptap-editor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { slugify } from "@/lib/utils";
import {
  Upload,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  Plus,
  Eye,
  Link2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

interface CategoryOption {
  id: string;
  name: string;
}

interface PostFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    coverImage?: string | null;
    status: "DRAFT" | "PUBLISHED";
    featured: boolean;
    categoryIds: string[];
    tagNames: string[];
  };
  categories: CategoryOption[];
  isEditing?: boolean;
}

export function PostForm({
  initialData,
  categories,
  isEditing = false,
}: PostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData?.slug);
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categoryIds || []
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tagNames || []);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialData?.status || "DRAFT"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Cover upload failed");
      }
      if (data.url) {
        setCoverImage(data.url);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload image. You can also paste an image link below.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleApplyImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setCoverImage(imageUrlInput.trim());
    setImageUrlInput("");
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  const handleSubmit = async (submitStatus: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      setError("Please enter a title for your post.");
      return;
    }

    if (!content.trim() || content === "<p></p>") {
      setError("Please write some content in the editor.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        title,
        slug: slug || slugify(title),
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || null,
        status: submitStatus,
        featured,
        categoryIds: selectedCategoryIds,
        tagNames: tags,
      };

      let res;
      if (isEditing && initialData?.id) {
        res = await updatePostAction(initialData.id, payload);
      } else {
        res = await createPostAction(payload);
      }

      if (!res.success) {
        setError(res.message || "Failed to save post.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit("DRAFT")}
            isLoading={isLoading && status === "DRAFT"}
            className="rounded-xl"
          >
            Save Draft
          </Button>

          <Button
            type="button"
            variant="gradient"
            size="sm"
            onClick={() => handleSubmit("PUBLISHED")}
            isLoading={isLoading && status === "PUBLISHED"}
            className="rounded-xl shadow-md"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            {isEditing ? "Update & Publish" : "Publish Story"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Main Grid: Content + Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Post Title, Slug, Rich Text Editor, Excerpt */}
        <div className="lg:col-span-8 space-y-6">
          {/* Post Title */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Article Title..."
              value={title}
              onChange={handleTitleChange}
              className="text-2xl sm:text-3xl font-extrabold h-14 rounded-2xl px-4 border-border/80 focus-visible:border-primary"
            />
          </div>

          {/* Slug input */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/60">
            <span className="font-semibold shrink-0">URL Slug:</span>
            <span className="shrink-0">/post/</span>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="article-slug"
              className="bg-transparent text-foreground font-mono focus:outline-none flex-1"
            />
          </div>

          {/* Cover Image Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Cover Image
              </label>
              {!coverImage && (
                <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => setCoverMode("upload")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      coverMode === "upload"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode("url")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      coverMode === "url"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Image Link (URL)
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              accept="image/*"
              className="hidden"
            />

            {coverImage ? (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted border border-border group">
                <Image
                  src={coverImage}
                  alt="Post Cover"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Change File
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setCoverImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : coverMode === "upload" ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="w-full h-44 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-secondary/20 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="text-xs font-semibold">
                    {isUploadingCover
                      ? "Uploading & Compressing..."
                      : "Upload High-Resolution Cover Image"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    PNG, JPG, WebP up to 10MB
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-border/80 bg-secondary/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-foreground">
                    Paste Direct Image URL / Link
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="h-10 rounded-xl text-xs bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={handleApplyImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className="rounded-xl px-4 shrink-0"
                  >
                    Apply Image
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Paste any public image link from Unsplash, Supabase storage, or web.
                </p>
              </div>
            )}
          </div>


          {/* Excerpt / Summary */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Excerpt / Brief Summary
            </label>
            <Textarea
              placeholder="Short summary displayed on cards and search results..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Story Content (Rich Text)
            </label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your in-depth story, add code blocks, headings, images..."
            />
          </div>
        </div>

        {/* Right 4 Cols: Post Settings (Categories, Tags, Featured Toggle) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Categories Selector */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Categories
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-secondary/40 hover:bg-secondary text-foreground"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Input */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Tags
            </h4>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="h-9 text-xs rounded-xl"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleAddTag}
                className="h-9 px-3 rounded-xl shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive text-muted-foreground p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured Spotlight Toggle */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Featured Article</p>
                <p className="text-xs text-muted-foreground">
                  Highlight in the hero spotlight on the home page
                </p>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
