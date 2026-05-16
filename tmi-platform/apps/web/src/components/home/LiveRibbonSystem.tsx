"use client";

/**
 * LiveRibbonSystem.tsx
 * Layer 6 — Rotating top-bar status strip.
 * Cycles live statuses every 4 seconds.
 * Statuses: Voting Open, Winner Reveal Soon, Monday Night Qualifier, Cypher Open, etc.
 */

import { useState, useEffect } from "react";

const RIBBON_STATUSES = [
  { text: "Voting closes in 8:22", color: "#FF2DAA", pulse: true },
  { text: "Rank swap incoming — #3 rising", color: "#FFD700", pulse: true },
  { text: "Winner reveal soon", color: "#00FFFF", pulse: false },
  { text: "Monday Night Stage qualifier active", color: "#AA2DFF", pulse: true },
  { text: "Cypher open — Hip Hop room live", color: "#00FF88", pulse: false },
  { text: "Battle active — 3 rooms filling now", color: "#FF6B35", pulse: true },
  { text: "Crown update in progress", color: "#FFD700", pulse: true },
  { text: "New #1 contender detected", color: "#FF2DAA", pulse: true },
];

export default function LiveRibbonSystem({ accent = "#FF2DAA" }: { accent?: string }) {
  const [statusIdx, setStatusIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStatusIdx((i) => (i + 1) % RIBBON_STATUSES.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const status = RIBBON_STATUSES[statusIdx]!;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        background: `linear-gradient(90deg, ${accent}18, rgba(5,5,16,0.9), ${accent}18)`,
        borderBottom: `1px solid ${accent}33`,
        borderTop: `1px solid ${accent}22`,
        overflow: "hidden",
      }}
    >
      {/* Live dot */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#FF0040",
          boxShadow: "0 0 8px #FF004080",
          flexShrink: 0,
        }}
      />
      {/* LIVE label */}
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.14em",
          color: "#FF0040",
          flexShrink: 0,
        }}
      >
        LIVE
      </span>
      <span style={{ fontSize: 9, opacity: 0.4, flexShrink: 0 }}>—</span>

      {/* Rotating status */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: status.color,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
        }}
      >
        {status.text}
      </span>

      {/* Spacer + secondary badge */}
      <span
        style={{
          marginLeft: "auto",
          fontSize: 8,
          fontWeight: 800,
          color: accent,
          letterSpacing: "0.1em",
          flexShrink: 0,
          opacity: 0.8,
        }}
      >
        ● CROWN ENGINE ACTIVE
      </span>
    </div>
  );
}
