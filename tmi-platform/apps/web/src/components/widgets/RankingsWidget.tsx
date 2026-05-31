"use client";

import Link from "next/link";

const CROWN_RANKS = [
  { rank: 1, name: "Nova Cipher",   genre: "EDM",       xp: 48200, isLive: true,  slug: "nova-cipher",  accent: "#FFD700", badge: "👑" },
  { rank: 2, name: "Zion Freq",     genre: "Hip-Hop",   xp: 44810, isLive: true,  slug: "zion-freq",    accent: "#00FFFF", badge: "🥈" },
  { rank: 3, name: "Astra Nova",    genre: "R&B",       xp: 41330, isLive: true,  slug: "astra-nova",   accent: "#FF2DAA", badge: "🥉" },
  { rank: 4, name: "Wave Tek",      genre: "Afrobeats", xp: 38750, isLive: false, slug: "wave-tek",     accent: "#00FF88", badge: "4" },
  { rank: 5, name: "DJ Lumi",       genre: "House",     xp: 35200, isLive: false, slug: "dj-lumi",      accent: "#AA2DFF", badge: "5" },
  { rank: 6, name: "Veron Koi",     genre: "Neo-Soul",  xp: 31900, isLive: true,  slug: "veron-koi",    accent: "#FF6B35", badge: "6" },
  { rank: 7, name: "Pulse Max",     genre: "Trap",      xp: 29400, isLive: false, slug: "pulse-max",    accent: "#00FFFF", badge: "7" },
  { rank: 8, name: "Big Ace",       genre: "Hip-Hop",   xp: 26800, isLive: false, slug: "big-ace",      accent: "#FFD700", badge: "8" },
  { rank: 9, name: "Ray Journey",   genre: "Jazz",      xp: 24100, isLive: false, slug: "ray-journey",  accent: "#FF2DAA", badge: "9" },
  { rank: 10, name: "Flex King",    genre: "Dance",     xp: 21700, isLive: true,  slug: "flex-king",    accent: "#00FF88", badge: "10" },
];

export default function RankingsWidget() {
  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#FFD700", fontWeight: 800 }}>THIS WEEK&apos;S CROWN ORBIT</div>
        <Link href="/rankings" style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textDecoration: "none", fontWeight: 700 }}>
          FULL TABLE →
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {CROWN_RANKS.map((p) => (
          <Link
            key={p.slug}
            href={`/artist/${p.slug}`}
            style={{ textDecoration: "none", color: "#fff" }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 10,
              background: p.rank <= 3 ? `${p.accent}12` : "rgba(255,255,255,0.03)",
              border: `1px solid ${p.rank <= 3 ? p.accent + "33" : "rgba(255,255,255,0.07)"}`,
              transition: "background 120ms",
            }}>
              <div style={{ width: 26, textAlign: "center", fontSize: p.rank <= 3 ? 16 : 10, fontWeight: 900, color: p.accent, flexShrink: 0 }}>
                {p.badge}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                  {p.isLive && (
                    <span style={{ fontSize: 7, fontWeight: 900, color: "#FF2020", letterSpacing: "0.12em", background: "rgba(255,32,32,0.12)", border: "1px solid rgba(255,32,32,0.3)", borderRadius: 3, padding: "1px 5px", flexShrink: 0 }}>
                      LIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{p.genre}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: p.accent }}>{p.xp.toLocaleString()}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>XP</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/rankings" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          FULL RANKINGS
        </Link>
        <Link href="/vote" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, color: "#00FFFF", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          VOTE NOW
        </Link>
      </div>
    </div>
  );
}
