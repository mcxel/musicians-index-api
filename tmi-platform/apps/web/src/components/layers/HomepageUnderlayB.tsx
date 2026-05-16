"use client";

/**
 * HomepageUnderlayB.tsx
 * Layer 3 — Secondary particle motion underlay.
 * Confetti drift, dust particles, spark movement. Opacity 10–18%.
 * Rendered with mix-blend-mode: screen on the MagazinePageShell.
 */

import { useEffect, useState } from "react";

type UnderlayBVariant =
  | "confetti" // Home 1 — crown confetti
  | "dust" // Home 1-2 — magazine dust
  | "sparks" // Home 2 — editorial sparks
  | "orbs" // Home 3 — live orb drift
  | "gold-dust" // Home 4 — sponsor shimmer
  | "fire-sparks"; // Home 5 — battle fire

interface HomepageUnderlayBProps {
  variant?: UnderlayBVariant;
}

// Seeded particle configs — static to avoid SSR hydration mismatch
const PARTICLE_CONFIGS = [
  { x: "5%", y: "20%", size: 3, speed: 6 },
  { x: "14%", y: "65%", size: 2, speed: 9 },
  { x: "24%", y: "40%", size: 4, speed: 7 },
  { x: "35%", y: "15%", size: 2, speed: 11 },
  { x: "44%", y: "75%", size: 3, speed: 8 },
  { x: "53%", y: "30%", size: 2, speed: 10 },
  { x: "63%", y: "55%", size: 4, speed: 6 },
  { x: "72%", y: "10%", size: 2, speed: 12 },
  { x: "81%", y: "80%", size: 3, speed: 7 },
  { x: "90%", y: "45%", size: 2, speed: 9 },
  { x: "20%", y: "90%", size: 3, speed: 8 },
  { x: "77%", y: "35%", size: 2, speed: 11 },
];

const VARIANT_COLORS: Record<UnderlayBVariant, string[]> = {
  confetti: ["#FF2DAA", "#00FFFF", "#FFD700", "#AA2DFF", "#00FF88"],
  dust: ["#FFD700", "#ffffff", "#AA2DFF"],
  sparks: ["#FF2DAA", "#FFD700", "#ffffff"],
  orbs: ["#00FF88", "#00FFFF", "#AA2DFF"],
  "gold-dust": ["#FFD700", "#FF6B35", "#ffffff"],
  "fire-sparks": ["#FF6B35", "#FF2DAA", "#FFD700"],
};

export default function HomepageUnderlayB({ variant = "confetti" }: HomepageUnderlayBProps) {
  const colors = VARIANT_COLORS[variant];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Animated keyframes via style tag */}
      <style>{`
        @keyframes tmi-particle-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.12; }
          100% { transform: translateY(-120px) rotate(360deg); opacity: 0; }
        }
        @keyframes tmi-spark-flicker {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.18; transform: scale(1); }
        }
        @keyframes tmi-confetti-drift {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.14; }
          85% { opacity: 0.1; }
          100% { transform: translateY(-80px) translateX(20px) rotate(180deg); opacity: 0; }
        }
      `}</style>

      {/* Floating particles */}
      {PARTICLE_CONFIGS.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: variant === "confetti" ? "2px" : "50%",
            background: colors[i % colors.length],
            animation: `${
              variant === "confetti"
                ? "tmi-confetti-drift"
                : variant === "fire-sparks"
                ? "tmi-spark-flicker"
                : "tmi-particle-float"
            } ${p.speed}s ${(i * 0.7) % 5}s infinite ease-in-out`,
            opacity: 0,
          }}
        />
      ))}

      {/* Larger glow dots — secondary layer */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`glow-${i}`}
          style={{
            position: "absolute",
            left: `${20 + i * 22}%`,
            top: `${30 + (i % 2) * 40}%`,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors[i % colors.length],
            boxShadow: `0 0 8px 2px ${colors[i % colors.length]}80`,
            animation: `tmi-spark-flicker ${4 + i}s ${i * 1.2}s infinite ease-in-out`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
