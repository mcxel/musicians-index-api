// apps/web/src/components/tmi-design/TMICrownBadge.tsx
"use client";
import { useEffect, useState } from "react";

interface Props { artistName: string; rank?: number; size?: "sm" | "md" | "lg"; }

export function TMICrownBadge({ artistName, rank = 1, size = "md" }: Props) {
  const [glow, setGlow] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setGlow(g => !g), 1200);
    return () => clearInterval(t);
  }, []);

  const sz = { sm: { crown: 16, name: 11 }, md: { crown: 22, name: 14 }, lg: { crown: 32, name: 18 } }[size];

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.5)", borderRadius: 99, padding: "4px 14px", boxShadow: glow ? "0 0 14px rgba(255,184,0,0.4)" : "none", transition: "box-shadow 0.6s" }}>
      <span style={{ fontSize: sz.crown }}>👑</span>
      <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: sz.name, color: "#FFB800", letterSpacing: 1 }}>#{rank} {artistName}</span>
    </div>
  );
}
