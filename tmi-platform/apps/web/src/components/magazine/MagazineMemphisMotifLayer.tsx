"use client";

/**
 * MagazineMemphisMotifLayer — §20930 / 80s print geometry accents.
 * Decorative only (pointer-events none). Not a second magazine engine.
 * Reference: Memphis / Smash Hits / Sassy — triangles, squiggles, confetti, bolts.
 */

import React from "react";

export type MemphisMotifVariant =
  | "sunshine"
  | "electric"
  | "jewel"
  | "gossip"
  | "happyDays"
  | "cream"
  | "newsprint"
  | "cinematic"
  | "vibe"
  | "default";

type Props = {
  variant?: MemphisMotifVariant;
  opacity?: number;
};

const VARIANT_MAP: Record<string, MemphisMotifVariant> = {
  sunshine: "sunshine",
  electric: "electric",
  jewel: "jewel",
  gossip: "gossip",
  happyDays: "happyDays",
  cream: "cream",
  newsprint: "newsprint",
  classic: "cream",
  ebony: "cream",
  jet: "sunshine",
  modern: "electric",
  vibe: "vibe",
  cinematic: "cinematic",
};

export function resolveMemphisVariant(archetypeId: string): MemphisMotifVariant {
  return VARIANT_MAP[archetypeId] ?? "default";
}

export default function MagazineMemphisMotifLayer({
  variant = "default",
  opacity = 0.55,
}: Props) {
  if (variant === "cinematic") return null;

  const a = opacity;
  return (
    <div
      aria-hidden
      data-memphis-motif={variant}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 3,
        overflow: "hidden",
        opacity: a,
      }}
    >
      {/* Confetti dots */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none">
        <circle cx="8%" cy="12%" r="6" fill="#FF2DAA" />
        <circle cx="92%" cy="18%" r="8" fill="#00E5FF" />
        <circle cx="18%" cy="78%" r="5" fill="#FFD100" />
        <circle cx="86%" cy="72%" r="7" fill="#7CFF4F" />
        <circle cx="48%" cy="8%" r="4" fill="#AA2DFF" />
        <circle cx="72%" cy="88%" r="5" fill="#FF3B30" />
        {/* Squiggle / bacilli */}
        <path
          d="M12 42 C18 36, 22 48, 28 42 S38 36, 44 44"
          fill="none"
          stroke="#FF2DAA"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M60 28 C66 22, 70 34, 76 28 S86 22, 92 30"
          fill="none"
          stroke="#00E5FF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Lightning bolt */}
        <polygon points="78,10 70,28 76,28 68,48 84,24 76,24" fill="#FFD100" stroke="#1a0a00" strokeWidth="1.5" />
        {/* Triangles */}
        <polygon points="6,88 22,88 14,72" fill="#FF3B30" stroke="#1a0a00" strokeWidth="1.5" />
        <polygon points="94,55 100,70 88,70" fill="#AA2DFF" stroke="#1a0a00" strokeWidth="1.5" />
        {/* Checker accent strip (Memphis) */}
        <g opacity="0.85">
          <rect x="0" y="0" width="18" height="10" fill="#FFD100" />
          <rect x="18" y="0" width="18" height="10" fill="#1a0a00" />
          <rect x="36" y="0" width="18" height="10" fill="#FF2DAA" />
          <rect x="54" y="0" width="18" height="10" fill="#00E5FF" />
          <rect x="72" y="0" width="18" height="10" fill="#7CFF4F" />
          <rect x="90" y="0" width="18" height="10" fill="#AA2DFF" />
        </g>
      </svg>
    </div>
  );
}
