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


export default function AdminDashboard() {
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={S.logo}>THE MUSICIAN'S INDEX</span>
        <span style={{ fontFamily: "'Oswald'", fontSize: 12, color: "#FF2D78", letterSpacing: 2 }}>⚡ ADMIN COMMAND CENTER</span>
      </nav>
      <div style={S.main}>
        <aside style={S.sidebar}>
          <Link href="/admin" style={S.sideLink}>⚡ Command Center</Link>
          <Link href="/admin/users" style={S.sideLink}>👥 Users</Link>
          <Link href="/admin/campaigns" style={S.sideLink}>📢 Campaigns</Link>
          <Link href="/admin/finance/profit" style={S.sideLink}>💰 Owner Finance</Link>
          <Link href="/admin/feature-flags" style={S.sideLink}>🚩 Feature Flags</Link>
          <Link href="/admin/moderation" style={S.sideLink}>🛡 Moderation</Link>
          <Link href="/admin/analytics" style={S.sideLink}>📊 Analytics</Link>
          <Link href="/admin/bots" style={S.sideLink}>🤖 Bots</Link>
          <Link href="/admin/logs" style={S.sideLink}>📋 Logs</Link>
        </aside>
        <main style={S.content}>
          <h1 style={S.h1}>ADMIN DASHBOARD</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div style={S.card}>
              <div style={S.cardTitle}>Active Users</div>
              <div style={S.cardValue}>—</div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Live Rooms</div>
              <div style={S.cardValue}>—</div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Weekly Revenue</div>
              <div style={S.cardValue}>—</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
