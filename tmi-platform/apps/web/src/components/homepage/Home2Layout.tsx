"use client";

import Link from "next/link";
import BillboardBoard from "./BillboardBoard";
import type { BillboardSlot } from "./BillboardBoard";

const TOP10_ARTISTS = [
  { rank: 1, name: "Wavetek", genre: "Trap", points: 14200, trend: "+12%", crown: true, href: "/artist/wavetek", color: "#FFD700" },
  { rank: 2, name: "FlowMaster", genre: "Hip-Hop", points: 11800, trend: "+8%", crown: false, href: "/artist/flowmaster", color: "#00FFFF" },
  { rank: 3, name: "Krypt", genre: "Drill", points: 9400, trend: "+15%", crown: false, href: "/artist/krypt", color: "#FF2DAA" },
  { rank: 4, name: "Neon Vibe", genre: "R&B", points: 8200, trend: "+3%", crown: false, href: "/artist/neon-vibe", color: "#AA2DFF" },
  { rank: 5, name: "Zuri", genre: "Afrobeats", points: 7100, trend: "+22%", crown: false, href: "/artist/zuri", color: "#00FF88" },
  { rank: 6, name: "DD4 Crew", genre: "Comedy", points: 5900, trend: "+18%", crown: false, href: "/artist/dd4", color: "#FF2DAA" },
  { rank: 7, name: "TMI Art", genre: "Visual", points: 4800, trend: "+5%", crown: false, href: "/artist/tmi-art", color: "#00FFFF" },
  { rank: 8, name: "Bass Head", genre: "Electronic", points: 3900, trend: "-2%", crown: false, href: "/artist/bass-head", color: "#FFD700" },
  { rank: 9, name: "Lyric Pro", genre: "Spoken Word", points: 3200, trend: "+9%", crown: false, href: "/artist/lyric-pro", color: "#00FF88" },
  { rank: 10, name: "Neon MC", genre: "Battle", points: 2800, trend: "+11%", crown: false, href: "/artist/neon-mc", color: "#AA2DFF" },
];

const GENRE_LADDER = [
  { genre: "Trap", active: 128, trend: "↑", color: "#FF2DAA" },
  { genre: "Hip-Hop", active: 104, trend: "↑", color: "#00FFFF" },
  { genre: "Drill", active: 88, trend: "↑", color: "#FFD700" },
  { genre: "R&B", active: 71, trend: "→", color: "#AA2DFF" },
  { genre: "Afrobeats", active: 58, trend: "↑", color: "#00FF88" },
  { genre: "Electronic", active: 42, trend: "→", color: "#00FFFF" },
  { genre: "Latin Trap", active: 38, trend: "↑", color: "#FF2DAA" },
  { genre: "Comedy", active: 29, trend: "↑", color: "#FFD700" },
];

const CHART_SLOTS: BillboardSlot[] = [
  { id: "cs1", label: "Midnight Bars", sublabel: "Wavetek · 3 days old", stat: "1.8K plays", badge: "#1 BEAT", href: "/beats/midnight-bars", color: "#FFD700", rank: 1 },
  { id: "cs2", label: "808 Dreams", sublabel: "Krypt · 6 days old", stat: "1.2K plays", badge: "#2 BEAT", href: "/beats/808-dreams", color: "#FF2DAA", rank: 2 },
  { id: "cs3", label: "The Code", sublabel: "FlowMaster · 8 days old", stat: "921 plays", badge: "#3 BEAT", href: "/beats/the-code", color: "#00FFFF", rank: 3 },
];

export default function Home2Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 20px 32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 8, color: "#FFD700", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 4 }}>HOME 2 · CHARTS & RANKINGS</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Top Artists This Week</h2>
      </div>

      {/* Top 10 + Genre Ladder */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16 }}>
        {/* Top 10 List */}
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 10 }}>TOP 10 ARTISTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TOP10_ARTISTS.map(a => (
              <Link key={a.rank} href={a.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px",
                  background: a.rank <= 3 ? `${a.color}08` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${a.rank <= 3 ? `${a.color}30` : "rgba(255,255,255,0.05)"}`,
                  borderRadius: 8,
                  transition: "all 0.2s",
                }}>
                  <div style={{ width: 28, textAlign: "center" }}>
                    {a.crown ? <span style={{ fontSize: 16 }}>👑</span> : <span style={{ fontSize: 13, fontWeight: 900, color: a.rank <= 3 ? a.color : "rgba(255,255,255,0.3)" }}>#{a.rank}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{a.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{a.genre}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: a.color }}>{a.points.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: a.trend.startsWith("+") ? "#00FF88" : a.trend === "→" ? "#FFD700" : "#FF2DAA" }}>{a.trend}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 10, textAlign: "center" }}>
            <Link href="/leaderboard" style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, textDecoration: "none", letterSpacing: "0.12em" }}>VIEW FULL LEADERBOARD →</Link>
          </div>
        </div>

        {/* Genre Ladder + Charts Belt */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 10 }}>GENRE LADDER</div>
            {GENRE_LADDER.map(g => (
              <Link key={g.genre} href={`/cypher?genre=${encodeURIComponent(g.genre)}`} style={{ textDecoration: "none" }}>
                <div style={{ marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{g.genre}</span>
                    <span style={{ fontSize: 9, color: g.trend === "↑" ? "#00FF88" : "#FFD700" }}>{g.trend} {g.active}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(g.active / 130) * 100}%`, background: g.color, borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <BillboardBoard slots={CHART_SLOTS} title="CHARTS BELT" variant="vertical" accentColor="#FFD700" />
        </div>
      </div>
    </div>
  );
}
