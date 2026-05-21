"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StationPage() {
  const { slug } = useParams();
  const S = {
    page: { minHeight: "100vh", background: "#0D0520", color: "#fff", fontFamily: "Inter,sans-serif" },
    hero: { background: "linear-gradient(135deg, #150830, #2A1452)", padding: "32px", borderBottom: "1px solid rgba(255,184,0,0.3)" },
    logo: { fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 11, color: "#00E5FF", letterSpacing: 3, marginBottom: 8 },
    name: { fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 40, color: "#FFB800", letterSpacing: 2 },
    nav: { display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" as const },
    navLink: { padding: "6px 14px", border: "1px solid rgba(0,229,255,0.4)", color: "#00E5FF", borderRadius: 6, fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1, textDecoration: "none" },
    content: { maxWidth: 960, margin: "0 auto", padding: 32 },
    card: { background: "#1E0D3E", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 12, padding: 20, marginBottom: 16 },
    cardTitle: { fontFamily: "'Oswald',sans-serif", fontSize: 11, color: "#FFB800", letterSpacing: 2, marginBottom: 12 },
  };
  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={S.logo}>📻 STATION</div>
          <div style={S.name}>{String(slug).toUpperCase()}</div>
          <div style={S.nav}>
            <Link href={`/stations/${slug}`} style={S.navLink}>HOME</Link>
            <Link href={`/stations/${slug}/schedule`} style={S.navLink}>SCHEDULE</Link>
            <Link href={`/stations/${slug}/live`} style={S.navLink}>LIVE</Link>
            <Link href={`/stations/${slug}/archive`} style={S.navLink}>ARCHIVE</Link>
            <Link href={`/stations/${slug}/sponsors`} style={S.navLink}>SPONSORS</Link>
            <Link href={`/profile/artist/${slug}`} style={S.navLink}>ARTIST PROFILE</Link>
          </div>
        </div>
      </div>
      <div style={S.content}>
        <div style={S.card}>
          <div style={S.cardTitle}>NOW LIVE</div>
          <p style={{ color: "#7A5F9A", fontSize: 13 }}>No active session — check the schedule or join the lobby.</p>
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>UPCOMING SHOWS</div>
          <p style={{ color: "#7A5F9A", fontSize: 13 }}>Schedule will show here when wired.</p>
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>SPONSOR BOARD</div>
          <p style={{ color: "#7A5F9A", fontSize: 13 }}>Active sponsors will display here.</p>
        </div>
      </div>
    </div>
  );
}
