"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ArticlePage() {
  const { slug } = useParams();
  const S = {
    page: { minHeight: "100vh", background: "#0D0520", color: "#fff", fontFamily: "Inter,sans-serif" },
    hero: { background: "linear-gradient(to bottom, #150830, #0D0520)", padding: "40px 32px 32px", borderBottom: "1px solid rgba(255,184,0,0.15)" },
    category: { fontFamily: "'Oswald',sans-serif", fontSize: 10, color: "#00E5FF", letterSpacing: 3, marginBottom: 12 },
    title: { fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 42, color: "#fff", letterSpacing: 1, lineHeight: 1.1, marginBottom: 12 },
    content: { maxWidth: 720, margin: "0 auto", padding: "40px 32px" },
    card: { background: "#1E0D3E", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 10, padding: 16, marginBottom: 16 },
    cardTitle: { fontFamily: "'Oswald',sans-serif", fontSize: 10, color: "#FFB800", letterSpacing: 2, marginBottom: 8 },
    adLabel: { fontFamily: "'Oswald',sans-serif", fontSize: 9, color: "#7A5F9A", letterSpacing: 1 },
  };
  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={S.category}>MUSIC NEWS</div>
          <div style={S.title}>{slug}</div>
          <div style={{ fontSize: 12, color: "#7A5F9A", fontFamily: "'Oswald',sans-serif", letterSpacing: 1 }}>
            Published by The Musician&apos;s Index Editorial Team
          </div>
        </div>
      </div>
      <div style={S.content}>
        {/* Ad slot: ART_INLINE_1 — appears here after paragraph 2 when wired */}
        <div style={{ ...S.card, borderColor: "rgba(255,184,0,0.2)" }}>
          <div style={S.adLabel}>ADVERTISEMENT</div>
          <div style={{ color: "#7A5F9A", fontSize: 12 }}>Ad slot ART_INLINE_1 — renders via AdRenderer when wired</div>
        </div>

        <p style={{ color: "#C8A8E8", lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>
          Article body content will load from the database when the editorial API is wired.
        </p>

        {/* Artist station link — auto-included in every artist article */}
        <div style={S.card}>
          <div style={S.cardTitle}>⚡ VISIT THE ARTIST STATION</div>
          <p style={{ color: "#C8A8E8", fontSize: 13, marginBottom: 12 }}>
            Stream live sessions, check the schedule, and support this artist directly.
          </p>
          <Link href={`/stations/${slug?.toString().split("-")[0]}`} style={{ display: "inline-block", padding: "8px 16px", background: "#00E5FF", color: "#0D0520", borderRadius: 6, fontFamily: "'Oswald',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>
            📻 GO TO STATION
          </Link>
          <Link href={`/profile/artist/${slug?.toString().split("-")[0]}`} style={{ display: "inline-block", padding: "8px 16px", border: "1px solid #FFB800", color: "#FFB800", borderRadius: 6, fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1, textDecoration: "none", marginLeft: 8 }}>
            👤 VIEW PROFILE
          </Link>
        </div>

        {/* Sponsor disclosure placeholder */}
        <div style={{ ...S.card, borderStyle: "dashed" }}>
          <div style={S.cardTitle}>SPONSOR SPOTLIGHT</div>
          <div style={{ color: "#7A5F9A", fontSize: 12 }}>Sponsor placement renders here when the ad system is wired.</div>
        </div>
      </div>
    </div>
  );
}
