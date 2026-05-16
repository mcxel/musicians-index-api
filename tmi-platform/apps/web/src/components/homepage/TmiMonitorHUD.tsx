"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StatPulse {
  label: string;
  value: string;
  color: string;
  href?: string;
  live?: boolean;
}

interface TmiMonitorHUDProps {
  compact?: boolean;
  position?: "top" | "side" | "inline";
}

const BASE_STATS: StatPulse[] = [
  { label: "LIVE ROOMS", value: "24", color: "#FF2DAA", href: "/live", live: true },
  { label: "WATCHING NOW", value: "41.2K", color: "#00FFFF", href: "/live", live: true },
  { label: "BATTLES ACTIVE", value: "8", color: "#FFD700", href: "/battles", live: true },
  { label: "CYPHERS OPEN", value: "16", color: "#AA2DFF", href: "/cypher", live: true },
  { label: "BEATS IN VAULT", value: "2,840", color: "#00FF88", href: "/beats/marketplace" },
  { label: "TMI REVENUE", value: "$47.2K", color: "#FF2DAA", href: "/admin/commerce" },
];

function randomFlicker(base: string): string {
  const num = parseFloat(base.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return base;
  const prefix = base.match(/[^0-9.]*/)?.[0] ?? "";
  const suffix = base.match(/[^0-9.]*$/)?.[0] ?? "";
  const delta = num * (0.002 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1);
  const newVal = (num + delta).toFixed(base.includes(".") ? 1 : 0);
  return `${prefix}${parseFloat(newVal).toLocaleString()}${suffix}`;
}

export default function TmiMonitorHUD({ compact = false, position = "inline" }: TmiMonitorHUDProps) {
  const [stats, setStats] = useState(BASE_STATS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(s => s.live ? { ...s, value: randomFlicker(s.value) } : s));
      setTick(t => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {stats.slice(0, 4).map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {s.live && <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}`, animation: "pulse 1.5s ease-in-out infinite" }} />}
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em" }}>{s.label}</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(0,0,0,0.6)",
      border: "1px solid rgba(0,255,255,0.15)",
      borderRadius: 10,
      padding: "12px 16px",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ fontSize: 8, color: "#00FFFF", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 10 }}>
        TMI LIVE MONITOR <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>TICK {tick}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)", gap: 10 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href ?? "#"} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "8px 10px",
              background: `${s.color}08`,
              border: `1px solid ${s.color}20`,
              borderRadius: 8,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                {s.live && (
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}`, animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.12em" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.value}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
