"use client";

/**
 * RankNumberPop
 *
 * Animated rank number badge that pops in when spotlight lands.
 * Sits in the front overlay layer (pointer-events: none).
 */

import type { CSSProperties } from "react";

const RANK_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "linear-gradient(135deg,#FFD700,#FF8C00)", text: "#1a0a00", border: "#FFD700" },
  2: { bg: "linear-gradient(135deg,#C0C0C0,#888)", text: "#111", border: "#C0C0C0" },
  3: { bg: "linear-gradient(135deg,#CD7F32,#8B4513)", text: "#fff8e7", border: "#CD7F32" },
};

const DEFAULT_COLORS = { bg: "linear-gradient(135deg,#22d3ee,#6366f1)", text: "#fff", border: "#22d3ee" };

export type RankNumberPopProps = {
  rank: number;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  "data-testid"?: string;
};

const SIZE_MAP = {
  sm: { container: 28, font: 12 },
  md: { container: 40, font: 18 },
  lg: { container: 56, font: 26 },
};

const POSITION_MAP: Record<string, CSSProperties> = {
  "top-left": { top: 4, left: 4 },
  "top-right": { top: 4, right: 4 },
  "bottom-left": { bottom: 4, left: 4 },
  "bottom-right": { bottom: 4, right: 4 },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
};

export default function RankNumberPop({
  rank,
  active = true,
  size = "md",
  position = "top-left",
  "data-testid": testId,
}: RankNumberPopProps) {
  const colors = RANK_COLORS[rank] ?? DEFAULT_COLORS;
  const dims = SIZE_MAP[size];
  const pos = POSITION_MAP[position];

  return (
    <div
      aria-label={`Rank ${rank}`}
      className="rank-number-pop pointer-events-none absolute"
      style={{
        ...pos,
        zIndex: 20,
        width: dims.container,
        height: dims.container,
        borderRadius: rank === 1 ? "50%" : 6,
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontFamily: "system-ui, sans-serif",
        fontSize: dims.font,
        color: colors.text,
        boxShadow: `0 0 12px ${colors.border}88, 0 2px 6px rgba(0,0,0,0.5)`,
        animation: active ? "rankNumPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
      }}
      data-testid={testId ?? `rank-number-pop-${rank}`}
      data-rank={rank}
    >
      {rank === 1 ? `#${rank}` : rank}
    </div>
  );
}
