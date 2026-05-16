"use client";

/**
 * AwkwardShapeOverlayFrame
 *
 * Layered magazine-style irregular frame overlay system.
 * NEVER clips or distorts the underlying media player.
 *
 * Usage:
 *   <div style={{ position: "relative" }}>
 *     <AwkwardShapeOverlayFrame variant="magazine" rank={1} animated />
 *     <video ... />   ← media stays clean rectangle
 *   </div>
 *
 * Layer model:
 *   backShapeLayer  (z: -1)  — teal/purple/orange blobs behind content
 *   [media slot]    (z:  0)  — caller renders media here
 *   frontFrameLayer (z: 10)  — SVG jagged frame border
 */

import type { CSSProperties } from "react";

export type OverlayFrameVariant =
  | "magazine"
  | "crown"
  | "battle"
  | "orbit"
  | "feature"
  | "neon"
  | "gold"
  | "minimal";

const RANK_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

const VARIANT_STROKE: Record<OverlayFrameVariant, string> = {
  magazine: "url(#grad-magazine)",
  crown: "url(#grad-crown)",
  battle: "url(#grad-battle)",
  orbit: "url(#grad-orbit)",
  feature: "url(#grad-feature)",
  neon: "#22d3ee",
  gold: "#FFD700",
  minimal: "rgba(255,255,255,0.25)",
};

// Irregular polygon points for different frame styles
const FRAME_POINTS: Record<OverlayFrameVariant, string> = {
  magazine:
    "2,8 6,2 14,0 26,3 40,1 55,0 70,2 82,0 94,3 100,8 99,20 100,35 98,50 100,65 99,80 100,92 96,100 82,99 68,100 52,98 38,100 24,99 10,100 2,95 0,80 1,65 0,50 2,35 0,20",
  crown:
    "0,10 4,4 10,0 24,2 38,0 54,1 68,0 82,2 92,0 100,6 98,16 100,30 99,48 100,64 98,78 100,90 96,100 80,98 62,100 44,99 28,100 12,98 2,100 0,88 2,74 0,58 1,42 0,26",
  battle:
    "5,0 18,3 32,0 48,4 64,0 78,2 94,0 100,10 97,25 100,40 96,58 100,72 97,86 100,100 84,97 66,100 50,96 34,100 18,97 4,100 0,88 3,72 0,56 2,40 0,24 3,10",
  orbit:
    "0,5 8,0 22,3 38,0 52,2 68,0 82,3 96,0 100,8 98,22 100,38 97,54 100,68 98,84 100,96 88,100 72,97 56,100 40,98 24,100 8,97 0,92 2,76 0,60 2,44 0,28 2,12",
  feature:
    "3,6 12,0 28,4 44,0 60,3 76,0 92,2 100,12 97,28 100,44 98,60 100,76 97,92 100,100 82,97 64,100 46,97 28,100 10,97 0,92 2,76 0,60 2,44 0,28 2,12",
  neon: "2,2 98,2 98,98 2,98",
  gold: "1,1 99,1 99,99 1,99",
  minimal: "0,0 100,0 100,100 0,100",
};

type BackShapeProps = {
  variant: OverlayFrameVariant;
  animated: boolean;
};

function BackShapeLayer({ variant, animated }: BackShapeProps) {
  const shapes = [
    {
      cx: "15%",
      cy: "20%",
      rx: "22%",
      ry: "18%",
      color: variant === "crown" ? "rgba(255,215,0,0.18)" : "rgba(0,212,255,0.14)",
      delay: "0s",
    },
    {
      cx: "82%",
      cy: "25%",
      rx: "18%",
      ry: "14%",
      color: variant === "battle" ? "rgba(239,68,68,0.18)" : "rgba(168,85,247,0.15)",
      delay: "1.2s",
    },
    {
      cx: "50%",
      cy: "88%",
      rx: "25%",
      ry: "12%",
      color:
        variant === "gold" ? "rgba(255,165,0,0.18)" : "rgba(16,185,129,0.13)",
      delay: "0.6s",
    },
    {
      cx: "88%",
      cy: "78%",
      rx: "14%",
      ry: "16%",
      color: "rgba(255,100,200,0.12)",
      delay: "1.8s",
    },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: -1 }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{
          filter: "blur(8px)",
        }}
      >
        {shapes.map((s, i) => (
          <ellipse
            key={i}
            cx={s.cx}
            cy={s.cy}
            rx={s.rx}
            ry={s.ry}
            fill={s.color}
            className={animated ? "awkward-frame__blob" : ""}
            style={
              animated
                ? ({
                    "--blob-delay": s.delay,
                  } as CSSProperties)
                : undefined
            }
          />
        ))}
      </svg>
    </div>
  );
}

type FrontFrameProps = {
  variant: OverlayFrameVariant;
  rank?: number;
  animated: boolean;
};

function FrontFrameLayer({ variant, rank, animated }: FrontFrameProps) {
  const stroke = VARIANT_STROKE[variant];
  const points = FRAME_POINTS[variant];
  const strokeW = variant === "crown" || rank === 1 ? "2.2" : "1.4";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 10 }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad-magazine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="grad-crown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="60%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          <linearGradient id="grad-battle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="grad-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="grad-feature" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="frame-glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <polygon
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
          vectorEffect="non-scaling-stroke"
          filter="url(#frame-glow)"
          className={animated ? "awkward-frame__border" : ""}
        />
        {rank === 1 && (
          <polygon
            points={points}
            fill="none"
            stroke="#FFD700"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
            className={animated ? "awkward-frame__border-pulse" : ""}
            style={{ animationDelay: "0.3s" }}
          />
        )}
      </svg>
    </div>
  );
}

export type AwkwardShapeOverlayFrameProps = {
  variant?: OverlayFrameVariant;
  rank?: number;
  animated?: boolean;
  /** If true, renders the back blob layer (use when the component wraps a card) */
  showBackShapes?: boolean;
  /** Extra classes for the wrapping div */
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  "data-testid"?: string;
};

export default function AwkwardShapeOverlayFrame({
  variant = "magazine",
  rank,
  animated = true,
  showBackShapes = true,
  className = "",
  style,
  children,
  "data-testid": testId,
}: AwkwardShapeOverlayFrameProps) {
  // Auto-upgrade variant for top ranks
  const resolvedVariant: OverlayFrameVariant =
    rank === 1 ? "crown" : rank === 2 || rank === 3 ? "gold" : variant;

  return (
    <div
      className={`awkward-frame relative ${className}`}
      style={style}
      data-testid={testId ?? "awkward-shape-overlay-frame"}
      data-rank={rank}
      data-variant={resolvedVariant}
    >
      {/* Layer 1: Back blob shapes (behind content) */}
      {showBackShapes && (
        <BackShapeLayer variant={resolvedVariant} animated={animated} />
      )}

      {/* Layer 2: Content slot — media/image/card stays here, untouched */}
      <div className="awkward-frame__media relative z-0">{children}</div>

      {/* Layer 3: Front decorative frame border */}
      <FrontFrameLayer variant={resolvedVariant} rank={rank} animated={animated} />

      {/* Rank color accent corners */}
      {rank && RANK_COLORS[rank] && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1 top-1 z-20 h-3 w-3 rounded-full opacity-80"
          style={{ backgroundColor: RANK_COLORS[rank] }}
        />
      )}
    </div>
  );
}
