"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { id: "news", label: "TMI News" },
  { id: "artist", label: "Artist Spotlight" },
  { id: "performer", label: "Performer Feature" },
  { id: "interview", label: "TMI Interview" },
  { id: "sponsor", label: "Partner Feature" },
];

export default function WritersSubmitPage() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "",
    sourceUrls: "",
    artistSlug: "",
    sponsorSlug: "",
  });
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    await fetch("/api/editorial/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        sourceUrls: form.sourceUrls.split("\n").map(u => u.trim()).filter(Boolean),
      }),
    }).catch(() => {});
  }

  const input: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  if (done) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>📝</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Article Submitted</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.7 }}>
          Your article is in the review queue. Trusted editors will validate sources and safety. Once approved it enters TMI Magazine rotation with your credit displayed.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/writers/dashboard" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 20px" }}>MY DASHBOARD</Link>
          <Link href="/magazine" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#FFD700", textDecoration: "none", borderRadius: 8, padding: "10px 20px" }}>VIEW MAGAZINE</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/writers" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← WRITERS</Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginTop: 20, marginBottom: 8 }}>ARTICLE SUBMISSION</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "0 0 8px" }}>Submit an Article</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>
          Sources are required. All submissions pass safety review before entering the queue. Trust score updates on approval or rejection.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <span style={lbl}>ARTICLE TITLE</span>
            <input style={input} placeholder="e.g. Ray Journey Drops Surprise EP at TMI Cypher" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>

          <div>
            <span style={lbl}>CATEGORY</span>
            <select style={{ ...input }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <span style={lbl}>ARTICLE BODY</span>
            <textarea
              style={{ ...input, resize: "vertical", minHeight: 260, lineHeight: 1.7 } as React.CSSProperties}
              placeholder="Write your article here. Minimum 200 words. Use line breaks to separate paragraphs."
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              required
            />
          </div>

          <div>
            <span style={lbl}>SOURCE URLS (one per line)</span>
            <textarea
              style={{ ...input, resize: "vertical", minHeight: 80 } as React.CSSProperties}
              placeholder={"https://example.com/source\nhttps://another-source.com"}
              value={form.sourceUrls}
              onChange={e => setForm(p => ({ ...p, sourceUrls: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={lbl}>ARTIST SLUG (optional)</span>
              <input style={input} placeholder="e.g. ray-journey" value={form.artistSlug} onChange={e => setForm(p => ({ ...p, artistSlug: e.target.value }))} />
            </div>
            <div>
              <span style={lbl}>SPONSOR SLUG (optional)</span>
              <input style={input} placeholder="e.g. brand-name" value={form.sponsorSlug} onChange={e => setForm(p => ({ ...p, sponsorSlug: e.target.value }))} />
            </div>
          </div>

          <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.10)", borderRadius: 10, padding: "14px 16px", fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            By submitting, you confirm all sources are accurate and the content is your original work or properly attributed. Submissions with low trust scores, flagged safety content, or invalid sources are automatically rejected.
          </div>

          <button
            type="submit"
            disabled={!form.title || !form.category || form.body.trim().split(/\s+/).length < 50}
            style={{
              padding: "14px 0",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: (!form.title || !form.category || form.body.trim().split(/\s+/).length < 50) ? "rgba(255,255,255,0.3)" : "#050510",
              background: (!form.title || !form.category || form.body.trim().split(/\s+/).length < 50) ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#FFD700,#FF9500)",
              borderRadius: 10,
              border: "none",
              cursor: (!form.title || !form.category || form.body.trim().split(/\s+/).length < 50) ? "not-allowed" : "pointer",
            }}
          >
            SUBMIT TO REVIEW QUEUE
          </button>
        </form>
      </div>
    </main>
  );
}
