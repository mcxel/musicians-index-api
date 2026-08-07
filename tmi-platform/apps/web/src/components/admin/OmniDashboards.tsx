"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

/**
 * LEGACY OmniDashboards — fabricated revenue/viewer tabs removed (Rule 20).
 * Use Overseer Flight Deck + /admin/revenue for real surfaces.
 */
export default function OmniDashboards() {
  return (
    <main style={{ minHeight: "40vh", background: "#050510", color: "#fff", padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>OMNI DASHBOARDS</p>
      <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>Legacy shell retired</h1>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 20, maxWidth: 480, lineHeight: 1.5 }}>
        Demo revenue, viewer, and bot-pulse tiles were removed. Open real admin surfaces instead.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Link href="/admin/overseer" style={linkStyle}>Overseer Deck →</Link>
        <Link href="/admin/revenue" style={linkStyle}>Revenue →</Link>
        <Link href="/admin/runtime-check" style={linkStyle}>Runtime Check →</Link>
        <Link href="/admin/live" style={linkStyle}>Live →</Link>
      </div>
    </main>
  );
}

const linkStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "#00FFFF",
  textDecoration: "none",
  border: "1px solid rgba(0,255,255,0.3)",
  borderRadius: 8,
  padding: "8px 14px",
};
