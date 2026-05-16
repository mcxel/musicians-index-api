"use client";

import { useState } from "react";
import Link from "next/link";

const LIVE_BATTLES = [
  {
    id: "b1",
    artist1: { name: "Wavetek", icon: "🎤", color: "#FF2DAA", votes: 1842 },
    artist2: { name: "Krypt", icon: "🔒", color: "#AA2DFF", votes: 1204 },
    category: "RAP",
    endsIn: "4m 22s",
    prize: "$500",
  },
  {
    id: "b2",
    artist1: { name: "Zuri Bloom", icon: "🌍", color: "#00FF88", votes: 980 },
    artist2: { name: "Neon Vibe", icon: "🎧", color: "#00FFFF", votes: 1110 },
    category: "HYBRID",
    endsIn: "12m 08s",
    prize: "$250",
  },
  {
    id: "b3",
    artist1: { name: "Vela Flux", icon: "⚡", color: "#FFD700", votes: 432 },
    artist2: { name: "Mako Drift", icon: "🌊", color: "#00FFFF", votes: 395 },
    category: "ELECTRO",
    endsIn: "28m 41s",
    prize: "$100",
  },
];

const CROWN_LEADERBOARD = [
  { rank: 1, name: "Wavetek",    icon: "🎤", xp: 14820, badge: "CHAMPION", color: "#FFD700" },
  { rank: 2, name: "Zuri Bloom", icon: "🌍", xp: 12340, badge: "TOP 5",    color: "#00FF88" },
  { rank: 3, name: "Krypt",      icon: "🔒", xp: 10900, badge: "TOP 5",    color: "#AA2DFF" },
  { rank: 4, name: "Neon Vibe",  icon: "🎧", xp: 9450,  badge: "TOP 10",   color: "#00FFFF" },
  { rank: 5, name: "Vela Flux",  icon: "⚡", xp: 8120,  badge: "TOP 10",   color: "#FFD700" },
];

type VoteMap = Record<string, "1" | "2">;

export default function VotePage() {
  const [votes, setVotes] = useState<VoteMap>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  function castVote(battleId: string, side: "1" | "2") {
    if (confirmed[battleId]) return;
    setVotes(v => ({ ...v, [battleId]: side }));
  }

  function confirm(battleId: string) {
    if (!votes[battleId]) return;
    setConfirmed(c => ({ ...c, [battleId]: true }));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "60px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "radial-gradient(ellipse at top, rgba(255,215,0,0.06) 0%, transparent 70%)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>LIVE CROWD VOTE</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 14 }}>
          VOTE CENTER
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 440, margin: "0 auto" }}>
          Cast your vote in live battles. Your votes earn you XP and shape the weekly leaderboard.
        </p>
      </section>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0", display: "grid", gridTemplateColumns: "1fr", gap: 40 }}>

        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 20 }}>
            LIVE BATTLES — VOTE NOW
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {LIVE_BATTLES.map(b => {
              const total = b.artist1.votes + b.artist2.votes;
              const pct1 = Math.round((b.artist1.votes / total) * 100);
              const pct2 = 100 - pct1;
              const myVote = votes[b.id];
              const done = confirmed[b.id];

              return (
                <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${done ? "#FFD700" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "#FF2DAA", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, padding: "2px 6px" }}>{b.category}</span>
                      <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 700 }}>🏆 {b.prize}</span>
                    </div>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>⏱ {b.endsIn}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 16 }}>
                    <button
                      onClick={() => castVote(b.id, "1")}
                      disabled={done}
                      style={{ background: myVote === "1" ? `${b.artist1.color}25` : "rgba(255,255,255,0.03)", border: `2px solid ${myVote === "1" ? b.artist1.color : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "16px 12px", cursor: done ? "default" : "pointer", textAlign: "center", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{b.artist1.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: myVote === "1" ? b.artist1.color : "#fff" }}>{b.artist1.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{b.artist1.votes.toLocaleString()} votes</div>
                    </button>

                    <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.25)" }}>VS</span>

                    <button
                      onClick={() => castVote(b.id, "2")}
                      disabled={done}
                      style={{ background: myVote === "2" ? `${b.artist2.color}25` : "rgba(255,255,255,0.03)", border: `2px solid ${myVote === "2" ? b.artist2.color : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "16px 12px", cursor: done ? "default" : "pointer", textAlign: "center", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{b.artist2.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: myVote === "2" ? b.artist2.color : "#fff" }}>{b.artist2.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{b.artist2.votes.toLocaleString()} votes</div>
                    </button>
                  </div>

                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ height: "100%", width: `${pct1}%`, background: `linear-gradient(90deg, ${b.artist1.color}, ${b.artist2.color})`, borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
                    <span>{pct1}%</span><span>{pct2}%</span>
                  </div>

                  {done ? (
                    <div style={{ textAlign: "center", fontSize: 10, color: "#FFD700", fontWeight: 800 }}>✓ VOTE CAST — +10 XP EARNED</div>
                  ) : (
                    <button
                      onClick={() => confirm(b.id)}
                      disabled={!myVote}
                      style={{ width: "100%", padding: "10px 0", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: myVote ? "#050510" : "rgba(255,255,255,0.2)", background: myVote ? "linear-gradient(135deg,#FFD700,#FF9500)" : "rgba(255,255,255,0.05)", borderRadius: 8, border: "none", cursor: myVote ? "pointer" : "default" }}>
                      CONFIRM VOTE
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 20 }}>
            CROWN LEADERBOARD — THIS WEEK
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {CROWN_LEADERBOARD.map(entry => (
              <div key={entry.rank} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: entry.rank === 1 ? "#FFD700" : "rgba(255,255,255,0.2)", minWidth: 22 }}>#{entry.rank}</span>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{entry.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{entry.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{entry.xp.toLocaleString()} XP</div>
                </div>
                <span style={{ fontSize: 7, fontWeight: 800, color: entry.color, background: `${entry.color}15`, border: `1px solid ${entry.color}30`, borderRadius: 4, padding: "2px 6px" }}>{entry.badge}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", paddingTop: 8 }}>
          <Link href="/vote/rank/4" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 8, textDecoration: "none" }}>
            RANK VOTE →
          </Link>
          <Link href="/battles" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 700, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            View All Battles
          </Link>
          <Link href="/live" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 700, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, textDecoration: "none" }}>
            Go Live
          </Link>
        </section>
      </div>
    </main>
  );
}
