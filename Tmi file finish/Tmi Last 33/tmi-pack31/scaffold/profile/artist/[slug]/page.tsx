"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ArtistPublicProfile() {
  const { slug } = useParams();

  const S = {
    page: { minHeight: "100vh", background: "#0D0520", color: "#fff", fontFamily: "Inter,sans-serif" },
    hero: { background: "linear-gradient(to bottom, #2A1452, #0D0520)", padding: "40px 32px 32px" },
    avatar: { width: 80, height: 80, borderRadius: "50%", background: "#3D1E78", border: "2px solid #FFB800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 16 },
    name: { fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 36, color: "#FFB800", letterSpacing: 2 },
    genre: { color: "#00E5FF", fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, marginTop: 4 },
    content: { maxWidth: 900, margin: "0 auto", padding: "0 32px 40px" },
    section: { background: "#1E0D3E", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 12, padding: 20, marginBottom: 16 },
    sectionTitle: { fontFamily: "'Oswald',sans-serif", fontSize: 11, color: "#FFB800", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 },
    link: { display: "inline-block", padding: "8px 16px", background: "#00E5FF", color: "#0D0520", borderRadius: 6, fontFamily: "'Oswald',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textDecoration: "none", marginRight: 8 },
    linkGold: { display: "inline-block", padding: "8px 16px", border: "1px solid #FFB800", color: "#FFB800", borderRadius: 6, fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1, textDecoration: "none", marginRight: 8 },
  };

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={S.avatar}>👤</div>
          <div style={S.name}>{slug}</div>
          <div style={S.genre}>ARTIST — HIP HOP</div>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/stations/${slug}`} style={S.link}>📻 VIEW STATION</Link>
            <Link href={`/articles/${slug}-latest`} style={S.linkGold}>📰 LATEST ARTICLE</Link>
            <Link href={`/lobby`} style={S.linkGold}>🎤 WATCH LIVE</Link>
          </div>
        </div>
      </div>
      <div style={S.content}>
        <div style={S.section}>
          <div style={S.sectionTitle}>About</div>
          <p style={{ color: "#C8A8E8", fontSize: 14, lineHeight: 1.7 }}>
            Artist bio will load here when wired to the profile API.
          </p>
        </div>
        <div style={S.section}>
          <div style={S.sectionTitle}>⚡ Artist Station</div>
          <p style={{ color: "#C8A8E8", fontSize: 13 }}>
            Visit <Link href={`/stations/${slug}`} style={{ color: "#00E5FF" }}>{slug}&apos;s Station</Link> for live shows, schedule, and archive.
          </p>
        </div>
        <div style={S.section}>
          <div style={S.sectionTitle}>Recent Articles</div>
          <p style={{ color: "#7A5F9A", fontSize: 13 }}>No articles yet — content will appear here when wired.</p>
        </div>
        <div style={S.section}>
          <div style={S.sectionTitle}>Latest Clips</div>
          <p style={{ color: "#7A5F9A", fontSize: 13 }}>Clips will appear here when the clip system is wired.</p>
        </div>
        <div style={S.section}>
          <div style={S.sectionTitle}>Sponsors</div>
          <p style={{ color: "#7A5F9A", fontSize: 13 }}>Active sponsor placements will show here.</p>
        </div>
      </div>
    </div>
  );
}
