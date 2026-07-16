"use client";

import Link from "next/link";

const LIVE_ROOMS = [
  { id: "monthly-idol",    title: "Monthly Idol",      genre: "All Genres", accent: "#FFD700", glyph: "🏟️",  href: "/live/rooms/monthly-idol"    },
  { id: "cypher-arena",    title: "Cypher East",       genre: "Hip-Hop",    accent: "#00FFFF", glyph: "🎤",  href: "/live/rooms/cypher-arena"    },
  { id: "deal-or-feud",    title: "Deal or Feud",      genre: "Game Show",  accent: "#FF2DAA", glyph: "🎰",  href: "/live/rooms/deal-or-feud"    },
  { id: "venue-room",      title: "Producer Lab",      genre: "Beats",      accent: "#AA2DFF", glyph: "🎛️",  href: "/live/rooms/venue-room"      },
  { id: "world-concert",   title: "World Concert",     genre: "Live Music", accent: "#00FF88", glyph: "🎸",  href: "/rooms/world-concert"        },
  { id: "monday-night",    title: "Monday Night Stage",genre: "Hip-Hop",    accent: "#FF6B35", glyph: "🎙️",  href: "/shows/monday-night-stage"   },
];

export default function LiveRoomsWidget() {
  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2020", display: "inline-block", animation: "tmiBlink 1.1s step-end infinite" }} />
          <span style={{ fontSize: 9, letterSpacing: "0.22em", color: "#00FF88", fontWeight: 800 }}>LIVE ROOMS NOW</span>
        </div>
        <Link href="/live/rooms" style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textDecoration: "none", fontWeight: 700 }}>
          ALL ROOMS →
        </Link>
      </div>

      <style>{`@keyframes tmiBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LIVE_ROOMS.map((room) => (
          <Link key={room.id} href={room.href} style={{ textDecoration: "none", color: "#fff" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", borderRadius: 12,
              background: `${room.accent}0A`,
              border: `1px solid ${room.accent}30`,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{room.glyph}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{room.genre} · Viewer data unavailable</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: room.accent, letterSpacing: "0.06em", textTransform: "uppercase" }}>Room available</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/live/rooms" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, color: "#00FF88", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          BROWSE ALL
        </Link>
        <Link href="/rooms/world-concert" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          WORLD CONCERT →
        </Link>
      </div>
    </div>
  );
}
