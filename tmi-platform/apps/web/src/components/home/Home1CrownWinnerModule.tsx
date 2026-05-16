"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getWinnerEntityRuntime } from "@/lib/home/WinnerEntityRuntime";

export default function Home1CrownWinnerModule() {
  const winner = useMemo(() => getWinnerEntityRuntime(), []);

  if (!winner) return null;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 18px" }}>
      <div
        style={{
          borderRadius: 14,
          border: "1px solid rgba(255,215,0,0.5)",
          background: "radial-gradient(circle at 20% 0%, rgba(255,215,0,0.24), transparent 52%), linear-gradient(165deg, rgba(32,20,2,0.95), rgba(8,6,20,0.94))",
          padding: "18px 18px",
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: "0.24em", fontWeight: 800, textTransform: "uppercase" }}>Crown Winner</div>
        <div style={{ fontSize: "clamp(20px, 3.8vw, 38px)", fontWeight: 900, color: "#ffffff" }}>{winner.name}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.84)", maxWidth: 720 }}>
          {winner.summary}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#ffd700", letterSpacing: "0.14em", fontWeight: 800 }}>{winner.badgeLabel}</span>
          <Link href="/rankings/crown" style={{ textDecoration: "none", color: "#050510", background: "#ffd700", fontWeight: 900, fontSize: 10, letterSpacing: "0.1em", padding: "7px 12px", borderRadius: 8, textTransform: "uppercase" }}>
            Open Crown Rankings
          </Link>
          <Link href={winner.route} style={{ textDecoration: "none", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.35)", fontWeight: 900, fontSize: 10, letterSpacing: "0.1em", padding: "7px 12px", borderRadius: 8, textTransform: "uppercase" }}>
            Artist Profile
          </Link>
        </div>
      </div>
    </section>
  );
}