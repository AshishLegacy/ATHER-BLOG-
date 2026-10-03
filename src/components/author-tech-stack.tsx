import React from "react";

// Tech stack mappings by role and author name
export const AUTHOR_TECH_MAP: Record<string, { languages: { name: string; color: string; bg: string }[]; level: string; spec: string }> = {
  "Alex Rivera": {
    languages: [
      { name: "TypeScript", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
      { name: "Rust", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
      { name: "Next.js 15", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30" },
      { name: "AI/LLM", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
    ],
    level: "Staff Architect",
    spec: "Distributed Systems & AI",
  },
  "Sarah Chen": {
    languages: [
      { name: "React 19", color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30" },
      { name: "TypeScript", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
      { name: "Tailwind CSS", color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/30" },
      { name: "UI/UX", color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/30" },
    ],
    level: "Lead Engineer",
    spec: "Design Systems & Frontend",
  },
  "Marcus Vance": {
    languages: [
      { name: "Python", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
      { name: "Go", color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30" },
      { name: "Cloud", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
    ],
    level: "Core Contributor",
    spec: "Backend & Cloud Services",
  },
};

export function getAuthorTech(name?: string | null, role?: string) {
  if (name && AUTHOR_TECH_MAP[name]) {
    return AUTHOR_TECH_MAP[name];
  }
  if (role === "ADMIN") {
    return {
      languages: [
        { name: "TypeScript", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
        { name: "Rust", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
        { name: "Next.js", color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/30" },
      ],
      level: "Lead Architect",
      spec: "Full-Stack Core",
    };
  }
  return {
    languages: [
      { name: "TypeScript", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
      { name: "React", color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30" },
    ],
    level: "Tech Author",
    spec: "Web Engineering",
  };
}
