"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Code2, 
  Terminal, 
  Sparkles, 
  Cpu, 
  Layers, 
  Zap, 
  Check, 
  Copy, 
  Play,
  Flame
} from "lucide-react";

// Modern Languages and Tech Definitions with high-aesthetic styling
const MODERN_LANGUAGES = [
  {
    id: "ts",
    name: "TypeScript 5.7",
    icon: "TS",
    color: "from-blue-500 to-indigo-600",
    glowColor: "rgba(59, 130, 246, 0.4)",
    badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    snippet: `// Next.js 15 Server Action & Type-Safe Schema
import { z } from "zod";

export const ArticleSchema = z.object({
  slug: z.string().min(3),
  views: z.number().default(0),
  tags: z.array(z.string()),
});

export type Post = z.infer<typeof ArticleSchema>;`,
    output: "✓ Types verified • 0 runtime errors • Strict mode ON",
  },
  {
    id: "rust",
    name: "Rust 2024",
    icon: "🦀",
    color: "from-orange-500 to-amber-600",
    glowColor: "rgba(249, 115, 22, 0.4)",
    badgeBg: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    snippet: `// Zero-cost concurrency & high-throughput memory
use tokio::sync::mpsc;

#[derive(Debug, Clone)]
pub struct EngineMetrics {
    pub latency_ms: f64,
    pub throughput: u64,
}

pub async fn stream_insights() -> Result<(), Error> {
    println!("⚡ Rust core memory-safe pipeline initialized.");
    Ok(())
}`,
    output: "⚡ Zero cost abstractions • Memory safety guaranteed",
  },
  {
    id: "python",
    name: "Python / AI",
    icon: "🐍",
    color: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.4)",
    badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    snippet: `# Autonomous LLM Reasoning Agent Loop
from pydantic import BaseModel

class AgentCognition(BaseModel):
    plan_step: str
    confidence: float = 0.99
    tools: list[str] = ["vector_search", "web_reader"]

async def execute_agent():
    return {"status": "Synthesizing multimodal insights..."}`,
    output: "✦ Neural weights loaded • Embedding dimensional space: 1536",
  },
  {
    id: "go",
    name: "Go 1.23",
    icon: "GO",
    color: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.4)",
    badgeBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    snippet: `// Microservices Goroutine Stream Dispatcher
package main

import "sync"

func StreamPipeline(jobs <-chan string, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        go processStream(job)
    }
}`,
    output: "🚀 1,000,000 Goroutines spawned • Sub-millisecond IPC",
  },
];

export function Hero3DScene() {
  const [activeLang, setActiveLang] = useState(MODERN_LANGUAGES[0]);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [runLog, setRunLog] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt Effect on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth angle bounds
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setMousePos({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeLang.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setRunLog(null);
    setTimeout(() => {
      setIsRunning(false);
      setRunLog(activeLang.output);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-8 mb-4 perspective-1000 select-none">
      {/* Ambient 3D Glowing Backdrop Orbs */}
      <div 
        className="absolute -top-16 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700 animate-pulse"
        style={{ background: activeLang.glowColor }}
      />
      <div 
        className="absolute -bottom-10 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ background: activeLang.glowColor }}
      />

      {/* Floating 3D Language Orbiting Chips */}
      <div className="hidden lg:flex justify-between items-center px-4 mb-4 relative z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 border border-border/80 backdrop-blur-md shadow-sm text-xs font-semibold text-foreground">
            <Cpu className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: "6s" }} />
            <span>Modern Runtime Matrix</span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Interactive 3D Code Canvas
          </span>
        </div>

        {/* Language selector tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/80 backdrop-blur-md border border-border/70 shadow-inner">
          {MODERN_LANGUAGES.map((lang) => {
            const isSelected = activeLang.id === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setActiveLang(lang);
                  setRunLog(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? "bg-background text-foreground shadow-md scale-105 border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <span className="text-xs">{lang.icon}</span>
                <span>{lang.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
          transition: "transform 0.15s ease-out",
        }}
        className="relative rounded-3xl border border-border/80 bg-gradient-to-br from-card/95 via-card/80 to-secondary/40 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl transition-all duration-300 overflow-hidden"
      >
        {/* Holographic light sheen reflection */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
          style={{
            transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
          }}
        />

        {/* 3D Floating Badges inside Card */}
        <div className="absolute top-4 right-6 hidden md:flex items-center gap-2 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[11px] font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Active Architecture</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Next-Gen Web</span>
          </div>
        </div>

        {/* Card Header with Terminal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
            </div>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${activeLang.color} flex items-center justify-center text-[10px] font-black text-white shadow-sm`}>
                {activeLang.icon}
              </div>
              <span className="text-xs font-bold text-foreground">
                engine.{activeLang.id === "python" ? "py" : activeLang.id === "rust" ? "rs" : activeLang.id === "go" ? "go" : "ts"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Play className={`w-3 h-3 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Compiling..." : "Run"}</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Copy snippet"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Code Body with Modern Syntax Accent */}
        <div className="py-4 font-mono text-xs sm:text-sm text-foreground/90 overflow-x-auto leading-relaxed relative z-10">
          <pre className="p-2 sm:p-4 rounded-2xl bg-secondary/30 border border-border/40 text-xs sm:text-sm overflow-x-auto">
            <code>{activeLang.snippet}</code>
          </pre>
        </div>

        {/* Live Execution Console Output */}
        <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-muted-foreground relative z-10">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>Output:</span>
            <span className="text-foreground font-semibold">
              {runLog || activeLang.output}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> JIT Optimized
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-500" /> Zero Latency
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
