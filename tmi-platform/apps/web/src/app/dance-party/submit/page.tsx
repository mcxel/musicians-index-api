"use client";

import { useState } from "react";
import Link from "next/link";

const GENRES = ["Hip-Hop", "Afrobeats", "R&B", "Dance Hall", "House", "Trap", "EDM", "Latin", "Gospel", "Drill"];

const PERMISSION_TYPES = [
  { id: "promotional", label: "Promotional Use", desc: "Allow TMI to use your track in dance parties for fan exposure. Free." },
  { id: "event-use", label: "Event Use", desc: "License for live dance events. Earn royalty per event use." },
  { id: "replay-use", label: "Replay Use", desc: "Allow highlight clips and replays. Additional royalty." },
];

export default function DancePartySubmitPage() {
  const [form, setForm] = useState({ title: "", artist: "", genre: "", bpm: "", permissions: [] as string[], creditLine: "" });
  const [done, setDone] = useState(false);

  function togglePermission(id: string) {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(id) ? p.permissions.filter(x => x !== id) : [...p.permissions, id],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    await fetch("/api/beats/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, submissionType: "dance-track" }),
    }).catch(() => {});
  }

  const input: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  if (done) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🕺</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Track Submitted</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Your track is in review. Once approved it joins the dance party rotation with your credit displayed.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/dance-party" style={{ fontSize: 10, fontWeight: 800, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: "10px 20px" }}>DANCE PARTY</Link>
          <Link href="/dance-party/live" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FFFF", textDecoration: "none", borderRadius: 8, padding: "10px 20px" }}>JOIN LIVE NOW</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/dance-party" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← DANCE PARTY</Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginTop: 20, marginBottom: 8 }}>TRACK SUBMISSION</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "0 0 8px" }}>Submit a Dance Track</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>
          You keep ownership. Select which usage permissions you grant TMI. Track credit shows while your song plays.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Upload */}
          <div style={{ border: "2px dashed rgba(0,255,255,0.2)", borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎵</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Drop audio file here</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>WAV or MP3 · Max 50MB</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={lbl}>TRACK TITLE</span>
              <input style={input} placeholder="e.g. Midnight Wave" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <span style={lbl}>ARTIST NAME</span>
              <input style={input} placeholder="Your artist name" value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={lbl}>GENRE</span>
              <select style={{ ...input }} value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))} required>
                <option value="">Select…</option>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <span style={lbl}>BPM (optional)</span>
              <input style={input} type="number" min="60" max="200" placeholder="120" value={form.bpm} onChange={e => setForm(p => ({ ...p, bpm: e.target.value }))} />
            </div>
          </div>

          <div>
            <span style={lbl}>CREDIT LINE</span>
            <input style={input} placeholder="e.g. Produced by Wavetek · © 2026" value={form.creditLine} onChange={e => setForm(p => ({ ...p, creditLine: e.target.value }))} required />
          </div>

          {/* Permission grants */}
          <div>
            <span style={lbl}>USAGE PERMISSIONS (select all that apply)</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PERMISSION_TYPES.map(perm => (
                <label key={perm.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", background: form.permissions.includes(perm.id) ? "rgba(0,255,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.permissions.includes(perm.id) ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "12px 14px" }}>
                  <input type="checkbox" checked={form.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} style={{ marginTop: 2, flexShrink: 0, accentColor: "#00FFFF" }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{perm.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{perm.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 10, padding: "14px 16px", fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            By submitting, you confirm you own or control the rights to this track. TMI will display your credit line while the track plays. Usage beyond selected permissions requires separate agreement.
          </div>

          <button type="submit" disabled={form.permissions.length === 0}
            style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: form.permissions.length > 0 ? "#050510" : "rgba(255,255,255,0.3)", background: form.permissions.length > 0 ? "linear-gradient(135deg,#00FFFF,#AA2DFF)" : "rgba(255,255,255,0.06)", borderRadius: 10, border: "none", cursor: form.permissions.length > 0 ? "pointer" : "not-allowed" }}>
            SUBMIT TO DANCE PARTY QUEUE
          </button>
        </form>
      </div>
    </main>
  );
}
