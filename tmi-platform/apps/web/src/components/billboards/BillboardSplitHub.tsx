"use client";

import Link from "next/link";

type Channel = {
  id: string;
  label: string;
  description: string;
  route: string;
  accent: string;
  icon: string;
};

const CHANNELS: Channel[] = [
  { id: "live", label: "Live World", description: "Active rooms, live events, performer feeds", route: "/billboards/live", accent: "#f87171", icon: "🔴" },
  { id: "ranking", label: "Ranking", description: "Artist ranks, track scores, leaderboards", route: "/billboards/ranking", accent: "#f0abfc", icon: "🏆" },
  { id: "sponsor", label: "Sponsor", description: "Sponsor campaigns, ad slots, active deals", route: "/billboards/sponsor", accent: "#86efac", icon: "🤝" },
  { id: "advertiser", label: "Advertiser", description: "Campaign reach, impressions, participation", route: "/billboards/advertiser", accent: "#fcd34d", icon: "📢" },
  { id: "venue", label: "Venue", description: "Venue runtime, seat capacity, screen feeds", route: "/billboards/venue", accent: "#c4b5fd", icon: "🏟" },
  { id: "battle", label: "Game / Battle", description: "Contest winners, cypher results, game boards", route: "/billboards/battle", accent: "#fb923c", icon: "⚔️" },
];

export default function BillboardSplitHub() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 0%, rgba(0,255,255,0.07), transparent 50%), #03020b",
        color: "#e2e8f0",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ color: "#00FFFF", fontSize: 13, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            TMI BILLBOARD NETWORK
          </div>
          <div style={{ color: "#334155", fontSize: 10, letterSpacing: "0.14em", marginTop: 4 }}>
            SELECT A CHANNEL · 6 LIVE FEEDS
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 14,
          }}
        >
          {CHANNELS.map((ch) => (
            <Link
              key={ch.id}
              href={ch.route}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  border: `1px solid ${ch.accent}44`,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${ch.accent}0a, rgba(3,2,11,0.96))`,
                  padding: 20,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{ch.icon}</span>
                  <div>
                    <div style={{ color: ch.accent, fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      {ch.label}
                    </div>
                    <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.08em", marginTop: 2 }}>
                      {ch.route}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", borderRadius: 999, border: `1px solid ${ch.accent}55`, background: `${ch.accent}18`, color: ch.accent, fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px" }}>
                    LIVE
                  </div>
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{ch.description}</div>
              </div>
            </Link>
          ))}
        </div>

        <footer style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid rgba(0,255,255,0.1)", paddingTop: 16 }}>
          <Link href="/billboards" style={{ color: "#334155", fontSize: 9, letterSpacing: "0.1em", textDecoration: "none" }}>
            BILLBOARD HUB
          </Link>
          <span style={{ color: "#1e293b", margin: "0 8px" }}>·</span>
          <Link href="/home/1" style={{ color: "#334155", fontSize: 9, letterSpacing: "0.1em", textDecoration: "none" }}>
            HOME
          </Link>
        </footer>
      </div>
    </main>
  );
}
