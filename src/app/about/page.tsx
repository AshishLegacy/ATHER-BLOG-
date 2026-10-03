import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Code, Cpu, Globe, Rocket, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | AetherBlog",
  description: "Learn about the mission, architecture, and contributors behind AetherBlog.",
};

export default function AboutPage() {
  const pillars = [
    {
      icon: Code,
      title: "Clean Modern Architecture",
      description:
        "Built on Next.js 15, React 19, TypeScript strict mode, and Prisma PostgreSQL for speed and maintainability.",
    },
    {
      icon: Cpu,
      title: "Deep Technical Exploration",
      description:
        "Every article is carefully reviewed for engineering depth, real-world blueprints, and zero filler.",
    },
    {
      icon: Globe,
      title: "Open Knowledge Sharing",
      description:
        "Empowering software developers, designers, and creators with transparent tutorials and open discussions.",
    },
    {
      icon: ShieldCheck,
      title: "Security & Accessibility",
      description:
        "Full XSS sanitization, rate-limited auth endpoints, keyboard accessibility, and strict data isolation.",
    },
  ];

  return (
    <div className="min-h-screen pb-20 space-y-16">
      {/* Hero */}
      <section className="pt-16 pb-12 border-b border-border/60 bg-gradient-to-b from-primary/5 to-background text-center px-4">
        <div className="container max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The AetherBlog Story</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-tight">
            Crafting the definitive publication for modern software engineers.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We founded AetherBlog with a simple mission: build a fast, beautifully designed,
            and distraction-free home for technical writing, system blueprints, and architecture discussions.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why We Built AetherBlog
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Modern blogging platforms are often bloated, cluttered with paywalls, or lacking
              proper tools for code formatting, responsive design, and rich community discussions.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              AetherBlog combines full-stack Next.js App Router performance, Tiptap rich editing,
              granular role-based access, and instant database mutations with zero unnecessary fluff.
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-border/80 bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80"
              alt="Engineering Collaboration"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Our Core Principles</h2>
            <p className="text-sm text-muted-foreground">The standards that guide our platform development</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-3 hover:border-primary/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-8 sm:p-12 text-center space-y-6">
          <Rocket className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to publish your first article?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Join authors sharing in-depth engineering guides, architectures, and design discoveries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button variant="gradient" size="lg" className="rounded-xl shadow-md">
                Get Started as Author <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg" className="rounded-xl">
                Explore Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
