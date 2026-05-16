"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { buildSubmissionPreview } from "@/engines/performance/BeatSubmissionRouter";

const GENRES = ["Hip-Hop", "R&B", "Pop", "Trap", "Drill", "Afrobeats", "Jazz", "Gospel", "Latin", "EDM", "Country", "Rock", "Blues", "Reggae", "Instrumental"];
const LICENSES = [
  { id: "basic", label: "Basic Lease", price: "$29", desc: "Non-exclusive · MP3 only · 2,500 copies" },
  { id: "premium", label: "Premium Lease", price: "$59", desc: "Non-exclusive · WAV + MP3 · Unlimited copies" },
  { id: "exclusive", label: "Exclusive", price: "$499+", desc: "Full ownership transfer · All stems included" },
];

export default function BeatSubmitPage() {
  const [form, setForm] = useState({ title: "", genre: "", bpm: "", key: "", tags: "", basicPrice: "29", premiumPrice: "59", exclusivePrice: "499", enableAuction: false, battleUsable: true, cypherUsable: true });
  const [done, setDone] = useState(false);
  const [beatFile, setBeatFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!form.genre) return null;
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    return buildSubmissionPreview(form.genre, tags, form.battleUsable, form.cypherUsable);
  }, [form.genre, form.tags, form.battleUsable, form.cypherUsable]);

  function set(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (beatFile) fd.append("file", beatFile);
    setDone(true);
    await fetch("/api/beats/submit", {
      method:      "POST",
      credentials: "include",
      body:        fd,
    }).catch(() => {});
  }

  const input: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  if (done) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎛️</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Beat Submitted</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Your beat is in review. Once approved it goes live in the marketplace.</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Watermarked preview generated automatically.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/beats/marketplace" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 20px" }}>MARKETPLACE</Link>
          <Link href="/producer/hub" style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 20px" }}>MY HUB</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/beats" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← BEATS</Link>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "24px 0 8px" }}>Submit a Beat</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Your beat enters a private vault. Buyers purchase a license — you keep ownership.</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ border: `2px dashed ${beatFile ? "rgba(255,215,0,0.6)" : "rgba(255,215,0,0.2)"}`, borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              style={{ display: "none" }}
              onChange={(e) => setBeatFile(e.target.files?.[0] ?? null)}
            />
            <div style={{ fontSize: 32, marginBottom: 10 }}>{beatFile ? "🎵" : "🎚️"}</div>
            {beatFile ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#FFD700" }}>{beatFile.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{(beatFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Click to select beat file</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>WAV or MP3 · Max 50MB · Private vault upload</div>
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={lbl}>BEAT TITLE</span>
              <input style={input} placeholder="e.g. Midnight Bars" value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div>
              <span style={lbl}>GENRE</span>
              <select style={{ ...input }} value={form.genre} onChange={e => set("genre", e.target.value)} required>
                <option value="">Select…</option>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={lbl}>BPM</span>
              <input style={input} type="number" min="40" max="300" placeholder="140" value={form.bpm} onChange={e => set("bpm", e.target.value)} />
            </div>
            <div>
              <span style={lbl}>KEY</span>
              <input style={input} placeholder="e.g. Cm, F#" value={form.key} onChange={e => set("key", e.target.value)} />
            </div>
          </div>

          <div>
            <span style={lbl}>TAGS (comma-separated)</span>
            <input style={input} placeholder="dark, trap, melody, 808s" value={form.tags} onChange={e => set("tags", e.target.value)} />
          </div>

          {/* License pricing */}
          <div>
            <span style={lbl}>LICENSE PRICING</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {LICENSES.map(lic => (
                <div key={lic.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>{lic.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 12, lineHeight: 1.4 }}>{lic.desc}</div>
                  <input style={{ ...input, fontSize: 11 }} type="number" min="0" placeholder={lic.price.replace("$", "").replace("+", "")}
                    value={lic.id === "basic" ? form.basicPrice : lic.id === "premium" ? form.premiumPrice : form.exclusivePrice}
                    onChange={e => set(`${lic.id}Price`, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Usage flags */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { key: "battleUsable", label: "Usable in battles" },
              { key: "cypherUsable", label: "Usable in cyphers" },
              { key: "enableAuction", label: "Enable auction" },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                <input type="checkbox" checked={!!form[key as keyof typeof form]} onChange={e => set(key, e.target.checked)} style={{ width: 15, height: 15 }} />
                {label}
              </label>
            ))}
          </div>

          {/* Session pool compatibility preview */}
          {preview && (
            <div style={{ borderRadius: 10, border: "1px solid rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.04)", padding: "14px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(255,215,0,0.6)", textTransform: "uppercase", marginBottom: 8 }}>Session Pool Eligibility</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{preview.poolSummary}</div>
              {preview.eligibleSessions.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {preview.eligibleSessions.map(({ slot }) => (
                    <span key={slot.label} style={{ fontSize: 8, fontWeight: 700, padding: "3px 9px", borderRadius: 999, border: "1px solid rgba(255,215,0,0.2)", color: "rgba(255,215,0,0.7)", background: "rgba(255,215,0,0.06)" }}>
                      {slot.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <button type="submit" style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF2DAA)", borderRadius: 10, border: "none", cursor: "pointer" }}>
            SUBMIT TO VAULT
          </button>
        </form>
      </div>
    </main>
  );
}
