"use client";

import Link from "next/link";

export default function Home4CampaignBuilderRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, background: "rgba(0,255,255,0.08)", padding: "12px 14px", display: "grid", gap: 8 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ffff", fontWeight: 800 }}>CAMPAIGN BUILDER RAIL</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.86)", maxWidth: 760 }}>
          Build sponsor campaigns by audience, genre, and venue placement in one rail-driven workflow.
        </div>
        <Link href="/sponsors/campaigns" style={{ textDecoration: "none", color: "#050510", background: "#00ffff", width: "fit-content", padding: "6px 10px", borderRadius: 8, fontWeight: 800, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Open Builder
        </Link>
      </div>
    </section>
  );
}