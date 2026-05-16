"use client";

/**
 * HomepageOverlayC.tsx
 * Layer 7 — Editable floating text overlay.
 * "This Week", "Voting Live", "Crown Updating", "Weekly Cypher".
 * Non-interactive. Fully prop-driven — NOT baked into art.
 */

import { useEffect, useState } from "react";

interface FloatingText {
  text: string;
  x: string; // CSS left
  y: string; // CSS top
  color?: string;
  fontSize?: number;
  pulse?: boolean; // animate opacity
  badge?: boolean; // render as badge (pill background)
}

interface HomepageOverlayCProps {
  items: FloatingText[];
}

export default function HomepageOverlayC({ items }: HomepageOverlayCProps) {
  const [bright, setBright] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBright((b) => !b), 1800);
    return () => clearInterval(interval);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {items.map((item, i) => {
        const color = item.color ?? "#00FFFF";
        const isPulse = item.pulse ?? false;
        const isBadge = item.badge ?? false;

        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: item.x,
              top: item.y,
              color,
              fontSize: item.fontSize ?? 11,
              fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: isPulse ? (bright ? 0.85 : 0.4) : 0.72,
              transition: "opacity 0.8s ease-in-out",
              whiteSpace: "nowrap",
              userSelect: "none",
              ...(isBadge
                ? {
                    background: `${color}22`,
                    border: `1px solid ${color}55`,
                    borderRadius: 999,
                    padding: "3px 10px",
                    backdropFilter: "blur(4px)",
                  }
                : {}),
            }}
          >
            {isPulse && (
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color,
                  marginRight: 6,
                  verticalAlign: "middle",
                  opacity: bright ? 1 : 0.3,
                  transition: "opacity 0.8s ease-in-out",
                }}
              />
            )}
            {item.text}
          </span>
        );
      })}
    </div>
  );
}
