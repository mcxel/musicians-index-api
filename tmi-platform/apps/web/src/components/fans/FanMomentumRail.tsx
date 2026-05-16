"use client";

import { useMemo } from "react";

type FanMomentumRailProps = {
  fanLabel: string;
  xpTotal: number;
  streak: number;
};

export default function FanMomentumRail({ fanLabel, xpTotal, streak }: FanMomentumRailProps) {
  const badges = useMemo(() => ["OG", "Hype", "Streak"], []);

  return (
    <aside
      style={{
        borderRadius: 16,
        border: "1px solid rgba(236,72,153,0.34)",
        background: "linear-gradient(180deg, rgba(45,13,35,0.94), rgba(20,8,17,0.96))",
        padding: 12,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 900, color: "#f9a8d4", letterSpacing: "0.16em", textTransform: "uppercase" }}>Fan Momentum</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{fanLabel}</div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {badges.map((badge) => (
          <span key={badge} style={{ borderRadius: 999, border: "1px solid rgba(249,168,212,0.35)", background: "rgba(249,168,212,0.12)", color: "#fbcfe8", fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", padding: "3px 8px", textTransform: "uppercase" }}>
            {badge}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
        <MiniMetric label="XP" value={xpTotal.toLocaleString()} />
        <MiniMetric label="Streak" value={`${streak}d`} />
      </div>

      <div style={{ position: "relative", borderRadius: 10, border: "1px solid rgba(249,168,212,0.22)", background: "rgba(249,168,212,0.08)", minHeight: 44, overflow: "hidden" }}>
        {(["👏", "🔥", "🎁", "⚡"] as const).map((icon, idx) => (
          <span
            key={icon}
            style={{
              position: "absolute",
              left: `${10 + idx * 22}%`,
              top: `${8 + (idx % 2) * 14}%`,
              fontSize: 12,
              animation: `fanFloat${idx} 1.9s ease-in-out infinite`,
            }}
          >
            {icon}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes fanFloat0 { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-4px);} }
        @keyframes fanFloat1 { 0%,100% { transform: translateY(-1px);} 50% { transform: translateY(3px);} }
        @keyframes fanFloat2 { 0%,100% { transform: translateY(1px);} 50% { transform: translateY(-3px);} }
        @keyframes fanFloat3 { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(2px);} }
      `}</style>
    </aside>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 9, border: "1px solid rgba(249,168,212,0.22)", background: "rgba(0,0,0,0.24)", padding: "6px 8px" }}>
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: "#fbcfe8", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginTop: 1 }}>{value}</div>
    </div>
  );
}
