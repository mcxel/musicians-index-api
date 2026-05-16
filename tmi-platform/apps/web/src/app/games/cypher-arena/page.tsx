"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CypherRound {
  id: string;
  name: string;
  genre: string;
  status: "live" | "upcoming" | "ended";
  performers: string[];
  viewerCount: number;
  crownPoints: number;
  startTime: string;
}

const LIVE_ROUNDS: CypherRound[] = [
  { id: "r1", name: "Monday Night Cypher", genre: "Hip-Hop", status: "live", performers: ["Wavetek", "Crown X", "Cipher", "Ace Rhyme"], viewerCount: 15800, crownPoints: 150, startTime: "NOW" },
  { id: "r2", name: "Afrobeats Crown Qualifier", genre: "Afrobeats", status: "upcoming", performers: ["Zuri Bloom", "Nova", "Riddim", "Lux"], viewerCount: 0, crownPoints: 120, startTime: "8:30 PM" },
  { id: "r3", name: "R&B Open Mic", genre: "R&B / Soul", status: "upcoming", performers: ["Lyric Stone", "Blaze", "Defiant"], viewerCount: 0, crownPoints: 100, startTime: "10:00 PM" },
];

const GENRE_COLORS: Record<string, string> = {
  "Hip-Hop": "#FF2DAA",
  "Afrobeats": "#FFD700",
  "R&B / Soul": "#AA2DFF",
  "Trap": "#00FFFF",
  "Drill": "#FF6B35",
};

function RoundCard({ round }: { round: CypherRound }) {
  const color = GENRE_COLORS[round.genre] ?? "#00FFFF";
  return (
    <div style={{ border: `1px solid ${color}30`, borderRadius: 12, overflow: "hidden", background: round.status === "live" ? `${color}06` : "rgba(255,255,255,0.02)" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${color}15`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {round.status === "live" && (
            <span style={{ fontSize: 8, fontWeight: 900, color: "#00FF88", border: "1px solid #00FF8860", borderRadius: 3, padding: "2px 6px", letterSpacing: "0.15em" }}>LIVE</span>
          )}
          <span style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: "0.15em" }}>{round.genre.toUpperCase()}</span>
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{round.startTime}</span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>{round.name}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {round.performers.map((p) => (
            <span key={p} style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "2px 8px" }}>
              {p}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16 }}>
            {round.status === "live" && (
              <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>{round.viewerCount.toLocaleString()} watching</span>
            )}
            <span style={{ fontSize: 10, color, fontWeight: 700 }}>+{round.crownPoints} pts</span>
          </div>
          {round.status === "live" ? (
            <Link href={`/live/cypher`} style={{ fontSize: 10, fontWeight: 900, color: "#050510", background: color, borderRadius: 6, padding: "7px 14px", textDecoration: "none", letterSpacing: "0.1em" }}>
              JOIN LIVE →
            </Link>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 12px" }}>
              {round.startTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CypherArenaPage() {
  const [totalViewers, setTotalViewers] = useState(15800);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalViewers((v) => v + Math.floor((Math.random() - 0.4) * 80));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/games" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.2em" }}>← GAMES</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FF88", fontWeight: 800 }}>TMI GAMES</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: 2 }}>CYPHER ARENA</h1>
        </div>
        <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>{totalViewers.toLocaleString()} watching</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>
        {/* Hero stat bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { label: "ROUNDS DAILY", value: "12+" },
            { label: "CROWN PTS", value: "150" },
            { label: "GENRES", value: "10" },
            { label: "QUALIFIERS", value: "OPEN" },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "12px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88", marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Rounds */}
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>TODAY'S ROUNDS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {LIVE_ROUNDS.map((r) => <RoundCard key={r.id} round={r} />)}
        </div>

        {/* Crown qualifier callout */}
        <div style={{ padding: "20px 22px", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 12, background: "rgba(255,215,0,0.04)", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.15em", marginBottom: 8 }}>👑 CROWN QUALIFIER SEASON 1 — ACTIVE</div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 14px" }}>
            Place in any Cypher round to earn Crown Points. Top 12 performers at end of season enter the Grand Crown Final.
          </p>
          <Link href="/competitions" style={{ fontSize: 10, fontWeight: 900, color: "#FFD700", border: "1px solid #FFD70040", borderRadius: 6, padding: "8px 16px", textDecoration: "none", letterSpacing: "0.1em" }}>
            VIEW STANDINGS →
          </Link>
        </div>

        {/* How to enter */}
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>
            HOW IT WORKS
          </div>
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { n: "1", text: "Join a live Cypher round — no entry fee" },
              { n: "2", text: "Drop your bars on stage — 90 seconds per performer" },
              { n: "3", text: "Crowd votes in real time — top vote wins the round" },
              { n: "4", text: "Earn Crown Points — stack them for qualifier entry" },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#00FF88", flexShrink: 0 }}>{n}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, paddingTop: 2 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
