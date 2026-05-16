"use client";

/**
 * HomepageOverlayA.tsx
 * Layer 5 — Decorative foreground labels.
 * Ranking numerals, battle labels, genre labels, issue labels.
 * Non-interactive (pointer-events: none on parent from MagazinePageShell).
 */

interface OverlayLabel {
  text: string;
  x: string; // CSS left value (e.g. "8%", "920px")
  y: string; // CSS top value
  color?: string;
  fontSize?: number;
  fontFamily?: "headline" | "tech" | "accent" | "body";
  opacity?: number;
  rotate?: number;
}

interface HomepageOverlayAProps {
  labels: OverlayLabel[];
}

const FONT_MAP: Record<NonNullable<OverlayLabel["fontFamily"]>, string> = {
  headline: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
  tech: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
  accent: "var(--font-tmi-anton, 'Anton', Impact, sans-serif)",
  body: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
};

export default function HomepageOverlayA({ labels }: HomepageOverlayAProps) {
  if (!labels || labels.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {labels.map((label, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: label.x,
            top: label.y,
            color: label.color ?? "#ffffff",
            fontSize: label.fontSize ?? 14,
            fontFamily: FONT_MAP[label.fontFamily ?? "headline"],
            fontWeight: 900,
            letterSpacing: "0.08em",
            opacity: label.opacity ?? 0.7,
            textTransform: "uppercase",
            transform: label.rotate ? `rotate(${label.rotate}deg)` : undefined,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {label.text}
        </span>
      ))}
    </div>
  );
}
