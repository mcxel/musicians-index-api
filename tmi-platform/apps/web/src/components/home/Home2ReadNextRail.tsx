"use client";
import Link from "next/link";

export default function Home2ReadNextRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00ffff", fontWeight: 800, marginBottom: 16 }}>
        READ NEXT
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Link href="/articles" style={{ textDecoration: "none", color: "white", padding: "16px 14px", borderRadius: 10, background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.2)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Underground Kings: The Cypher Doc</div>
          <div style={{ fontSize: 10, color: "#00ffff", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Read Article →</div>
        </Link>
      </div>
    </section>
  );
}