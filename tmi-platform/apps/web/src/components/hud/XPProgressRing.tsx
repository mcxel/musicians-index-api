"use client";
/**
 * XPProgressRing — compact circular XP progress indicator for the global HUD
 *
 * Shows: tier emoji · progress ring · tier color glow
 * Click → /avatar-center
 *
 * Fetches from /api/tokens/balance?userId=current-user
 * Re-fetches every 60s
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { TIER_CONFIG } from "@/lib/avatar/AvatarEvolutionEngine";
import type { EvolutionTier } from "@/lib/avatar/HeroRegistry";

interface XPData {
  tier:    EvolutionTier;
  percent: number;
  totalXp: number;
}

export default function XPProgressRing({ size = 36, userId = "current-user", role }: { size?: number; userId?: string; role?: string }) {
  const [data, setData] = useState<XPData>({ tier: "Rookie", percent: 0, totalXp: 0 });

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      try {
        const res = await fetch(`/api/tokens/balance?userId=${userId}`);
        const d = await res.json();
        if (!cancelled) setData({ tier: d.tier ?? "Rookie", percent: d.percent ?? 0, totalXp: d.totalXp ?? 0 });
      } catch { /* silent */ }
    }
    fetch_();
    const id = setInterval(fetch_, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [userId]);

  const cfg = TIER_CONFIG[data.tier];
  const r = (size / 2) - 3;
  const circumference = 2 * Math.PI * r;
  const dash = (data.percent / 100) * circumference;

  // Avatar & Inventory is Fan-only (CLAUDE.md Rule 26 Identity Policy,
  // 2026-07-18) — non-Fan roles go to /rankings instead of /avatar-center.
  const destination = role === "FAN" ? "/avatar-center" : "/rankings";

  return (
    <Link href={destination} title={`${data.tier} · ${data.totalXp.toLocaleString()} XP`} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* SVG ring */}
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={cfg.color}
          strokeWidth={2.5}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease", filter: `drop-shadow(0 0 3px ${cfg.color}88)` }}
        />
      </svg>
      {/* Center emoji */}
      <span style={{ fontSize: size * 0.42, lineHeight: 1, position: "relative", zIndex: 2 }}>{cfg.emoji}</span>
    </Link>
  );
}
