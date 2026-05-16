"use client";

/**
 * ConfettiMotionLayer
 *
 * Floating confetti particles — always pointer-events:none.
 * Used as the motion layer above media/card content.
 */

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

const CONFETTI_COLORS = [
  "#22d3ee", // cyan
  "#a855f7", // purple
  "#f97316", // orange
  "#FFD700", // gold
  "#ec4899", // pink
  "#10b981", // emerald
  "#f43f5e", // rose
  "#60a5fa", // blue
];

const SHAPES = ["square", "circle", "star", "triangle", "ribbon"] as const;
type ConfettiShape = (typeof SHAPES)[number];

type Particle = {
  id: number;
  x: number;       // % from left
  size: number;    // px
  color: string;
  shape: ConfettiShape;
  duration: number; // ms
  delay: number;    // ms
  rotation: number; // deg initial
  drift: number;    // px horizontal drift
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(2, 98),
    size: randomBetween(5, 11),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    duration: randomBetween(2200, 4800),
    delay: randomBetween(0, 2000),
    rotation: randomBetween(0, 360),
    drift: randomBetween(-30, 30),
  }));
}

function StarSvg({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <polygon
        points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"
        fill={color}
      />
    </svg>
  );
}

function TriangleSvg({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <polygon points="12,2 22,22 2,22" fill={color} />
    </svg>
  );
}

function ParticleEl({ p }: { p: Particle }) {
  const style: CSSProperties = {
    position: "absolute",
    left: `${p.x}%`,
    top: "-12px",
    width: p.size,
    height: p.shape === "ribbon" ? p.size * 2.5 : p.size,
    backgroundColor:
      p.shape === "square" || p.shape === "ribbon" ? p.color : "transparent",
    borderRadius: p.shape === "circle" ? "50%" : p.shape === "ribbon" ? "2px" : "0",
    transform: `rotate(${p.rotation}deg)`,
    animation: `confetti-fall ${p.duration}ms ease-in ${p.delay}ms infinite`,
    // @ts-expect-error CSS custom property
    "--drift": `${p.drift}px`,
    pointerEvents: "none",
  };

  if (p.shape === "star") {
    return (
      <span style={style}>
        <StarSvg color={p.color} size={p.size} />
      </span>
    );
  }
  if (p.shape === "triangle") {
    return (
      <span style={style}>
        <TriangleSvg color={p.color} size={p.size} />
      </span>
    );
  }
  return <span style={style} />;
}

export type ConfettiMotionLayerProps = {
  count?: number;
  active?: boolean;
  /** z-index above content but below interactive elements */
  zIndex?: number;
  className?: string;
  "data-testid"?: string;
};

export default function ConfettiMotionLayer({
  count = 28,
  active = true,
  zIndex = 15,
  className = "",
  "data-testid": testId,
}: ConfettiMotionLayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => buildParticles(count), [count]);

  if (!mounted || !active) return null;

  return (
    <div
      aria-hidden
      className={`confetti-motion-layer pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex }}
      data-testid={testId ?? "confetti-motion-layer"}
    >
      {particles.map((p) => (
        <ParticleEl key={p.id} p={p} />
      ))}
    </div>
  );
}
