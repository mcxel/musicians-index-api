"use client";

import Link from "next/link";

const PRODUCTS = ["Stage Lights Kit", "Wireless Mic Pack", "Creator Hoodie", "DJ Utility Bag"];

export default function Home4ProductCarouselRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ff88", fontWeight: 800 }}>PRODUCT CAROUSEL RAIL</div>
        <Link href="/store" style={{ color: "#fff", textDecoration: "none", fontSize: 10 }}>All Products</Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
        {PRODUCTS.map((item) => (
          <div key={item} style={{ border: "1px solid rgba(0,255,136,0.35)", borderRadius: 10, background: "rgba(0,255,136,0.08)", padding: "12px 10px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}