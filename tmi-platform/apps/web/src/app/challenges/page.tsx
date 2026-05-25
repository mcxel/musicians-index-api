"use client";

import Link from "next/link";
import { useState } from "react";
import ChallengeYourSongCTA from "@/components/challenge/ChallengeYourSongCTA";

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
    accent: "#00C8FF",
    desc: "Record a 60–90 second vocal performance. Any genre welcome.",
  },
  {
    id: "c4",
    title: "Hip-Hop Cypher Drop",
    category: "Rappers",
    prize: "$400",
    xp: "900 XP",
    deadline: "June 12, 2026",
    entries: 42,
    accent: "#FFD700",
    desc: "16 bars minimum. Original lyrics only. The freshest verse wins.",
  },
];

export default function ChallengesPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = selected
    ? ACTIVE_CHALLENGES.filter(ch => ch.category.toLowerCase() === selected)
    : ACTIVE_CHALLENGES;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter',sans-serif", paddingBottom: 80 }}>

      {/* ── TOP CTA STRIP ── */}
      <ChallengeYourSongCTA variant="strip" />

      {/* ── HERO HEADER ── */}
      <div style={{
        padding: "44px clamp(16px,4vw,48px) 36px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(255,45,170,0.06) 0%, transparent 100%)",
      }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", marginBottom: 10, textTransform: "uppercase" }}>
          SONG CHALLENGES
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue','Impact',sans-serif",
          fontSize: "clamp(36px,6vw,64px)",
          letterSpacing: "0.04em",
          margin: "0 0 10px",
          lineHeight: 1,
          color: "#fff",
        }}>
          SUBMIT YOUR MUSIC.<br />
          <span style={{ color: "#FF2DAA" }}>WIN WITHOUT BATTLE.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 24px", maxWidth: 560, lineHeight: 1.6 }}>
          Not ready to go live? No problem. Submit a track, get community votes, win real prizes and XP.
          No live performance required.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/challenges/create" style={{
            background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
            color: "#fff",
            padding: "12px 28px",
            fontWeight: 900,
            fontSize: 10,
            textDecoration: "none",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            boxShadow: "0 0 24px rgba(255,45,170,0.4)",
          }}>
            🎤 CHALLENGE YOUR SONG →
          </Link>
          <Link href="/contest" style={{
            border: "1px solid rgba(0,200,255,0.35)",
            color: "#00C8FF",
            padding: "12px 24px",
            fontWeight: 900,
            fontSize: 10,
            textDecoration: "none",
            background: "rgba(0,200,255,0.05)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            VIEW GRAND CONTEST
          </Link>
        </div>
      </div>

      <div style={{ padding: "0 clamp(16px,4vw,48px)" }}>

        {/* ── HOW IT WORKS ── */}
        <section style={{
          margin: "32px 0",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "22px 26px",
        }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", marginBottom: 16, textTransform: "uppercase" }}>
            HOW IT WORKS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 20 }}>
            {[
              { step: "01", title: "Pick a Challenge", desc: "Choose any open challenge below that fits your style." },
              { step: "02", title: "Submit Your Track", desc: "Paste your YouTube, Spotify, or SoundCloud link. No file upload needed." },
              { step: "03", title: "Community Votes", desc: "Fans and artists vote on submissions over the challenge period." },
              { step: "04", title: "Win Prizes + XP", desc: "Top vote-getters win cash prizes and XP boosts." },
            ].map((s) => (
              <div key={s.step}>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 36, color: "rgba(255,45,170,0.15)", lineHeight: 1, marginBottom: 6 }}>{s.step}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FILTER TABS ── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase" }}>
            FILTER BY CATEGORY
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelected(null)}
              style={{
                padding: "5px 14px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", cursor: "pointer",
                border: `1px solid ${selected === null ? "#FF2DAA" : "rgba(255,255,255,0.12)"}`,
                background: selected === null ? "rgba(255,45,170,0.12)" : "transparent",
                color: selected === null ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
              }}
            >
              ALL
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id === selected ? null : c.id)}
                style={{
                  padding: "5px 14px", fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer",
                  border: `1px solid ${selected === c.id ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`,
                  background: selected === c.id ? "rgba(255,45,170,0.1)" : "transparent",
                  color: selected === c.id ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── ACTIVE CHALLENGES ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "#FF2DAA", marginBottom: 16, textTransform: "uppercase" }}>
            ● OPEN NOW
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
            {filtered.map((ch) => (
              <div
                key={ch.id}
                style={{
                  border: `1px solid ${ch.accent}33`,
                  background: `${ch.accent}06`,
                  padding: "20px 22px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: ch.accent }} />
                <div style={{ paddingLeft: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: ch.accent, background: `${ch.accent}15`, border: `1px solid ${ch.accent}30`, padding: "3px 8px", textTransform: "uppercase" }}>
                      {ch.category}
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{ch.entries} entries</span>
                  </div>
                  <h3 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "0.04em" }}>{ch.title}</h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.5 }}>{ch.desc}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ background: "rgba(0,200,136,0.08)", border: "1px solid rgba(0,200,136,0.25)", padding: "5px 10px", fontSize: 10, fontWeight: 800, color: "#00C896" }}>
                      💰 {ch.prize}
                    </div>
                    <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", padding: "5px 10px", fontSize: 10, fontWeight: 800, color: "#FFD700" }}>
                      ⚡ {ch.xp}
                    </div>
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 14, letterSpacing: "0.06em" }}>
                    Deadline: {ch.deadline}
                  </div>
                  <Link href="/challenges/create" style={{
                    display: "block", textAlign: "center", padding: "10px",
                    border: `1px solid ${ch.accent}55`,
                    background: `${ch.accent}12`,
                    color: ch.accent,
                    fontWeight: 900, fontSize: 9, letterSpacing: "0.14em", textDecoration: "none", textTransform: "uppercase",
                  }}>
                    ENTER CHALLENGE →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORIES GRID ── */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", marginBottom: 14, textTransform: "uppercase" }}>
            CHALLENGE CATEGORIES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
            {CATEGORIES.map((c) => (
              <div key={c.id} style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
                padding: "18px 16px",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: "#fff", marginBottom: 4, letterSpacing: "0.04em" }}>{c.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM FULL CTA ── */}
        <ChallengeYourSongCTA variant="full" />
      </div>
    </main>
  );
}
