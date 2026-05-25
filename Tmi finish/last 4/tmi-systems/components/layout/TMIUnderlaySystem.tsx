"use client";

/**
 * TMIUnderlaySystem.tsx + TMIOverlayFXSystem.tsx
 * Reusable visual layer system for The Musician's Index.
 *
 * Drop at: apps/web/src/components/layout/TMIUnderlaySystem.tsx
 *
 * Use on:
 *   homepages 1–5, magazine pages, news articles, performer profiles,
 *   random pages, sponsor boards, lobby walls, billboard pages
 *
 * Two exports:
 *
 * 1. TMIUnderlaySystem — goes BEHIND content (z-0 to z-[2])
 *    Themes: neon80s, dark_editorial, tropical, cosmic, ice_cold, fire, toxic
 *    Elements: gradient mesh, geometric shapes, scanlines, grid
 *
 * 2. TMIOverlayFXSystem — goes ABOVE content (z-[50]+)
 *    Elements: confetti, sparks, light streaks, particles, crown burst
 *    Triggers: ambient (always on), burst (on event), celebration
 *
 * Usage:
 *   <div className="relative">
 *     <TMIUnderlaySystem theme="neon80s" intensity={0.6} />
 *     <div className="relative z-10">your content</div>
 *     <TMIOverlayFXSystem mode="ambient" />
 *   </div>
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type UnderlayTheme =
  | "neon80s"
  | "dark_editorial"
  | "tropical"
  | "cosmic"
  | "ice_cold"
  | "fire"
  | "toxic"
  | "gold_luxury"
  | "shadow";

export type OverlayMode = "ambient" | "burst" | "celebration" | "off";

/* ─── Theme definitions ───────────────────────────────────────────────────── */
interface ThemeDef {
  base: string;               // CSS background for deepest layer
  blobs: {                    // animated radial blobs
    color: string;
    x: string;
    y: string;
    size: string;
    animDuration: string;
    opacity: number;
  }[];
  shapes: {                   // geometric shapes
    type: "triangle" | "diamond" | "circle" | "line";
    color: string;
    x: string; y: string;
    size: string;
    opacity: number;
    rotation: number;
    animDelay: string;
  }[];
  scanlineColor: string;
  gridColor: string;
}

const THEMES: Record<UnderlayTheme, ThemeDef> = {
  neon80s: {
    base: "#07031a",
    blobs: [
      { color: "#a855f7", x: "-10%", y: "5%",   size: "55%", animDuration: "14s", opacity: 0.22 },
      { color: "#06b6d4", x: "70%",  y: "30%",  size: "50%", animDuration: "18s", opacity: 0.18 },
      { color: "#ec4899", x: "20%",  y: "75%",  size: "45%", animDuration: "22s", opacity: 0.15 },
      { color: "#f59e0b", x: "50%",  y: "10%",  size: "35%", animDuration: "12s", opacity: 0.10 },
    ],
    shapes: [
      { type: "triangle", color: "#a855f7", x: "5%",   y: "10%", size: "80px", opacity: 0.15, rotation: 20,  animDelay: "0s" },
      { type: "triangle", color: "#06b6d4", x: "82%",  y: "5%",  size: "60px", opacity: 0.12, rotation: 145, animDelay: "1s" },
      { type: "diamond",  color: "#ec4899", x: "8%",   y: "80%", size: "50px", opacity: 0.1,  rotation: 0,   animDelay: "2s" },
      { type: "circle",   color: "#f59e0b", x: "88%",  y: "70%", size: "70px", opacity: 0.08, rotation: 0,   animDelay: "1.5s"},
    ],
    scanlineColor: "rgba(168,85,247,0.04)",
    gridColor: "rgba(168,85,247,0.06)",
  },
  dark_editorial: {
    base: "#050508",
    blobs: [
      { color: "#1e293b", x: "0",    y: "0",    size: "60%", animDuration: "20s", opacity: 0.8 },
      { color: "#0f172a", x: "60%",  y: "40%",  size: "50%", animDuration: "25s", opacity: 0.6 },
    ],
    shapes: [
      { type: "line",    color: "#334155", x: "0%",   y: "20%", size: "100%", opacity: 0.2, rotation: -5,  animDelay: "0s" },
      { type: "line",    color: "#334155", x: "0%",   y: "60%", size: "100%", opacity: 0.15,rotation: 3,   animDelay: "0s" },
    ],
    scanlineColor: "rgba(255,255,255,0.015)",
    gridColor: "rgba(255,255,255,0.025)",
  },
  tropical: {
    base: "#020e14",
    blobs: [
      { color: "#059669", x: "0",    y: "0",    size: "60%", animDuration: "16s", opacity: 0.2 },
      { color: "#0891b2", x: "50%",  y: "40%",  size: "55%", animDuration: "20s", opacity: 0.18 },
      { color: "#f59e0b", x: "30%",  y: "80%",  size: "40%", animDuration: "14s", opacity: 0.12 },
    ],
    shapes: [
      { type: "triangle", color: "#10b981", x: "2%",  y: "5%",  size: "70px", opacity: 0.15, rotation: 30, animDelay: "0s" },
      { type: "circle",   color: "#06b6d4", x: "85%", y: "20%", size: "55px", opacity: 0.12, rotation: 0,  animDelay: "1s" },
    ],
    scanlineColor: "rgba(6,182,212,0.04)",
    gridColor: "rgba(6,182,212,0.05)",
  },
  cosmic: {
    base: "#04001a",
    blobs: [
      { color: "#6d28d9", x: "0",    y: "0",    size: "70%", animDuration: "20s", opacity: 0.2 },
      { color: "#be185d", x: "50%",  y: "50%",  size: "60%", animDuration: "24s", opacity: 0.15 },
      { color: "#1d4ed8", x: "80%",  y: "10%",  size: "50%", animDuration: "18s", opacity: 0.15 },
    ],
    shapes: [
      { type: "circle", color: "#7c3aed", x: "10%", y: "15%", size: "40px", opacity: 0.2, rotation: 0, animDelay: "0s" },
      { type: "circle", color: "#db2777", x: "80%", y: "75%", size: "55px", opacity: 0.15, rotation: 0, animDelay: "2s" },
      { type: "circle", color: "#2563eb", x: "50%", y: "5%",  size: "30px", opacity: 0.12, rotation: 0, animDelay: "1s" },
    ],
    scanlineColor: "rgba(109,40,217,0.04)",
    gridColor: "rgba(109,40,217,0.06)",
  },
  ice_cold: {
    base: "#020d18",
    blobs: [
      { color: "#0369a1", x: "10%",  y: "0",   size: "60%", animDuration: "20s", opacity: 0.2 },
      { color: "#0e7490", x: "60%",  y: "50%", size: "50%", animDuration: "16s", opacity: 0.15 },
    ],
    shapes: [
      { type: "diamond", color: "#38bdf8", x: "5%",  y: "10%", size: "60px", opacity: 0.15, rotation: 0,  animDelay: "0s" },
      { type: "diamond", color: "#7dd3fc", x: "85%", y: "80%", size: "45px", opacity: 0.12, rotation: 15, animDelay: "1s" },
    ],
    scanlineColor: "rgba(56,189,248,0.04)",
    gridColor: "rgba(56,189,248,0.06)",
  },
  fire: {
    base: "#100300",
    blobs: [
      { color: "#b45309", x: "0",    y: "50%", size: "65%", animDuration: "12s", opacity: 0.22 },
      { color: "#dc2626", x: "60%",  y: "20%", size: "55%", animDuration: "16s", opacity: 0.18 },
      { color: "#f59e0b", x: "30%",  y: "80%", size: "40%", animDuration: "10s", opacity: 0.15 },
    ],
    shapes: [
      { type: "triangle", color: "#f97316", x: "5%",  y: "5%",  size: "70px", opacity: 0.18, rotation: 10, animDelay: "0s" },
      { type: "triangle", color: "#dc2626", x: "80%", y: "75%", size: "50px", opacity: 0.15, rotation: 190,animDelay: "1s" },
    ],
    scanlineColor: "rgba(249,115,22,0.04)",
    gridColor: "rgba(249,115,22,0.05)",
  },
  toxic: {
    base: "#010e01",
    blobs: [
      { color: "#166534", x: "0",    y: "0",   size: "60%", animDuration: "18s", opacity: 0.22 },
      { color: "#15803d", x: "60%",  y: "50%", size: "50%", animDuration: "22s", opacity: 0.18 },
    ],
    shapes: [
      { type: "triangle", color: "#4ade80", x: "5%",  y: "8%",  size: "60px", opacity: 0.15, rotation: 20, animDelay: "0s" },
      { type: "circle",   color: "#22c55e", x: "85%", y: "70%", size: "50px", opacity: 0.12, rotation: 0,  animDelay: "2s" },
    ],
    scanlineColor: "rgba(74,222,128,0.04)",
    gridColor: "rgba(74,222,128,0.05)",
  },
  gold_luxury: {
    base: "#0a0700",
    blobs: [
      { color: "#92400e", x: "0",    y: "0",   size: "60%", animDuration: "20s", opacity: 0.22 },
      { color: "#b45309", x: "60%",  y: "40%", size: "50%", animDuration: "24s", opacity: 0.18 },
    ],
    shapes: [
      { type: "diamond", color: "#fbbf24", x: "5%",  y: "10%", size: "65px", opacity: 0.15, rotation: 0,  animDelay: "0s" },
      { type: "diamond", color: "#f59e0b", x: "85%", y: "75%", size: "50px", opacity: 0.12, rotation: 20, animDelay: "1s" },
    ],
    scanlineColor: "rgba(251,191,36,0.04)",
    gridColor: "rgba(251,191,36,0.06)",
  },
  shadow: {
    base: "#020202",
    blobs: [
      { color: "#1f2937", x: "0",   y: "0",   size: "70%", animDuration: "25s", opacity: 0.6 },
      { color: "#111827", x: "50%", y: "50%", size: "60%", animDuration: "30s", opacity: 0.4 },
    ],
    shapes: [],
    scanlineColor: "rgba(255,255,255,0.015)",
    gridColor: "rgba(255,255,255,0.02)",
  },
};

/* ─── Shape renderer ─────────────────────────────────────────────────────── */
function Shape({ shape }: { shape: ThemeDef["shapes"][0] }) {
  const base: CSSProperties = {
    position: "absolute",
    left: shape.x,
    top: shape.y,
    opacity: shape.opacity,
    transform: `rotate(${shape.rotation}deg)`,
    animation: `shapePulse 6s ease-in-out ${shape.animDelay} infinite alternate`,
    willChange: "transform, opacity",
    pointerEvents: "none",
  };

  if (shape.type === "triangle") {
    return (
      <svg
        style={{ ...base, width: shape.size, height: shape.size }}
        viewBox="0 0 100 100"
        fill={shape.color}
      >
        <polygon points="50,5 95,95 5,95" />
      </svg>
    );
  }
  if (shape.type === "diamond") {
    return (
      <svg
        style={{ ...base, width: shape.size, height: shape.size }}
        viewBox="0 0 100 100"
        fill={shape.color}
      >
        <polygon points="50,5 95,50 50,95 5,50" />
      </svg>
    );
  }
  if (shape.type === "circle") {
    return (
      <div
        style={{
          ...base,
          width: shape.size,
          height: shape.size,
          borderRadius: "50%",
          background: shape.color,
          filter: `blur(2px)`,
        }}
      />
    );
  }
  if (shape.type === "line") {
    return (
      <div
        style={{
          ...base,
          width: shape.size,
          height: "1px",
          background: shape.color,
        }}
      />
    );
  }
  return null;
}

/* ─── TMIUnderlaySystem ───────────────────────────────────────────────────── */
export function TMIUnderlaySystem({
  theme = "neon80s",
  intensity = 1,
  showGrid = false,
  showScanlines = true,
}: {
  theme?: UnderlayTheme;
  intensity?: number;   // 0–1 scales opacity of all effects
  showGrid?: boolean;
  showScanlines?: boolean;
}) {
  const def = THEMES[theme];

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* Base */}
      <div className="absolute inset-0" style={{ background: def.base }} />

      {/* Blobs */}
      {def.blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color}${Math.round(blob.opacity * intensity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
            animation: `blobDrift${(i % 3) + 1} ${blob.animDuration} ease-in-out infinite alternate`,
            willChange: "transform",
          }}
        />
      ))}

      {/* Shapes */}
      {def.shapes.map((shape, i) => (
        <Shape key={i} shape={{ ...shape, opacity: shape.opacity * intensity }} />
      ))}

      {/* Scanlines */}
      {showScanlines && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${def.scanlineColor} 2px, ${def.scanlineColor} 4px)`,
            opacity: intensity,
          }}
        />
      )}

      {/* Grid */}
      {showGrid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${def.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${def.gridColor} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            opacity: intensity * 0.8,
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blobDrift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(4%,6%) scale(1.12); } }
          @keyframes blobDrift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-6%,4%) scale(1.08); } }
          @keyframes blobDrift3 { from { transform: translate(0,0) scale(1); } to { transform: translate(5%,-5%) scale(1.15); } }
          @keyframes shapePulse { from { opacity: var(--op, 0.1); transform: rotate(var(--rot,0deg)) scale(1); } to { opacity: calc(var(--op, 0.1) * 1.8); transform: rotate(var(--rot,0deg)) scale(1.06); } }
        `,
      }} />
    </div>
  );
}

/* ─── TMIOverlayFXSystem ─────────────────────────────────────────────────── */
interface FXParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  type: "star" | "spark" | "streak" | "confetti";
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotSpeed: number;
}

export function TMIOverlayFXSystem({
  mode = "ambient",
  colors = ["#fbbf24", "#38bdf8", "#a855f7", "#ec4899", "#f97316"],
  density = 1,
}: {
  mode?: OverlayMode;
  colors?: string[];
  density?: number;       // 0–2, multiplier on particle spawn rate
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FXParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (mode === "off") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d")!;

    function spawn(burst = false) {
      const count = burst ? 12 : 1;
      for (let i = 0; i < count; i++) {
        const id = Date.now() + Math.random();
        const type = (["star", "spark", "streak", "confetti"] as const)[
          Math.floor(Math.random() * 4)
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particlesRef.current.push({
          id,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (burst ? 4 : 1.5),
          vy: (Math.random() - 0.5) * (burst ? 4 : 1.5) - (burst ? 2 : 0.5),
          color,
          type,
          life: 0,
          maxLife: burst ? 60 + Math.random() * 40 : 120 + Math.random() * 80,
          size: burst ? 4 + Math.random() * 8 : 2 + Math.random() * 4,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * (burst ? 10 : 3),
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spawnRate = mode === "celebration" ? 2 : mode === "burst" ? 4 : 8;
      if (frameRef.current % Math.round(spawnRate / density) === 0) {
        spawn(mode === "burst" || mode === "celebration");
      }

      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.rotation += p.rotSpeed;
        p.life++;

        const alpha = Math.min(1, Math.min(p.life / 15, (p.maxLife - p.life) / 15));
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.type === "star") {
          ctx.beginPath();
          for (let k = 0; k < 5; k++) {
            const a = (k * Math.PI * 2) / 5 - Math.PI / 2;
            const b = a + Math.PI / 5;
            ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
            ctx.lineTo(Math.cos(b) * p.size * 0.4, Math.sin(b) * p.size * 0.4);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.type === "spark") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        } else if (p.type === "streak") {
          ctx.fillRect(-p.size * 2, -p.size / 3, p.size * 4, p.size / 1.5);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        }

        ctx.restore();
      }

      frameRef.current++;
      rafRef.current = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, colors, density]);

  if (mode === "off") return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 50 }}
      aria-hidden
    />
  );
}

/* ─── Quick page wrapper ─────────────────────────────────────────────────── */
export function TMIPageWithLayers({
  theme = "neon80s",
  overlayMode = "ambient",
  children,
  className = "",
}: {
  theme?: UnderlayTheme;
  overlayMode?: OverlayMode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <TMIUnderlaySystem theme={theme} />
      <div className="relative z-10">{children}</div>
      <TMIOverlayFXSystem mode={overlayMode} />
    </div>
  );
}
