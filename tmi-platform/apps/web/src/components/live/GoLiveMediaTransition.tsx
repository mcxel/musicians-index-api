"use client";

/**
 * GoLiveMediaTransition — CANONICAL in-monitor GO LIVE starburst.
 * Harvested from StarfieldWarpEntry (canvas radial stars) +
 * UniversalLobbyEntry star ring (central shield pulse).
 * MUST mount inside a position:relative media region — never document.body.
 */

import { useEffect, useRef } from "react";
import { TIMING } from "@/lib/motion/timingRegistry";
import { useMediaTransitionDirector } from "@/lib/live/MediaTransitionDirector";

interface WarpStar {
  nx: number;
  ny: number;
  r: number;
  size: number;
  hue: number;
}

function buildWarpStars(n: number): WarpStar[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + i * 0.37;
    return {
      nx: Math.cos(angle),
      ny: Math.sin(angle),
      r: 0.02 + (i % 20) / 120,
      size: 6 + (i % 6) * 3,
      hue: [180, 290, 50, 340, 0][i % 5] ?? 180,
    };
  });
}

export interface GoLiveMediaTransitionProps {
  accentColor?: string;
}

export default function GoLiveMediaTransition({
  accentColor = "#00FFFF",
}: GoLiveMediaTransitionProps) {
  const phase = useMediaTransitionDirector((s) => s.phase);
  const durationMs = useMediaTransitionDirector((s) => s.durationMs);
  const tier = useMediaTransitionDirector((s) => s.reducedMotionTier);
  const completeStarburst = useMediaTransitionDirector((s) => s.completeStarburst);
  const registerInstance = useMediaTransitionDirector((s) => s.registerInstance);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const starsRef = useRef<WarpStar[]>(buildWarpStars(56));
  const releaseRef = useRef<(() => void) | null>(null);

  const active = phase === "playing";

  useEffect(() => {
    if (!active) return;
    releaseRef.current = registerInstance();
    return () => {
      releaseRef.current?.();
      releaseRef.current = null;
    };
  }, [active, registerInstance]);

  useEffect(() => {
    if (!active || tier === "MINIMAL") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const totalMs = durationMs + 200;
    startRef.current = performance.now();
    starsRef.current = buildWarpStars(tier === "REDUCED" ? 36 : 56);

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || 1;
      canvas.height = parent?.clientHeight || 1;
    }
    resize();
    const host = canvas.parentElement;
    const ro = host ? new ResizeObserver(resize) : null;
    if (host && ro) ro.observe(host);

    function frame(now: number) {
      if (!canvas || !ctx) return;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / totalMs, 1);

      let alpha = 1;
      if (elapsed < 120) alpha = elapsed / 120;
      else if (elapsed > totalMs - 180) alpha = 1 - (elapsed - (totalMs - 180)) / 180;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy) || 1;
      const speed = 0.004 * (1 - progress) * (1 - progress) + 0.0004;

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = alpha * 0.92;
      ctx.fillStyle = "rgba(2,4,8,0.55)";
      ctx.fillRect(0, 0, W, H);

      for (const star of starsRef.current) {
        star.r = Math.min(star.r + speed, 1.02);
        const sx = cx + star.nx * star.r * maxR;
        const sy = cy + star.ny * star.r * maxR;
        const apparent = star.size * (0.35 + star.r * 0.65);
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, apparent * 2.2);
        grad.addColorStop(0, `hsla(${star.hue},90%,92%,0.9)`);
        grad.addColorStop(0.35, `hsla(${star.hue},80%,68%,0.45)`);
        grad.addColorStop(1, `hsla(${star.hue},60%,50%,0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, apparent * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        completeStarburst();
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro?.disconnect();
    };
  }, [active, completeStarburst, durationMs, tier]);

  if (!active) return null;

  return (
    <div
      data-canonical-golive-media-transition="true"
      data-reduced-motion-tier={tier}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 12,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {tier !== "MINIMAL" ? (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: Math.min(120, TIMING.starburstDuration),
          height: Math.min(120, TIMING.starburstDuration),
          marginLeft: -60,
          marginTop: -60,
          borderRadius: "50%",
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 36px ${accentColor}88, inset 0 0 24px ${accentColor}33`,
          animation: `goliveShieldPulse ${durationMs}ms ease-out forwards`,
        }}
      />
      <style>{`
        @keyframes goliveShieldPulse {
          0% { transform: scale(0.15) rotate(0deg); opacity: 0.95; }
          55% { transform: scale(1.35) rotate(120deg); opacity: 0.75; }
          100% { transform: scale(2.4) rotate(240deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
