"use client";

import React, { useState } from "react";
import { Twitter, Linkedin, Facebook, Link2, Check } from "lucide-react";
import { Button } from "../ui/button";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return `https://aetherblog.com/post/${slug}`;
  };

  const shareTwitter = () => {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(`Reading "${title}" on AetherBlog`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  const shareLinkedin = () => {
    const url = encodeURIComponent(getUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(getUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-sky-500/10 hover:border-sky-500/30"
        onClick={shareTwitter}
        title="Share on Twitter / X"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-blue-600/10 hover:border-blue-600/30"
        onClick={shareLinkedin}
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-indigo-600/10 hover:border-indigo-600/30"
        onClick={shareFacebook}
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={copyToClipboard}
        title="Copy article link"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
