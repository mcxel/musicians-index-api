// Top10Flame — Slice 0 placeholder
// Animated flame badge for Top 10 ranking numbers
// #1-#3: strong flame/glow, #4-#10: lighter accent
// Placement law: flame hugs the number, never covers adjacent text or controls
// Fallback: if reduced-motion preferred, switches to static glow only

"use client";

import type { CSSProperties } from "react";

export interface Top10FlameProps {
  rank: number;
  className?: string;
}

function getFlameIntensity(rank: number): "strong" | "medium" | "light" {
  if (rank <= 3) return "strong";
  if (rank <= 6) return "medium";
  return "light";
}

const FLAME_STYLES: Record<"strong" | "medium" | "light", CSSProperties> = {
  strong: {
    color: "#ff6b35",
    textShadow: "0 0 12px #ff6b35, 0 0 24px #ff4500, 0 0 4px #fff",
    fontWeight: 900,
    fontSize: "1.35em",
    letterSpacing: "-0.02em",
  },
  medium: {
    color: "#ff8c5a",
    textShadow: "0 0 8px #ff6b35, 0 0 14px #ff4500",
    fontWeight: 800,
    fontSize: "1.2em",
  },
  light: {
    color: "rgba(255,107,53,0.7)",
    textShadow: "0 0 5px rgba(255,107,53,0.4)",
    fontWeight: 700,
    fontSize: "1.1em",
  },
};

export default function Top10Flame({ rank, className }: Top10FlameProps) {
  const intensity = getFlameIntensity(rank);
  const style = FLAME_STYLES[intensity];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        lineHeight: 1,
        ...style,
      }}
      aria-label={`Rank ${rank}`}
      data-rank={rank}
      data-flame-intensity={intensity}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-flame-intensity] {
            text-shadow: 0 0 4px rgba(255,107,53,0.5) !important;
            animation: none !important;
          }
        }
        @keyframes flamePulse {
          0%, 100% { text-shadow: 0 0 12px #ff6b35, 0 0 24px #ff4500, 0 0 4px #fff; }
          50% { text-shadow: 0 0 18px #ff6b35, 0 0 32px #ff4500, 0 0 8px #fff8; }
        }
      `}</style>
      {rank <= 3 && (
        <span
          aria-hidden="true"
          style={{
            fontSize: "0.7em",
            animation: "flamePulse 1.6s ease-in-out infinite",
            display: "inline-block",
          }}
        >
          🔥
        </span>
      )}
      <span style={{ fontVariantNumeric: "tabular-nums" }}>#{rank}</span>
    </span>
  );
}
