"use client";

import { useState } from "react";
import Link from "next/link";

const BATTLE_TYPES = [
  { id: "song",   label: "Song Challenge",  emoji: "🎵", desc: "Submit a track · Head-to-head fan vote",  xp: "200–600 XP" },
  { id: "cypher", label: "Cypher Battle",   emoji: "🎤", desc: "Live rap/vocal · 16–32 bars each",        xp: "300–1000 XP" },
  { id: "beat",   label: "Beat Battle",     emoji: "🎛️", desc: "Submit a beat · Producer vs producer",    xp: "200–500 XP" },
  { id: "lyric",  label: "Lyric Battle",    emoji: "📝", desc: "Written rounds · Judges score content",   xp: "150–400 XP" },
];

const STAKES = [
  { id: "xp",      label: "XP Only",        desc: "Winner takes XP — no cash at risk",      accent: "#00FFFF" },
  { id: "prize",   label: "XP + Prize Pool", desc: "Both enter a prize pool — winner takes", accent: "#FFD700" },
  { id: "sponsor", label: "Sponsored Battle",desc: "Brand-sponsored · Bigger prize pool",    accent: "#AA2DFF" },
];

const SUGGESTED_OPPONENTS = [
  { slug: "zion-freq",   name: "Zion Freq",  genre: "Hip-Hop",   rank: 2  },
  { slug: "wave-tek",    name: "Wave Tek",   genre: "Afrobeats", rank: 4  },
  { slug: "veron-koi",   name: "Veron Koi",  genre: "Neo-Soul",  rank: 6  },
  { slug: "pulse-max",   name: "Pulse Max",  genre: "Trap",      rank: 7  },
  { slug: "big-ace",     name: "Big Ace",    genre: "Hip-Hop",   rank: 8  },
  { slug: "flex-king",   name: "Flex King",  genre: "Dance",     rank: 10 },
];

export default function NewBattlePage() {
  const [type, setType]       = useState("song");
  const [stake, setStake]     = useState("xp");
  const [opponent, setOpponent] = useState("");
  const [search, setSearch]   = useState("");
  const [submitted, setSubmitted] = useState(false);

  const filtered = SUGGESTED_OPPONENTS.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.genre.toLowerCase().includes(search.toLowerCase())
  );

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#FFD700" }}>Battle Sent!</h2>
          <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Your challenge has been issued. Waiting for your opponent to accept.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/battles" style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              VIEW BATTLES
            </Link>
            <Link href="/home/5" style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              HOME
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,215,0,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <Link href="/battles" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Battles</Link>
        <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>New Battle</span>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>ISSUE A CHALLENGE</div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px,4vw,36px)", fontWeight: 900 }}>New Battle</h1>
        </div>

        {/* Step 1: Battle type */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>STEP 1 — BATTLE TYPE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {BATTLE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                style={{
                  padding: "16px", borderRadius: 12, cursor: "pointer", textAlign: "left", border: "none",
                  background: type === t.id ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
                  outline: type === t.id ? "1.5px solid rgba(255,215,0,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{t.desc}</div>
                <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 700 }}>{t.xp}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Opponent */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>STEP 2 — CHOOSE OPPONENT</div>
          <input
            type="text" placeholder="Search performer name or genre..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((p) => (
              <button
                key={p.slug}
                onClick={() => setOpponent(p.slug)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "11px 16px", borderRadius: 10, cursor: "pointer", border: "none",
                  background: opponent === p.slug ? "rgba(0,255,255,0.1)" : "rgba(255,255,255,0.03)",
                  outline: opponent === p.slug ? "1.5px solid rgba(0,255,255,0.45)" : "1px solid rgba(255,255,255,0.07)",
                  color: "#fff", textAlign: "left",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #AA2DFF, #00FFFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🎤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{p.genre} · Rank #{p.rank}</div>
                </div>
                {opponent === p.slug && <span style={{ color: "#00FFFF", fontSize: 16 }}>✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Step 3: Stakes */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>STEP 3 — STAKES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STAKES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStake(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 10, cursor: "pointer", border: "none",
                  background: stake === s.id ? `${s.accent}12` : "rgba(255,255,255,0.03)",
                  outline: stake === s.id ? `1.5px solid ${s.accent}55` : "1px solid rgba(255,255,255,0.07)",
                  color: "#fff", textAlign: "left",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: stake === s.id ? s.accent : "#fff" }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.desc}</div>
                </div>
                {stake === s.id && <span style={{ color: s.accent, fontSize: 16 }}>✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={() => opponent && setSubmitted(true)}
          disabled={!opponent}
          style={{
            width: "100%", padding: "16px", borderRadius: 12, fontSize: 14, fontWeight: 900, letterSpacing: "0.1em", cursor: opponent ? "pointer" : "not-allowed",
            background: opponent ? "linear-gradient(135deg, #FFD700, #FF2DAA)" : "rgba(255,255,255,0.08)",
            border: "none", color: opponent ? "#050510" : "rgba(255,255,255,0.25)",
            boxShadow: opponent ? "0 0 30px rgba(255,215,0,0.25)" : "none",
          }}
        >
          {opponent ? "⚔️ ISSUE BATTLE CHALLENGE" : "SELECT AN OPPONENT TO CONTINUE"}
        </button>
      </div>
    </main>
  );
}
