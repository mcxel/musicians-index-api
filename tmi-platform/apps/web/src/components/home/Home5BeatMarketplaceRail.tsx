"use client";

import Link from "next/link";

export default function Home5BeatMarketplaceRail() {
  return (
    <section style={{ border: "1px solid rgba(0,255,255,0.55)", borderRadius: 10, padding: "12px 14px", background: "rgba(0,255,255,0.18)" }}>
      <h3 style={{ margin: 0, fontSize: 14, color: "#00ffff", marginBottom: 6 }}>Beat Marketplace Rail</h3>
      <Link href="/beats" style={{ color: "#fff", textDecoration: "none", fontSize: 11, fontWeight: 700 }}>Open Beat Marketplace</Link>
    </section>
  );
}