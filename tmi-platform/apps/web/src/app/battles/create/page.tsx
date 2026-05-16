"use client";

import { useState } from "react";
import Link from "next/link";
import { registerForMatchmaking, findMatch } from "@/lib/competition/BattleMatchmakingEngine";

const BATTLE_TYPES = [
  { id: "rapper", label: "Rapper vs Rapper", class: "vocal" },
  { id: "singer", label: "Singer vs Singer", class: "vocal" },
  { id: "guitar", label: "Guitar Battle", class: "instrument" },
  { id: "piano", label: "Piano Battle", class: "instrument" },
  { id: "drums", label: "Drum Battle", class: "instrument" },
  { id: "dj", label: "DJ vs DJ", class: "instrument" },
  { id: "producer", label: "Producer vs Producer", class: "production" },
  { id: "band", label: "Band vs Band", class: "group" },
  { id: "beatbox", label: "Beatbox Battle", class: "vocal" },
  { id: "yo-mama", label: "Yo Mama Rounds", class: "dirty-dozens" },
  { id: "roast", label: "Comedy Roast", class: "dirty-dozens" },
];

const GENRES = ["Hip-Hop", "R&B", "Pop", "Jazz", "Blues", "Gospel", "Latin", "Reggae", "EDM", "Rock", "Country", "Freestyle Open"];
const AUDIO_RULES = ["Beat Optional", "Beat Required", "Acapella Only", "Live Instrument Only", "Live Set Only", "Producer Submits Beat"];
const VOTING_MODES = ["Crowd Vote", "Judge Panel", "Host Decision", "Combined Score"];

export default function CreateBattlePage() {
  const [form, setForm] = useState({
    title: "", battleType: "", genre: "", audioRule: "", votingMode: "Crowd Vote",
    roundCount: "3", prizePool: "", entryFee: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [matchFound, setMatchFound] = useState<string | null>(null);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const artistId = "me";
    registerForMatchmaking({
      artistId,
      displayName: "You",
      rankScore: 1000,
      wins: 0,
      losses: 0,
      genre: form.genre || "Hip-Hop",
      availableNow: true,
      preferredMode: "open",
    });
    const match = findMatch(artistId, "open");
    if (match) setMatchFound(match.matchId);
    setSubmitted(true);
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: form.title, type: "ARENA", metadata: form }),
    }).catch(() => {});
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const label: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚔️</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Battle Submitted</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Your battle is under review. {matchFound ? `Match found: ${matchFound}` : "You'll be notified when it goes live."}</p>
          <Link href="/battles" style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA", textDecoration: "none", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: "10px 22px" }}>← ALL BATTLES</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/battles" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← BATTLES
        </Link>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "24px 0 8px" }}>Create a Battle</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Set up your competition format, genre, and rules.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <span style={label}>BATTLE TITLE</span>
            <input style={input} placeholder="e.g. Wavetek vs Krypt" value={form.title} onChange={e => set("title", e.target.value)} required />
          </div>

          <div>
            <span style={label}>BATTLE TYPE</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
              {BATTLE_TYPES.map(bt => (
                <button key={bt.id} type="button" onClick={() => set("battleType", bt.id)} style={{ padding: "10px 14px", textAlign: "left", background: form.battleType === bt.id ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.battleType === bt.id ? "#FF2DAA" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: "#fff", fontSize: 11, cursor: "pointer" }}>
                  <div style={{ fontWeight: 700 }}>{bt.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{bt.class}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={label}>GENRE</span>
              <select style={{ ...input }} value={form.genre} onChange={e => set("genre", e.target.value)}>
                <option value="">Select genre…</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>AUDIO RULE</span>
              <select style={{ ...input }} value={form.audioRule} onChange={e => set("audioRule", e.target.value)}>
                <option value="">Select rule…</option>
                {AUDIO_RULES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <span style={label}>ROUNDS</span>
              <input style={input} type="number" min="1" max="12" value={form.roundCount} onChange={e => set("roundCount", e.target.value)} />
            </div>
            <div>
              <span style={label}>PRIZE POOL ($)</span>
              <input style={input} type="number" min="0" placeholder="500" value={form.prizePool} onChange={e => set("prizePool", e.target.value)} />
            </div>
            <div>
              <span style={label}>ENTRY FEE ($)</span>
              <input style={input} type="number" min="0" placeholder="0" value={form.entryFee} onChange={e => set("entryFee", e.target.value)} />
            </div>
          </div>

          <div>
            <span style={label}>VOTING MODE</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VOTING_MODES.map(vm => (
                <button key={vm} type="button" onClick={() => set("votingMode", vm)} style={{ padding: "8px 16px", fontSize: 10, fontWeight: 700, background: form.votingMode === vm ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.votingMode === vm ? "#FFD700" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: form.votingMode === vm ? "#FFD700" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                  {vm}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 10, border: "none", cursor: "pointer", marginTop: 8 }}>
            SUBMIT BATTLE
          </button>
        </form>
      </div>
    </main>
  );
}
