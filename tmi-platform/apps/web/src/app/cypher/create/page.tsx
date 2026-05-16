"use client";

import { useState } from "react";
import Link from "next/link";

const GENRES = [
  { id: "hiphop", label: "Hip-Hop" }, { id: "battle-rap", label: "Battle Rap" },
  { id: "hardcore-rap", label: "Hardcore Rap" }, { id: "rnb", label: "R&B" },
  { id: "country", label: "Country" }, { id: "rock", label: "Rock" },
  { id: "pop", label: "Pop" }, { id: "gospel", label: "Gospel" },
  { id: "jazz", label: "Jazz" }, { id: "blues", label: "Blues" },
  { id: "latin", label: "Latin" }, { id: "reggae", label: "Reggae" },
  { id: "edm", label: "EDM" }, { id: "instrumental", label: "Instrumental" },
  { id: "producer", label: "Producer Cypher" }, { id: "freestyle-open", label: "Freestyle Open" },
];
const BEAT_RULES = ["House beat provided", "Beat optional", "Beat required", "Producer submits beat", "Live instrument only", "Acapella only"];
const QUEUE_TYPES = ["Open queue", "Invite only", "Host-selected", "First come first serve"];
const HOST_MODES = ["Bot host", "Human host", "No host", "Co-host"];

export default function CreateCypherPage() {
  const [form, setForm] = useState({ title: "", genre: "", beatRule: "", queueType: "Open queue", hostMode: "Bot host", maxParticipants: "12", entryFee: "0" });
  const [done, setDone] = useState(false);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: form.title || `${form.genre} Cypher`, type: "ARENA", metadata: form }),
    }).catch(() => {});
  }

  const input: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  if (done) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎙️</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Cypher Submitted</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Your cypher is under review. You'll be notified when it opens.</p>
        <Link href="/cypher" style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA", textDecoration: "none", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: "10px 22px" }}>← ALL CYPHERS</Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/cypher" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← CYPHER</Link>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "24px 0 8px" }}>Start a Cypher</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Create a genre-bound cypher with its own beat rules and entry format.</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <span style={lbl}>CYPHER TITLE (optional)</span>
            <input style={input} placeholder="Leave blank to auto-generate" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div>
            <span style={lbl}>GENRE</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
              {GENRES.map(g => (
                <button key={g.id} type="button" onClick={() => set("genre", g.id)} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, background: form.genre === g.id ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.genre === g.id ? "#FF2DAA" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: form.genre === g.id ? "#FF2DAA" : "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={lbl}>BEAT RULE</span>
              <select style={{ ...input }} value={form.beatRule} onChange={e => set("beatRule", e.target.value)} required>
                <option value="">Select…</option>
                {BEAT_RULES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <span style={lbl}>QUEUE TYPE</span>
              <select style={{ ...input }} value={form.queueType} onChange={e => set("queueType", e.target.value)}>
                {QUEUE_TYPES.map(q => <option key={q}>{q}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <span style={lbl}>HOST MODE</span>
              <select style={{ ...input }} value={form.hostMode} onChange={e => set("hostMode", e.target.value)}>
                {HOST_MODES.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <span style={lbl}>MAX PARTICIPANTS</span>
              <input style={input} type="number" min="2" max="100" value={form.maxParticipants} onChange={e => set("maxParticipants", e.target.value)} />
            </div>
            <div>
              <span style={lbl}>ENTRY FEE ($)</span>
              <input style={input} type="number" min="0" placeholder="0" value={form.entryFee} onChange={e => set("entryFee", e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={!form.genre || !form.beatRule} style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: !form.genre || !form.beatRule ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 10, border: "none", cursor: !form.genre || !form.beatRule ? "not-allowed" : "pointer" }}>
            LAUNCH CYPHER
          </button>
        </form>
      </div>
    </main>
  );
}
