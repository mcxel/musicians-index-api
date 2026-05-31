"use client";

import { useState } from "react";
import Link from "next/link";

const GENRES = ["Hip-Hop","R&B","EDM","Trap","Afrobeats","Neo-Soul","House","Jazz","Pop","Drill","Reggaeton","Dance"];

export default function NewGroupPage() {
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [privacy, setPrivacy]   = useState<"public"|"private">("public");
  const [genres, setGenres]     = useState<string[]>([]);
  const [created, setCreated]   = useState(false);

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 5 ? [...prev, g] : prev);

  if (created) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🏠</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#AA2DFF" }}>Group Created!</h2>
          <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>"{name}" is live. Invite your crew to join.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/home/3" style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.35)", color: "#AA2DFF", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              LIVE WORLD
            </Link>
            <Link href="/groups/new" onClick={() => { setName(""); setDesc(""); setGenres([]); setCreated(false); }} style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              CREATE ANOTHER
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(170,45,255,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#AA2DFF", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Groups</span>
        <span style={{ fontSize: 11, color: "#AA2DFF", fontWeight: 700 }}>Create Group</span>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 6 }}>COMMUNITY</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Create a Group</h1>
        </div>

        {/* Cover placeholder */}
        <div style={{ width: "100%", height: 120, borderRadius: 12, background: "linear-gradient(135deg, rgba(170,45,255,0.2), rgba(5,5,16,0.8))", border: "2px dashed rgba(170,45,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, cursor: "pointer", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 28 }}>🖼️</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>UPLOAD COVER IMAGE</span>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 8 }}>GROUP NAME</label>
          <input type="text" placeholder="e.g. Beat Makers Circle" value={name} onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 8 }}>DESCRIPTION</label>
          <textarea placeholder="What's this group about?" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>

        {/* Genres */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 8 }}>GENRES (up to 5)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {GENRES.map((g) => {
              const on = genres.includes(g);
              return (
                <button key={g} onClick={() => toggleGenre(g)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                  background: on ? "rgba(170,45,255,0.2)" : "rgba(255,255,255,0.04)",
                  outline: on ? "1.5px solid rgba(170,45,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  color: on ? "#AA2DFF" : "rgba(255,255,255,0.5)",
                }}>{g}</button>
              );
            })}
          </div>
        </div>

        {/* Privacy */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 10 }}>PRIVACY</label>
          <div style={{ display: "flex", gap: 10 }}>
            {(["public","private"] as const).map((p) => (
              <button key={p} onClick={() => setPrivacy(p)} style={{
                flex: 1, padding: "12px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none",
                background: privacy === p ? "rgba(170,45,255,0.15)" : "rgba(255,255,255,0.04)",
                outline: privacy === p ? "1.5px solid rgba(170,45,255,0.45)" : "1px solid rgba(255,255,255,0.08)",
                color: privacy === p ? "#AA2DFF" : "rgba(255,255,255,0.4)",
              }}>
                {p === "public" ? "🌍 Public" : "🔒 Private"}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => name && setCreated(true)} disabled={!name}
          style={{
            width: "100%", padding: "15px", borderRadius: 12, fontSize: 14, fontWeight: 900, letterSpacing: "0.1em", border: "none",
            cursor: name ? "pointer" : "not-allowed",
            background: name ? "linear-gradient(135deg, #AA2DFF, #FF2DAA)" : "rgba(255,255,255,0.06)",
            color: name ? "#fff" : "rgba(255,255,255,0.2)",
          }}>
          🏠 CREATE GROUP
        </button>
      </div>
    </main>
  );
}
