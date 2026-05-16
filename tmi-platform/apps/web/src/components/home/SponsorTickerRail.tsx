"use client";

import Link from "next/link";

const SPONSOR_ITEMS = ["Neon Audio", "Skyline Apparel", "Pulse Energy", "Orbit Payments", "Luxe Headphones"];

export default function SponsorTickerRail() {
  return (
    <section style={{ borderBottom: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffd700", whiteSpace: "nowrap" }}>
          Sponsor Rail
        </strong>
        <div style={{ overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
          <div style={{ display: "inline-flex", gap: 18 }}>
            {SPONSOR_ITEMS.map((item, i) => (
              <span key={item} style={{ fontSize: 11, color: "rgba(255,255,255,0.86)" }}>
                {item}
                {i < SPONSOR_ITEMS.length - 1 ? "  *" : ""}
              </span>
            ))}
          </div>
        </div>
        <Link href="/sponsors" style={{ color: "#ffffff", fontSize: 10, textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Sponsors
        </Link>
      </div>
    </section>
  );
}