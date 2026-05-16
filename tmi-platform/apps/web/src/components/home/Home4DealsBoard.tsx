"use client";

import Link from "next/link";

const DEALS = [
  { name: "Weekend Banner Burst", price: "$2,200" },
  { name: "Live Stage Takeover", price: "$3,900" },
  { name: "Magazine Cover Slot", price: "$5,100" },
];

export default function Home4DealsBoard() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#ff2daa", fontWeight: 800 }}>DEALS BOARD</div>
        <Link href="/sponsors/deals" style={{ color: "#fff", textDecoration: "none", fontSize: 10 }}>Open Deals</Link>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {DEALS.map((deal) => (
          <div key={deal.name} style={{ borderRadius: 10, border: "1px solid rgba(255,45,170,0.36)", background: "rgba(255,45,170,0.08)", padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#fff", fontSize: 12 }}>{deal.name}</span>
            <strong style={{ color: "#ffd700", fontSize: 12 }}>{deal.price}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}