"use client";

import { useState } from "react";
import Link from "next/link";

export default function WritersSignupPage() {
  const [form, setForm] = useState({ displayName: "", email: "", bio: "", sampleUrl: "" });
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    await fetch("/api/writers/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, level: "new-contributor" }),
    }).catch(() => {});
  }

  const input: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  if (done) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✍️</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Application Received</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.7 }}>
          Your contributor account is pending review. You&apos;ll start as a New Contributor with a trust score of 25. Once approved, submit your first article.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/writers" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 20px" }}>WRITER HUB</Link>
          <Link href="/writers/submit" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#FFD700", textDecoration: "none", borderRadius: 8, padding: "10px 20px" }}>SUBMIT ARTICLE</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/writers" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← WRITERS</Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginTop: 20, marginBottom: 8 }}>CONTRIBUTOR SIGNUP</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "0 0 8px" }}>Join as a Writer</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>
          Start as a New Contributor. Earn $6/article base. Rise to Trusted Editor and unlock approval rights + higher pay.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <span style={lbl}>DISPLAY NAME</span>
            <input style={input} placeholder="How your name appears on articles" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} required />
          </div>
          <div>
            <span style={lbl}>EMAIL</span>
            <input style={input} type="email" placeholder="For payout and notification" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <span style={lbl}>BIO (optional)</span>
            <textarea style={{ ...input, resize: "vertical", minHeight: 80 } as React.CSSProperties} placeholder="Brief intro — music focus, beats covered, etc." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
          <div>
            <span style={lbl}>WRITING SAMPLE URL (optional)</span>
            <input style={input} type="url" placeholder="https://..." value={form.sampleUrl} onChange={e => setForm(p => ({ ...p, sampleUrl: e.target.value }))} />
          </div>

          <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 10, padding: "14px 16px", fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 6 }}>Trust Score System</div>
            New contributors start at trust 25. Approved articles raise your score. Rejected or flagged content lowers it. Reach trust 60 to unlock Verified Contributor status.
          </div>

          <button type="submit" style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 10, border: "none", cursor: "pointer" }}>
            APPLY AS CONTRIBUTOR
          </button>
        </form>
      </div>
    </main>
  );
}
