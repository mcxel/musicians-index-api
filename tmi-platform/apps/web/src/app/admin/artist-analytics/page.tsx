import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Artist Analytics | TMI Admin" };

const ARTISTS = [
  { name: "Wavetek",     fans: 42800, revenue: 38200, streams: 2100000, growth: "+24%", color: "#FF2DAA", tier: "GOLD" },
  { name: "Zuri Bloom",  fans: 31400, revenue: 22700, streams: 1400000, growth: "+31%", color: "#00FF88", tier: "GOLD" },
  { name: "Krypt",       fans: 28900, revenue: 29100, streams: 980000,  growth: "+18%", color: "#AA2DFF", tier: "GOLD" },
  { name: "Neon Vibe",   fans: 24600, revenue: 18400, streams: 740000,  growth: "+12%", color: "#00FFFF", tier: "SILVER" },
  { name: "Lyric Stone", fans: 19200, revenue: 14800, streams: 620000,  growth: "+28%", color: "#FFD700", tier: "SILVER" },
];

export default function AdminArtistAnalyticsPage() {
  const totalRevenue = ARTISTS.reduce((a, r) => a + r.revenue, 0);
  const totalFans = ARTISTS.reduce((a, r) => a + r.fans, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Artist Analytics</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Revenue, fan growth, streaming, and subscription outcomes by artist.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Active Artists",  value: String(ARTISTS.length),      color: "#00FFFF" },
            { label: "Total Fans",      value: totalFans.toLocaleString(),   color: "#FF2DAA" },
            { label: "Platform Revenue",value: `$${(totalRevenue/1000).toFixed(0)}K`, color: "#FFD700" },
            { label: "Avg Growth",      value: "+22%",                       color: "#00FF88" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 16 }}>TOP ARTISTS BY REVENUE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ARTISTS.map((artist, i) => (
            <div key={artist.name} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${artist.color}14`, borderRadius: 12, padding: "16px 20px", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 24 }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{artist.name}</div>
                <div style={{ fontSize: 9, color: artist.color, fontWeight: 700, letterSpacing: "0.1em", marginTop: 2 }}>{artist.tier}</div>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{artist.fans.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>FANS</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>${(artist.revenue/1000).toFixed(0)}K</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>REVENUE</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#00FF88" }}>{artist.growth}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>GROWTH</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
