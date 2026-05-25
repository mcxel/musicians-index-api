"use client";

/**
 * TMIHome1Compositor.tsx
 * Full poster-density visual layer system for Homepage 1.
 *
 * The 7 layers (z-index order):
 *  0  — AtmosphereUnderlay:  animated neon gradient mesh
 *  1  — ShapeUnderlay:       triangles, stars, lightning, rank numbers
 *  2  — Content:             performer orbit cards (existing MagazinePageFlipRuntime)
 *  3  — CenterFocusHalo:     crown/glow ring behind leader card
 *  4  — OverlayFX:           confetti, sparkles, starbursts above faces
 *  5  — LiveBannerStrip:     "VOTING LIVE", "CROWN UPDATING" ticker
 *  6  — MagazineLogoLockup:  TMI Magazine animated title
 *
 * Mobile: uses 100svh, w-screen, overflow-hidden
 * GPU:    all animations use transform + opacity only (no layout)
 *
 * Drop at: apps/web/src/components/home/TMIHome1Compositor.tsx
 * Import in: apps/web/src/app/home/1/page.tsx as the outer wrapper
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface CompositorProps {
  children: ReactNode;         // the existing MagazinePageFlipRuntime / HomeSurfacePage
  isLive?: boolean;
  viewerCount?: number;
  topPerformerName?: string;
}

/* ─── 1. Atmosphere underlay ─────────────────────────────────────────────── */
function AtmosphereUnderlay() {
  return (
    <div
      className="absolute inset-0 z-[0] pointer-events-none"
      aria-hidden
    >
      {/* Base deep indigo */}
      <div className="absolute inset-0" style={{ background: "#0b0426" }} />

      {/* Animated gradient blobs */}
      <div
        className="absolute"
        style={{
          top: "-20%", left: "-20%", width: "80%", height: "80%",
          background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)",
          animation: "blobDrift1 14s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "30%", right: "-15%", width: "70%", height: "70%",
          background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
          animation: "blobDrift2 18s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "-10%", left: "20%", width: "60%", height: "60%",
          background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
          animation: "blobDrift3 22s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "10%", left: "30%", width: "40%", height: "40%",
          background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
          animation: "blobDrift1 12s ease-in-out infinite alternate-reverse",
          willChange: "transform",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

/* ─── 2. Shape underlay ──────────────────────────────────────────────────── */
interface Shape {
  id: number;
  type: "triangle" | "starburst" | "lightning" | "ring" | "number";
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  animDelay: number;
  label?: string;
}

function ShapeUnderlay() {
  const SHAPES: Shape[] = [
    // Corner triangles
    { id: 1, type: "triangle", x: -3,  y: 5,  size: 120, color: "#a855f7", opacity: 0.15, rotation: 30,  animDelay: 0,   label: "" },
    { id: 2, type: "triangle", x: 78,  y: -2, size: 90,  color: "#06b6d4", opacity: 0.12, rotation: 145, animDelay: 0.8, label: "" },
    { id: 3, type: "triangle", x: 5,   y: 78, size: 80,  color: "#ec4899", opacity: 0.1,  rotation: 200, animDelay: 1.2, label: "" },
    { id: 4, type: "triangle", x: 85,  y: 82, size: 70,  color: "#f59e0b", opacity: 0.1,  rotation: 70,  animDelay: 2.0, label: "" },

    // Starbursts
    { id: 5, type: "starburst", x: 10, y: 40, size: 50,  color: "#fbbf24", opacity: 0.2,  rotation: 0,   animDelay: 1.5, label: "" },
    { id: 6, type: "starburst", x: 88, y: 25, size: 40,  color: "#38bdf8", opacity: 0.2,  rotation: 15,  animDelay: 2.5, label: "" },
    { id: 7, type: "starburst", x: 55, y: 88, size: 35,  color: "#f472b6", opacity: 0.15, rotation: 30,  animDelay: 0.5, label: "" },

    // Rank numbers (behind performer cards)
    { id: 8,  type: "number", x: 8,  y: 18, size: 80, color: "#a855f7", opacity: 0.06, rotation: -5,  animDelay: 0, label: "#1" },
    { id: 9,  type: "number", x: 72, y: 35, size: 60, color: "#06b6d4", opacity: 0.05, rotation: 8,   animDelay: 0, label: "#2" },
    { id: 10, type: "number", x: 20, y: 60, size: 55, color: "#ec4899", opacity: 0.05, rotation: -3,  animDelay: 0, label: "#3" },

    // Lightning bolts
    { id: 11, type: "lightning", x: 5,  y: 55, size: 40, color: "#fbbf24", opacity: 0.25, rotation: -10, animDelay: 1.0, label: "" },
    { id: 12, type: "lightning", x: 88, y: 60, size: 35, color: "#38bdf8", opacity: 0.2,  rotation: 15,  animDelay: 2.2, label: "" },

    // Rings
    { id: 13, type: "ring", x: 45, y: 10, size: 60, color: "#a855f7", opacity: 0.1, rotation: 0, animDelay: 3.0, label: "" },
    { id: 14, type: "ring", x: 12, y: 75, size: 45, color: "#06b6d4", opacity: 0.08, rotation: 0, animDelay: 1.5, label: "" },
  ];

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden>
      {SHAPES.map((shape) => (
        <div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            opacity: shape.opacity,
            transform: `rotate(${shape.rotation}deg)`,
            animation: `shapePulse 6s ease-in-out ${shape.animDelay}s infinite alternate`,
            willChange: "transform, opacity",
          }}
        >
          {shape.type === "triangle" && (
            <svg viewBox="0 0 100 100" fill={shape.color}>
              <polygon points="50,5 95,95 5,95" />
            </svg>
          )}
          {shape.type === "starburst" && (
            <svg viewBox="0 0 100 100" fill={shape.color}>
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 8;
                const x1 = 50 + Math.cos(angle) * 48;
                const y1 = 50 + Math.sin(angle) * 48;
                const x2 = 50 + Math.cos(angle + 0.4) * 20;
                const y2 = 50 + Math.sin(angle + 0.4) * 20;
                const x3 = 50 + Math.cos(angle - 0.4) * 20;
                const y3 = 50 + Math.sin(angle - 0.4) * 20;
                return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} />;
              })}
            </svg>
          )}
          {shape.type === "lightning" && (
            <svg viewBox="0 0 50 100" fill={shape.color}>
              <polygon points="28,0 8,55 22,55 10,100 42,40 26,40 38,0" />
            </svg>
          )}
          {shape.type === "ring" && (
            <svg viewBox="0 0 100 100" fill="none" stroke={shape.color} strokeWidth="4">
              <circle cx="50" cy="50" r="44" />
              <circle cx="50" cy="50" r="32" strokeWidth="2" strokeOpacity="0.5" />
            </svg>
          )}
          {shape.type === "number" && (
            <span
              className="font-black select-none"
              style={{
                fontSize: shape.size * 0.7,
                color: shape.color,
                lineHeight: 1,
                display: "block",
                fontFamily: "'Arial Black', sans-serif",
              }}
            >
              {shape.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── 3. Center focus halo ─────────────────────────────────────────────────── */
function CenterFocusHalo({ glowColor = "#a855f7" }: { glowColor?: string }) {
  return (
    <div
      className="absolute z-[3] pointer-events-none"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 220,
        height: 220,
      }}
      aria-hidden
    >
      {/* Rotating halo ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `2px solid ${glowColor}50`,
          animation: "haloRotate 10s linear infinite",
          boxShadow: `0 0 40px ${glowColor}40, inset 0 0 40px ${glowColor}20`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 20,
          borderRadius: "50%",
          border: `1px solid ${glowColor}30`,
          animation: "haloRotate 16s linear infinite reverse",
        }}
      />
      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          inset: "30%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
          animation: "glowPulse 3s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/* ─── 4. Overlay FX ──────────────────────────────────────────────────────── */
interface SparkParticle {
  id: number;
  x: number;
  y: number;
  type: "star" | "spark" | "confetti";
  color: string;
  size: number;
  animDuration: number;
  animDelay: number;
}

function OverlayFX({ burst = false }: { burst?: boolean }) {
  const SPARKS: SparkParticle[] = [
    ...Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: (["star", "spark", "confetti"] as const)[i % 3],
      color: ["#fbbf24", "#38bdf8", "#a855f7", "#ec4899", "#f97316"][i % 5],
      size: 6 + Math.random() * 10,
      animDuration: 2 + Math.random() * 4,
      animDelay: Math.random() * 4,
    })),
  ];

  return (
    <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden" aria-hidden>
      {SPARKS.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `floatSpark ${s.animDuration}s ease-in-out ${s.animDelay}s infinite`,
            willChange: "transform, opacity",
          }}
        >
          {s.type === "star" && (
            <svg viewBox="0 0 10 10" fill={s.color} style={{ filter: `drop-shadow(0 0 4px ${s.color})` }}>
              <polygon points="5,0 6.5,3.5 10,3.5 7.5,6 8.5,10 5,7.5 1.5,10 2.5,6 0,3.5 3.5,3.5" />
            </svg>
          )}
          {s.type === "spark" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: s.color,
                boxShadow: `0 0 8px ${s.color}`,
              }}
            />
          )}
          {s.type === "confetti" && (
            <div
              style={{
                width: "100%",
                height: "60%",
                background: s.color,
                borderRadius: 2,
                transform: "rotate(30deg)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── 5. Live banner strip ─────────────────────────────────────────────────── */
const BANNER_MESSAGES = [
  "🔥 VOTING LIVE — CAST YOUR VOTE NOW",
  "👑 CROWN UPDATING IN REAL TIME",
  "⚡ CYPHER ARENA OPEN — JOIN NOW",
  "🎤 STREAM & WIN — TUNE IN",
  "🏆 RANK SWAP INCOMING — #3 RISING",
  "💎 DIAMOND TIER BATTLE — WATCH LIVE",
  "🎯 WINNER REVEAL SOON",
  "🎵 BEAT LOCKER DROPS — NEW TRACKS",
];

function LiveBannerStrip({ isLive = true }: { isLive?: boolean }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % BANNER_MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  if (!isLive) return null;

  return (
    <div
      className="absolute z-[5] left-0 right-0 flex justify-center pointer-events-none"
      style={{ top: "92px" }}
      aria-hidden
    >
      <div
        className="px-4 py-1.5 rounded-full border flex items-center gap-2 backdrop-blur-sm"
        style={{
          background: "rgba(0,0,0,0.65)",
          borderColor: "rgba(168,85,247,0.4)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.4s ease, opacity 0.4s ease",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <span className="text-[9px] font-black tracking-widest text-white uppercase">
          {BANNER_MESSAGES[index]}
        </span>
      </div>
    </div>
  );
}

/* ─── 6. Magazine logo lockup ────────────────────────────────────────────── */
function MagazineLogoLockup() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="absolute z-[6] top-3 left-0 right-0 flex justify-center pointer-events-none"
      aria-label="The Musician's Index Magazine"
    >
      <div
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.9)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Outer ring + title */}
        <div className="flex items-center gap-2">
          {/* Rotating circle logo */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: "#a855f7",
                animation: "haloRotate 8s linear infinite",
                boxShadow: "0 0 12px #a855f780",
              }}
            />
            <div className="absolute inset-1.5 rounded-full bg-[#a855f720] flex items-center justify-center">
              <span className="text-[7px] font-black text-purple-400 tracking-tighter">TMI</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <span
              className="font-black tracking-[0.12em] uppercase text-white leading-none"
              style={{
                fontSize: "clamp(10px, 2.8vw, 14px)",
                textShadow: "0 0 20px rgba(168,85,247,0.6)",
                fontFamily: "'Arial Black', 'Impact', sans-serif",
                letterSpacing: "0.18em",
              }}
            >
              The Musician's Index
            </span>
            <span
              className="font-black tracking-[0.35em] uppercase"
              style={{
                fontSize: "clamp(7px, 1.8vw, 9px)",
                color: "#a855f7",
                letterSpacing: "0.45em",
              }}
            >
              Magazine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 7. Starburst page transition ────────────────────────────────────────── */
export function StarburstTransition({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center"
      style={{ animation: "starburst 0.7s ease-out forwards" }}
      aria-hidden
    >
      <div
        style={{
          width: "100vmax",
          height: "100vmax",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.9) 0%, rgba(6,182,212,0.6) 40%, transparent 70%)",
          animation: "starburstExpand 0.7s ease-out forwards",
        }}
      />
    </div>
  );
}

/* ─── Keyframes injection ─────────────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes blobDrift1 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(5%, 8%) scale(1.15); }
}
@keyframes blobDrift2 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(-8%, 5%) scale(1.1); }
}
@keyframes blobDrift3 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(6%, -6%) scale(1.2); }
}
@keyframes shapePulse {
  from { opacity: var(--base-opacity, 0.1); transform: rotate(var(--base-rot, 0deg)) scale(1); }
  to   { opacity: calc(var(--base-opacity, 0.1) * 1.8); transform: rotate(var(--base-rot, 0deg)) scale(1.08); }
}
@keyframes haloRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.2); }
}
@keyframes floatSpark {
  0%   { transform: translate(0, 0) scale(1);   opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 0.7; }
  100% { transform: translate(var(--dx, 20px), var(--dy, -40px)) scale(0.5); opacity: 0; }
}
@keyframes starburstExpand {
  from { transform: scale(0); opacity: 1; }
  to   { transform: scale(3); opacity: 0; }
}
`;

/* ─── Main compositor ─────────────────────────────────────────────────────── */
export default function TMIHome1Compositor({
  children,
  isLive = true,
  viewerCount,
  topPerformerName,
}: CompositorProps) {
  return (
    <div
      className="relative w-screen overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Layer 0: Atmosphere */}
      <AtmosphereUnderlay />

      {/* Layer 1: Shapes */}
      <ShapeUnderlay />

      {/* Layer 3: Center focus halo */}
      <CenterFocusHalo glowColor="#a855f7" />

      {/* Layer 4: Overlay FX */}
      <OverlayFX />

      {/* Layer 5: Live banner */}
      <LiveBannerStrip isLive={isLive} />

      {/* Layer 6: Logo */}
      <MagazineLogoLockup />

      {/* Layer 2: Content (sits between shape underlay and center halo) */}
      <div className="relative z-[2] w-full h-full">
        {children}
      </div>
    </div>
  );
}

/**
 * USAGE IN apps/web/src/app/home/1/page.tsx:
 *
 * import TMIHome1Compositor from "@/components/home/TMIHome1Compositor";
 *
 * export default function Home1Page() {
 *   return (
 *     <TMIHome1Compositor isLive viewerCount={284}>
 *       <YourExistingMagazinePageFlipRuntime />
 *     </TMIHome1Compositor>
 *   );
 * }
 */
