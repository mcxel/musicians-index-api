"use client";
import { useState } from "react";
import Link from "next/link";

export default function SettingsProfilePage() {
  const [form, setForm] = useState({ displayName: "", bio: "", genre: "", instagram: "", twitter: "", website: "" });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Settings</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>SETTINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 32px" }}>Edit Profile</h1>

        <div style={{ display: "grid", gap: 14 }}>
          {([
            ["displayName", "Display Name", "text", "Nova Cipher"],
            ["genre", "Genre(s)", "text", "Hip-Hop, Cypher, R&B"],
            ["instagram", "Instagram", "text", "@yourhandle"],
            ["twitter", "X / Twitter", "text", "@yourhandle"],
            ["website", "Website", "url", "https://yoursite.com"],
          ] as [keyof typeof form, string, string, string][]).map(([k, label, type, ph]) => (
            <div key={k}>
              <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>{label}</label>
              <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>Bio</label>
            <textarea value={form.bio} onChange={set("bio")} placeholder="Tell the world who you are..." rows={4}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button onClick={() => setSaved(true)} style={{ padding: "11px 28px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontWeight: 800, fontSize: 13, cursor: "pointer", border: "none" }}>Save Profile</button>
          <Link href="/avatar-builder" style={{ padding: "11px 20px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Edit Avatar</Link>
        </div>
        {saved && <div style={{ marginTop: 12, fontSize: 12, color: "#22c55e" }}>✓ Profile saved.</div>}
      </div>
    </main>
  );
}
