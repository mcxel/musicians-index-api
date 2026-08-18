"use client";

import { useEffect, useRef } from "react";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";

// Total visible duration (ms) before the overlay self-dismisses.
// Room page also calls clear() on mount, whichever fires first wins.
const TOTAL_MS = 2600;
const FADE_MS = 500;

interface Vec2 { x: number; y: number }

interface WarpStar {
  /** Normalised position relative to canvas centre (−1…1). */
  nx: number;
  ny: number;
  /** Current radial distance from centre, 0…1. */
  r: number;
  /** Apparent size (px) when at r=1. */
  size: number;
  hue: number;
}

function buildWarpStars(n: number): WarpStar[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + (i * 0.37);
    const startR = 0.02 + (i % 20) / 120;
    return {
      nx: Math.cos(angle),
      ny: Math.sin(angle),
      r: startR,
      size: 8 + (i % 6) * 4,
      hue: [180, 290, 50, 340, 0][i % 5],
    };
  });
}

export default function StarfieldWarpEntry() {
  const { isActive, clear } = useGoLiveTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const starsRef = useRef<WarpStar[]>(buildWarpStars(72));

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    startRef.current = performance.now();
    // Re-seed stars at entry each time the transition activates
    starsRef.current = buildWarpStars(72);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function frame(now: number) {
      if (!canvas || !ctx) return;

      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / TOTAL_MS, 1);

      // Global alpha: fade in first 150ms, hold, fade out last FADE_MS
      let alpha = 1;
      if (elapsed < 150) alpha = elapsed / 150;
      else if (elapsed > TOTAL_MS - FADE_MS) alpha = 1 - (elapsed - (TOTAL_MS - FADE_MS)) / FADE_MS;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);

      // Clear
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = alpha;

      // Deep space background
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, W, H);

      // Speed decelerates sharply: v(t) = v0 * (1 - t)^2 where t = progress
      // At t=0: fast-ish; at t=1: nearly stopped. Star positions update accordingly.
      const speed = 0.004 * (1 - progress) * (1 - progress) + 0.0005;

      for (const star of starsRef.current) {
        star.r = Math.min(star.r + speed, 1.02);

        const sx = cx + star.nx * star.r * maxR;
        const sy = cy + star.ny * star.r * maxR;
        // Stars grow larger as they approach the viewer
        const apparent = star.size * (0.4 + star.r * 0.6);

        // Glow
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, apparent * 2.4);
        grad.addColorStop(0, `hsla(${star.hue},90%,92%,0.95)`);
        grad.addColorStop(0.3, `hsla(${star.hue},80%,70%,0.5)`);
        grad.addColorStop(1, `hsla(${star.hue},60%,50%,0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, apparent * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(sx, sy, apparent * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        clear();
      }
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isActive, clear]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "block",
        pointerEvents: "none",
        background: "transparent",
      }}
    />
  );
}
