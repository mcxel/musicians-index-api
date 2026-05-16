"use client";

import Link from "next/link";

const MARKET_ROWS = [
  { title: "Beat Store", href: "/store/beats", note: "New releases and premium packs" },
  { title: "Ticket Bazaar", href: "/tickets", note: "Live event and venue passes" },
  { title: "Creator Merch", href: "/store/merch", note: "Drops from top performers" },
];

export default function Home2MarketplaceRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ff88", fontWeight: 800, marginBottom: 16 }}>
        MARKETPLACE BELT
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {MARKET_ROWS.map((row) => (
          <Link
            key={row.href}
            href={row.href}
            style={{
              textDecoration: "none",
              color: "white",
              borderRadius: 10,
              border: "1px solid rgba(0,255,136,0.35)",
              background: "rgba(0,255,136,0.08)",
              padding: "12px 14px",
              display: "grid",
              gap: 4,
            }}
          >
            <strong style={{ fontSize: 12 }}>{row.title}</strong>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{row.note}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}