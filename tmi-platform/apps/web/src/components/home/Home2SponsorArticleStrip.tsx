"use client";
import Link from "next/link";

export default function Home2SponsorArticleStrip() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#ffd700", fontWeight: 800, marginBottom: 16 }}>
        SPONSORED READS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <Link href="/articles/sponsor/featured" style={{ textDecoration: "none", color: "white", padding: "18px 16px", borderRadius: 10, background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#ffd700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Brand Spotlight
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>The Future of Audio Hardware</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Presented by Neon Audio</div>
        </Link>
      </div>
    </section>
  );
}