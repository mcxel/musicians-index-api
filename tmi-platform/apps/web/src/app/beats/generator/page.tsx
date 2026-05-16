"use client";

import { useState } from "react";
import Link from "next/link";
import { buildSubmissionPreview } from "@/engines/performance/BeatSubmissionRouter";

const GENRES = ["Hip-Hop", "Trap", "Drill", "R&B", "Soul", "Afrobeats", "EDM", "Boom Bap", "House", "Latin", "Gospel", "Jazz"];
const MOODS = ["Dark", "Melodic", "Energetic", "Smooth", "Aggressive", "Chill", "Hype", "Emotional"];
const TEMPOS = [
  { label: "Slow", range: "60–80 BPM", bpm: 70 },
  { label: "Mid", range: "85–100 BPM", bpm: 92 },
  { label: "Fast", range: "120–145 BPM", bpm: 132 },
  { label: "Dance", range: "124–135 BPM", bpm: 128 },
  { label: "Battle", range: "88–105 BPM", bpm: 96 },
];

const ACCENT = "#AA2DFF";

function randomBpm(tempoLabel: string): number {
  const map: Record<string, [number, number]> = {
    "Slow": [60, 80], "Mid": [85, 100], "Fast": [120, 145],
    "Dance": [124, 135], "Battle": [88, 105],
  };
  const [lo, hi] = map[tempoLabel] ?? [80, 140];
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export default function BeatGeneratorPage() {
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [tempo, setTempo] = useState("");
  const [generated, setGenerated] = useState(false);
  const [resultBpm, setResultBpm] = useState(0);

  const preview = genre ? buildSubmissionPreview(genre, mood ? [mood.toLowerCase()] : [], true, true) : null;

  function generate() {
    if (!genre) return;
    const bpm = tempo ? randomBpm(tempo) : randomBpm("Mid");
    setResultBpm(bpm);
    setGenerated(true);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/beats" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← BEATS</Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: ACCENT, fontWeight: 800, marginTop: 20, marginBottom: 8 }}>BEAT GENERATOR</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "0 0 8px" }}>Generate a Beat Profile</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>
          Select genre, mood, and tempo — get a beat profile with session pool eligibility.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Genre */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>GENRE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {GENRES.map(g => (
                <button key={g} onClick={() => { setGenre(g); setGenerated(false); }}
                  style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${genre === g ? ACCENT : "rgba(255,255,255,0.12)"}`, background: genre === g ? `${ACCENT}20` : "transparent", color: genre === g ? ACCENT : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>MOOD</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MOODS.map(m => (
                <button key={m} onClick={() => { setMood(m); setGenerated(false); }}
                  style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${mood === m ? "#00FFFF" : "rgba(255,255,255,0.12)"}`, background: mood === m ? "rgba(0,255,255,0.1)" : "transparent", color: mood === m ? "#00FFFF" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Tempo */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>TEMPO</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TEMPOS.map(t => (
                <button key={t.label} onClick={() => { setTempo(t.label); setGenerated(false); }}
                  style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${tempo === t.label ? "#FFD700" : "rgba(255,255,255,0.12)"}`, background: tempo === t.label ? "rgba(255,215,0,0.1)" : "transparent", color: tempo === t.label ? "#FFD700" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ display: "block" }}>{t.label}</span>
                  <span style={{ fontSize: 7, opacity: 0.6 }}>{t.range}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Session pool preview */}
          {preview && (
            <div style={{ borderRadius: 10, border: "1px solid rgba(170,45,255,0.2)", background: "rgba(170,45,255,0.04)", padding: "14px 18px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(170,45,255,0.7)", marginBottom: 8 }}>SESSION POOL ELIGIBILITY</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{preview.poolSummary}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {preview.eligibleSessions.map(({ slot }) => (
                  <span key={slot.label} style={{ fontSize: 8, fontWeight: 700, padding: "3px 9px", borderRadius: 999, border: "1px solid rgba(170,45,255,0.25)", color: "rgba(170,45,255,0.8)", background: "rgba(170,45,255,0.08)" }}>
                    {slot.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button disabled={!genre}
            onClick={generate}
            style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: genre ? "#050510" : "rgba(255,255,255,0.3)", background: genre ? `linear-gradient(135deg,${ACCENT},#FF2DAA)` : "rgba(255,255,255,0.06)", borderRadius: 10, border: "none", cursor: genre ? "pointer" : "not-allowed" }}>
            GENERATE BEAT PROFILE
          </button>
        </div>

        {/* Generated result */}
        {generated && (
          <div style={{ marginTop: 32, background: "rgba(255,255,255,0.03)", border: `1px solid ${ACCENT}35`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 800, marginBottom: 16 }}>GENERATED PROFILE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {[
                { label: "GENRE", value: genre },
                { label: "MOOD", value: mood || "Mixed" },
                { label: "TEMPO", value: tempo || "Mid" },
                { label: "BPM", value: String(resultBpm) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/beats/submit"
                style={{ flex: 1, textAlign: "center", padding: "11px 0", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: ACCENT, borderRadius: 8, textDecoration: "none" }}>
                SUBMIT THIS BEAT
              </Link>
              <Link href="/beat-lab"
                style={{ flex: 1, textAlign: "center", padding: "11px 0", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: ACCENT, border: `1px solid ${ACCENT}50`, borderRadius: 8, textDecoration: "none" }}>
                OPEN BEAT LAB
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
