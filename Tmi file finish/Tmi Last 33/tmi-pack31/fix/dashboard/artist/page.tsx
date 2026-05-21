"use client";
import Link from "next/link";


const S = {
  page: { minHeight: "100vh", background: "#0D0520", color: "#fff", fontFamily: "'Inter', sans-serif" },
  nav: { background: "#150830", borderBottom: "1px solid rgba(255,184,0,0.3)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 20, color: "#FFB800", letterSpacing: 2 },
  main: { display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "calc(100vh - 49px)" },
  sidebar: { background: "#150830", borderRight: "1px solid rgba(0,229,255,0.15)", padding: "24px 16px" },
  content: { padding: 32 },
  sideLink: { display: "block", padding: "10px 12px", color: "#C8A8E8", textDecoration: "none", borderRadius: 8, marginBottom: 4, fontSize: 14, fontFamily: "'Oswald', sans-serif", letterSpacing: 1 },
  card: { background: "#1E0D3E", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 12, padding: 20, marginBottom: 16 },
  cardTitle: { fontFamily: "'Oswald', sans-serif", fontSize: 13, color: "#FFB800", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" as const },
  cardValue: { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, color: "#00E5FF" },
  h1: { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, color: "#FFB800", letterSpacing: 2, marginBottom: 24 },
  coachingNote: { background: "#2A1452", border: "1px solid #FF2D78", borderRadius: 8, padding: "12px 16px", marginBottom: 12, fontSize: 13, color: "#C8A8E8" },
};


export default function ArtistDashboard() {
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={S.logo}>THE MUSICIAN'S INDEX</span>
        <span style={{ fontFamily: "'Oswald'", fontSize: 12, color: "#00E5FF", letterSpacing: 2 }}>ARTIST DASHBOARD</span>
      </nav>
      <div style={S.main}>
        <aside style={S.sidebar}>
          <Link href="/dashboard/artist" style={S.sideLink}>⚡ Overview</Link>
          <Link href="/profile/create/artist" style={S.sideLink}>👤 My Profile</Link>
          <Link href="/stations/create" style={S.sideLink}>📻 My Station</Link>
          <Link href="/dashboard/artist/earnings" style={S.sideLink}>💰 Earnings</Link>
          <Link href="/dashboard/artist/sponsor-tasks" style={S.sideLink}>🤝 Sponsor Tasks</Link>
          <Link href="/dashboard/artist/analytics" style={S.sideLink}>📊 Analytics</Link>
          <Link href="/live/stage" style={S.sideLink}>🎤 Go Live</Link>
          <Link href="/dashboard/artist/media" style={S.sideLink}>🎬 Media</Link>
          <Link href="/settings" style={S.sideLink}>⚙️ Settings</Link>
        </aside>
        <main style={S.content}>
          <h1 style={S.h1}>ARTIST DASHBOARD</h1>

          {/* Coaching Sticky Notes */}
          <div style={S.coachingNote}>
            ⚡ <strong style={{ color: "#FF2D78" }}>Sponsor Task:</strong> Thank your sponsor this week to improve renewal chances.
          </div>
          <div style={S.coachingNote}>
            ⚡ <strong style={{ color: "#FF2D78" }}>Tip:</strong> Promote your sponsor's product in your next post to unlock more local visibility.
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <div style={S.card}>
              <div style={S.cardTitle}>This Week</div>
              <div style={S.cardValue}>$0.00</div>
              <div style={{ fontSize: 11, color: "#7A5F9A", marginTop: 4 }}>Pending earnings</div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Stream & Win</div>
              <div style={S.cardValue}>50 pts</div>
              <div style={{ fontSize: 11, color: "#7A5F9A", marginTop: 4 }}>This week</div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Crown Rank</div>
              <div style={S.cardValue}>#—</div>
              <div style={{ fontSize: 11, color: "#7A5F9A", marginTop: 4 }}>Enter a cypher to rank</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Link href="/profile/create/artist" style={{ ...S.card, textDecoration: "none", cursor: "pointer" }}>
              <div style={S.cardTitle}>Set Up Profile →</div>
              <div style={{ color: "#C8A8E8", fontSize: 13 }}>Create your public artist profile</div>
            </Link>
            <Link href="/stations/create" style={{ ...S.card, textDecoration: "none", cursor: "pointer" }}>
              <div style={S.cardTitle}>Launch Station →</div>
              <div style={{ color: "#C8A8E8", fontSize: 13 }}>Start your artist station</div>
            </Link>
            <Link href="/live/stage" style={{ ...S.card, textDecoration: "none", cursor: "pointer" }}>
              <div style={S.cardTitle}>Go Live →</div>
              <div style={{ color: "#C8A8E8", fontSize: 13 }}>Start a live room or cypher</div>
            </Link>
            <Link href="/contest" style={{ ...S.card, textDecoration: "none", cursor: "pointer" }}>
              <div style={S.cardTitle}>Enter Contest →</div>
              <div style={{ color: "#C8A8E8", fontSize: 13 }}>Compete for the crown</div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
