"use client";

import Link from "next/link";

export default function Home5PrizeVaultRail() {
  return (
    <section style={{ border: "1px solid rgba(255,215,0,0.55)", borderRadius: 10, padding: "12px 14px", background: "rgba(255,215,0,0.18)" }}>
      <h3 style={{ margin: 0, fontSize: 14, color: "#ffd700", marginBottom: 6 }}>Prize Vault</h3>
      <Link href="/prizes" style={{ color: "#fff", textDecoration: "none", fontSize: 11, fontWeight: 700 }}>Open Prize Vault</Link>
    </section>
  );
}