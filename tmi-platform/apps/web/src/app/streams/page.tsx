"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const BG = "#050510";

const LIVE_STREAMS = [
  { id: "s1", title: "Monday Night Stage — Season 2 Live",  host: "Nova Cipher",   genre: "Hip-Hop",  viewers: 1847, status: "live",    thumb: "🎤", color: "#FF2DAA",  href: "/rooms/monday-stage"    },
  { id: "s2", title: "Beat Production Session — Krypt",     host: "Krypt",         genre: "Trap",     viewers: 642,  status: "live",    thumb: "🎛️", color: "#AA2DFF",  href: "/rooms/studio"          },
  { id: "s3", title: "Dirty Dozens — S1 E4 Cypher",        host: "TMI Events",    genre: "Battle",   viewers: 3210, status: "live",    thumb: "⚔️", color: "#00FFFF",  href: "/rooms/cypher"          },
  { id: "s4", title: "World Premiere — Ari Volt",          host: "Ari Volt",      genre: "R&B",      viewers: 980,  status: "live",    thumb: "🌐", color: "#FFD700",  href: "/rooms/world-premiere"  },
  { id: "s5", title: "VIP Listening Party — FlowState.J",  host: "FlowState.J",   genre: "Neo-Soul", viewers: 212,  status: "live",    thumb: "🎧", color: "#00FF88",  href: "/rooms/vip-lounge"      },
  { id: "s6", title: "Name That Tune — Fan Night",         host: "TMI Games",     genre: "Game Show",viewers: 504,  status: "live",    thumb: "🎵", color: "#FF6B35",  href: "/shows/name-that-tune"  },
];

const UPCOMING_STREAMS = [
  { id: "u1", title: "Battle Night IV — World Concert",   host: "Bar God vs Wave Tek", genre: "Battle",   when: "Tonight · 9:00 PM ET",   color: "#FF2DAA", href: "/rooms/world-concert" },
  { id: "u2", title: "Monthly Idol — Elimination Round",  host: "TMI Host",            genre: "Show",     when: "Tomorrow · 8:00 PM ET",  color: "#FFD700", href: "/shows/monthly-idol"  },
  { id: "u3", title: "World Dance Party Vol. 4",          host: "DJ Lumi",             genre: "Party",    when: "Fri Jun 20 · 10:00 PM",  color: "#AA2DFF", href: "/rooms/world-dance-party" },
  { id: "u4", title: "Freestyle Cypher — Open Mic",      host: "TMI Stage",           genre: "Cypher",   when: "Sat Jun 21 · 7:00 PM",   color: "#00FFFF", href: "/rooms/cypher" },
];

const REPLAY_STREAMS = [
  { id: "r1", title: "Dirty Dozens S1 E3 — The Heat Check",  host: "TMI",        genre: "Battle",  views: "24K",  color: "#FFD700", href: "/dirty-dozens/dirty-dozens-season-1-episode-3" },
  { id: "r2", title: "World Concert — Nova Cipher Live",      host: "Nova Cipher",genre: "Concert", views: "51K",  color: "#00FFFF", href: "/rooms/world-concert" },
  { id: "r3", title: "Monthly Idol — Season 1 Finale",       host: "TMI Events", genre: "Show",    views: "88K",  color: "#FF2DAA", href: "/shows/monthly-idol"  },
  { id: "r4", title: "Song Battle Grand Final",               host: "TMI Arena",  genre: "Battle",  views: "19K",  color: "#AA2DFF", href: "/song-battle"         },
];

const TABS = ["LIVE NOW", "UPCOMING", "REPLAYS"] as const;
type Tab = typeof TABS[number];

export default function StreamsPage() {
  const [tab, setTab] = useState<Tab>("LIVE NOW");

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .stream-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.4)}
        .stream-card{transition:transform .2s,box-shadow .2s}
      `}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,45,170,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 700 }}>Streams</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link href="/rooms" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Rooms</Link>
          <Link href="/shows" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Shows</Link>
          <Link href="/go-live" style={{ padding: "6px 14px", borderRadius: 6, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 900, textDecoration: "none", letterSpacing: "0.06em" }}>🔴 GO LIVE</Link>
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 30% 20%, rgba(255,45,170,0.07), transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "#ef4444" }}>{LIVE_STREAMS.length} LIVE NOW</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, margin: "0 0 6px", lineHeight: 1.1 }}>Live Streams</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Watch battles, concerts, cyphers, and shows live on TMI</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 8, background: tab === t ? "rgba(255,45,170,0.15)" : "transparent", border: tab === t ? "1px solid rgba(255,45,170,0.4)" : "1px solid transparent", color: tab === t ? "#FF2DAA" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em", transition: "all .2s" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Live Now */}
        {tab === "LIVE NOW" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, animation: "fadeUp .3s ease" }}>
            {LIVE_STREAMS.map(s => (
              <Link key={s.id} href={s.href} className="stream-card" style={{ display: "block", borderRadius: 16, background: `linear-gradient(135deg, ${s.color}0C, rgba(5,5,16,0.95))`, border: `1px solid ${s.color}28`, textDecoration: "none", overflow: "hidden" }}>
                <div style={{ aspectRatio: "16/9", background: `linear-gradient(135deg, ${s.color}20, rgba(5,5,16,0.9))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
                  {s.thumb}
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.9)", borderRadius: 5, padding: "3px 8px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>LIVE</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 5, padding: "3px 8px", fontSize: 9, color: "#fff", fontWeight: 700 }}>
                    👁 {s.viewers.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, color: s.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>{s.genre.toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Hosted by {s.host}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Upcoming */}
        {tab === "UPCOMING" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp .3s ease" }}>
            {UPCOMING_STREAMS.map(s => (
              <Link key={s.id} href={s.href} style={{ display: "flex", gap: 16, padding: "18px 20px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 14, textDecoration: "none", alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: `${s.color}20`, border: `1px solid ${s.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📅</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: s.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 3 }}>{s.genre.toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Hosted by {s.host}</div>
                </div>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 800, textAlign: "right", flexShrink: 0 }}>{s.when}</div>
              </Link>
            ))}
          </div>
        )}

        {/* Replays */}
        {tab === "REPLAYS" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, animation: "fadeUp .3s ease" }}>
            {REPLAY_STREAMS.map(s => (
              <Link key={s.id} href={s.href} className="stream-card" style={{ display: "block", borderRadius: 14, background: `${s.color}08`, border: `1px solid ${s.color}22`, textDecoration: "none", overflow: "hidden" }}>
                <div style={{ aspectRatio: "16/9", background: `linear-gradient(135deg, ${s.color}15, rgba(5,5,16,0.9))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, position: "relative" }}>
                  📼
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", borderRadius: 5, padding: "3px 8px", fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>REPLAY</div>
                  <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 5, padding: "3px 8px", fontSize: 9, color: "#fff", fontWeight: 700 }}>👁 {s.views}</div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, color: s.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>{s.genre.toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.host}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Go Live CTA */}
        <div style={{ marginTop: 40, padding: "28px", background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(255,45,170,0.08))", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#ef4444", fontWeight: 900, marginBottom: 6 }}>🔴 READY TO STREAM?</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Start Your Live Stream</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Go live to thousands of fans, battle competitors, and host your world premiere</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/go-live" style={{ padding: "12px 28px", borderRadius: 10, background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 900, textDecoration: "none", letterSpacing: "0.08em" }}>🔴 GO LIVE NOW</Link>
            <Link href="/hub/performer" style={{ padding: "12px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>PERFORMER HUB</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
