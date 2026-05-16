"use client";

/**
 * HomepageUnderlayA.tsx
 * Layer 2 — Ambient motion underlay.
 * Glow beams, electric streaks, ambient pulse. Opacity 18–25%.
 * Rendered with mix-blend-mode: screen on the MagazinePageShell.
 * Animates continuously in the background.
 */

import { useEffect, useState } from "react";

type UnderlayAVariant =
  | "cyan-fuchsia" // Home 1 — Crown world
  | "gold-purple" // Home 1-2 — Rankings
  | "editorial" // Home 2 — News/editorial
  | "live-world" // Home 3 — Live rooms
  | "sponsor" // Home 4 — Sponsor/ads
  | "battle"; // Home 5 — Competition

interface HomepageUnderlayAProps {
  variant?: UnderlayAVariant;
}

const VARIANT_COLORS: Record<UnderlayAVariant, [string, string, string]> = {
  "cyan-fuchsia": ["#00FFFF", "#FF2DAA", "#AA2DFF"],
  "gold-purple": ["#FFD700", "#AA2DFF", "#00FFFF"],
  editorial: ["#FF2DAA", "#FFD700", "#AA2DFF"],
  "live-world": ["#00FF88", "#00FFFF", "#FF2DAA"],
  sponsor: ["#FFD700", "#FF6B35", "#AA2DFF"],
  battle: ["#FF6B35", "#FF2DAA", "#FFD700"],
};

// Static positions for glow orbs — avoids SSR mismatch
const ORB_CONFIGS = [
  { x: "15%", y: "10%", size: 380, delay: 0 },
  { x: "72%", y: "8%", size: 300, delay: 1.5 },
  { x: "48%", y: "55%", size: 420, delay: 3 },
  { x: "88%", y: "70%", size: 260, delay: 2 },
  { x: "8%", y: "80%", size: 320, delay: 0.8 },
];

export default function HomepageUnderlayA({ variant = "cyan-fuchsia" }: HomepageUnderlayAProps) {
  const colors = VARIANT_COLORS[variant];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Ambient glow orbs */}
      {ORB_CONFIGS.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[i % 3]}40 0%, ${colors[(i + 1) % 3]}18 40%, transparent 70%)`,
            transform: `translate(-50%, -50%) scale(${1 + (tick % 2) * 0.04})`,
            transition: `transform ${orb.delay + 2.5}s ease-in-out`,
            opacity: 0.22,
            filter: "blur(2px)",
          }}
        />
      ))}

      {/* Electric beam — horizontal streak */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${colors[0]}60 30%, ${colors[1]}80 50%, ${colors[0]}60 70%, transparent 100%)`,
          opacity: 0.18,
          animation: "none",
        }}
      />

      {/* Electric beam — second streak */}
      <div
        style={{
          position: "absolute",
          top: "68%",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${colors[2]}60 20%, ${colors[0]}80 55%, ${colors[2]}60 80%, transparent 100%)`,
          opacity: 0.14,
        }}
      />

      {/* Diagonal glow beam */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "60%",
          width: 200,
          height: "100%",
          background: `linear-gradient(180deg, ${colors[0]}15 0%, ${colors[1]}08 50%, transparent 100%)`,
          transform: "rotate(-15deg)",
          opacity: 0.2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
