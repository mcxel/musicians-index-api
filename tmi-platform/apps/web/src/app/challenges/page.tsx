"use client";

import Link from "next/link";
import { useState } from "react";

const CATEGORIES = [
  { id: "singers",     label: "Singers",     icon: "🎤", desc: "Vocal performances, R&B, Pop, Gospel" },
  { id: "rappers",     label: "Rappers",     icon: "🎵", desc: "Hip-hop, freestyle, lyrical" },
  { id: "producers",   label: "Producers",   icon: "🎛️", desc: "Beats, instrumentals, original tracks" },
  { id: "djs",         label: "DJs",         icon: "🎧", desc: "Mixes, sets, transitions" },
  { id: "bands",       label: "Bands",       icon: "🎸", desc: "Full band recordings and performances" },
  { id: "songwriters", label: "Songwriters", icon: "✍️", desc: "Original songs, demos, compositions" },
];

const ACTIVE_CHALLENGES = [
  {
    id: "c1",
    title: "Best Original Track",
    category: "Open",
    prize: "$500",
    xp: "1,000 XP",
    deadline: "June 1, 2026",
    entries: 24,
    accent: "#FF2DAA",
    desc: "Submit your best original song. No live performance needed — let your music speak.",
  },
  {
    id: "c2",
    title: "Producer Showcase",
    category: "Producers",
    prize: "$300",
    xp: "800 XP",
    deadline: "May 28, 2026",
    entries: 18,
    accent: "#AA2DFF",
    desc: "Drop your hardest beat or instrumental. Community votes determine the winner.",
  },
  {
    id: "c3",
    title: "Vocal Power Challenge",
    category: "Singers",
    prize: "$250",
    xp: "600 XP",
    deadline: "June 5, 2026",
    entries: 31,
    accent: "#00FFFF",
    desc: "Record a 60–90 second vocal performance. Any genre welcome.",
  },
];

export default function ChallengesPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px clamp(16px,4vw,48px) 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: "#AA2DFF", marginBottom: 10 }}>
          SONG CHALLENGES
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: 2, margin: "0 0 12px", lineHeight: 1.1 }}>
          Submit Your Music.<br />
          <span style={{ color: "#FF2DAA" }}>Win Without Battle.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, margin: "0 0 24px", maxWidth: 560, lineHeight: 1.6 }}>
          Not ready to go live? No problem. Submit a track, get community votes, win real prizes and XP.
          No live performance required.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/auth"
            style={{
              background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
              letterSpacing: "0.06em",
            }}
          >
            SUBMIT A TRACK →
          </Link>
          <Link
            href="/contest"
            style={{
              border: "1px solid rgba(0,255,255,0.3)",
              color: "#00FFFF",
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              background: "rgba(0,255,255,0.05)",
            }}
          >
            VIEW GRAND CONTEST
          </Link>
        </div>
      </div>

      {/* How it works */}
      <section style={{ marginBottom: 40, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>HOW IT WORKS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 20 }}>
          {[
            { step: "01", title: "Pick a Challenge", desc: "Choose any open challenge below that fits your style." },
            { step: "02", title: "Submit Your Track", desc: "Upload or link your song. No live stream needed." },
            { step: "03", title: "Community Votes", desc: "Fans and artists vote on submissions over the challenge period." },
            { step: "04", title: "Win Prizes + XP", desc: "Top vote-getters win cash prizes and XP boosts." },
          ].map((s) => (
            <div key={s.step}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "rgba(255,45,170,0.15)", lineHeight: 1, marginBottom: 6 }}>{s.step}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category filter */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>FILTER BY CATEGORY</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em",
              cursor: "pointer", border: `1px solid ${selected === null ? "#AA2DFF" : "rgba(255,255,255,0.1)"}`,
              background: selected === null ? "rgba(170,45,255,0.12)" : "transparent",
              color: selected === null ? "#AA2DFF" : "rgba(255,255,255,0.4)",
            }}
          >
            ALL
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id === selected ? null : c.id)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em",
                cursor: "pointer", border: `1px solid ${selected === c.id ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`,
                background: selected === c.id ? "rgba(255,45,170,0.1)" : "transparent",
                color: selected === c.id ? "#FF2DAA" : "rgba(255,255,255,0.4)",
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active challenges */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>● OPEN NOW</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {ACTIVE_CHALLENGES.map((ch) => (
            <div
              key={ch.id}
              style={{
                border: `1px solid ${ch.accent}33`,
                borderRadius: 14,
                background: `${ch.accent}08`,
                padding: "20px 22px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: ch.accent, background: `${ch.accent}15`, border: `1px solid ${ch.accent}30`, borderRadius: 4, padding: "3px 8px" }}>
                  {ch.category.toUpperCase()}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{ch.entries} entries</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: 0.5 }}>{ch.title}</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.5 }}>{ch.desc}</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 800, color: "#00FF88" }}>
                  💰 {ch.prize}
                </div>
                <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 800, color: "#FFD700" }}>
                  ⚡ {ch.xp}
                </div>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 14 }}>
                Deadline: {ch.deadline}
              </div>
              <Link
                href="/auth"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: 8,
                  border: `1px solid ${ch.accent}55`,
                  background: `${ch.accent}12`,
                  color: ch.accent,
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                }}
              >
                ENTER CHALLENGE →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Categories grid */}
      <section>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>CHALLENGE CATEGORIES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                background: "#0a0a14",
                padding: "18px 16px",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
