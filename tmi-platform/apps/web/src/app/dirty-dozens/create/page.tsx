"use client";

import { useState } from "react";
import Link from "next/link";

const FORMATS = [
  { id: "yo-mama", label: "Yo Mama Rounds", desc: "Classic crowd-pleasing format" },
  { id: "roast", label: "Comedy Roast", desc: "Structured roast battle" },
  { id: "freestyle-roast", label: "Freestyle Roast", desc: "Off-dome insults + bars" },
  { id: "insult-battle", label: "Insult Battle", desc: "Pure crowd-voted roast" },
];

export default function CreateDirtyDozensPage() {
  const [form, setForm] = useState({ title: "", format: "", roundCount: "12", hostJudge: "Bot host", crowdVote: true, prizePool: "5000" });
  const [done, setDone] = useState(false);

  function set(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: form.title || "Dirty Dozens Session", type: "ARENA", metadata: form }),
    }).catch(() => {});
  }

  const input: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  if (done) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>👑</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Session Submitted</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Your Dirty Dozens session is under admin review.</p>
        <Link href="/dirty-dozens" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 22px" }}>← DIRTY DOZENS</Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/dirty-dozens" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← DIRTY DOZENS</Link>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "24px 0 8px" }}>Create a Dirty Dozens Session</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>12 artists. 12 rounds. One champion. Set your format and rules.</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <span style={lbl}>SESSION TITLE</span>
            <input style={input} placeholder="e.g. The Heat Check Season 2" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div>
            <span style={lbl}>FORMAT</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
              {FORMATS.map(f => (
                <button key={f.id} type="button" onClick={() => set("format", f.id)} style={{ padding: "14px 16px", textAlign: "left", background: form.format === f.id ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.format === f.id ? "#FFD700" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, color: "#fff", cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: form.format === f.id ? "#FFD700" : "#fff" }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <span style={lbl}>ROUNDS</span>
              <input style={input} type="number" min="6" max="24" value={form.roundCount} onChange={e => set("roundCount", e.target.value)} />
            </div>
            <div>
              <span style={lbl}>HOST / JUDGE</span>
              <select style={{ ...input }} value={form.hostJudge} onChange={e => set("hostJudge", e.target.value)}>
                <option>Bot host</option>
                <option>Human host</option>
                <option>Judge panel</option>
                <option>No host</option>
              </select>
            </div>
            <div>
              <span style={lbl}>PRIZE POOL ($)</span>
              <input style={input} type="number" min="0" value={form.prizePool} onChange={e => set("prizePool", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input type="checkbox" id="crowdVote" checked={form.crowdVote} onChange={e => set("crowdVote", e.target.checked)} style={{ width: 16, height: 16 }} />
            <label htmlFor="crowdVote" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Enable crowd voting for each round</label>
          </div>

          <button type="submit" disabled={!form.format} style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: !form.format ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#FFD700,#FF2DAA)", borderRadius: 10, border: "none", cursor: !form.format ? "not-allowed" : "pointer" }}>
            SUBMIT SESSION
          </button>
        </form>
      </div>
    </main>
  );
}
