"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitPitch, type PitchCategory } from "@/lib/writer/EditorialQueueEngine";

const WRITER_ID = "current-writer";

const CATEGORIES: { value: PitchCategory; label: string; icon: string; desc: string }[] = [
  { value: "artist-spotlight",  label: "Artist Spotlight",  icon: "🎤", desc: "Deep-dive on a TMI artist" },
  { value: "performer-feature", label: "Performer Feature", icon: "🎭", desc: "Performer story / career arc" },
  { value: "battle-recap",      label: "Battle Recap",      icon: "⚔️", desc: "Live battle coverage" },
  { value: "culture-news",      label: "Culture & News",    icon: "📰", desc: "Trends, culture, platform news" },
  { value: "interview",         label: "Interview",         icon: "🎙️", desc: "Sit-down Q&A" },
  { value: "review",            label: "Review",            icon: "⭐", desc: "Music, event, or album review" },
  { value: "sponsor-story",     label: "Sponsor Story",     icon: "🤝", desc: "Brand-linked narrative" },
  { value: "editorial",         label: "Editorial",         icon: "✍️", desc: "Opinion / essay" },
];

export default function WriterPitchPage() {
  const router = useRouter();
  const [category,  setCategory]  = useState<PitchCategory>("culture-news");
  const [title,     setTitle]     = useState("");
  const [summary,   setSummary]   = useState("");
  const [refs,      setRefs]      = useState("");
  const [pubDate,   setPubDate]   = useState("");
  const [busy,      setBusy]      = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitted_title, setSubmittedTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || busy) return;
    setBusy(true);
    submitPitch(WRITER_ID, {
      title:    title.trim(),
      summary:  summary.trim(),
      category,
      references: refs ? refs.split(",").map((r) => r.trim()).filter(Boolean) : undefined,
      targetPublicationDate: pubDate || undefined,
    });
    setSubmittedTitle(title.trim());
    setSubmitted(true);
    setBusy(false);
  }

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
          <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900 }}>Pitch Submitted</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            Your pitch for <strong style={{ color: "#FF2DAA" }}>{submitted_title}</strong> is now in the editorial queue.
            You will be notified when an editor reviews it.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => { setSubmitted(false); setTitle(""); setSummary(""); setRefs(""); setPubDate(""); }}
              style={{ padding: "10px 20px", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 9, color: "#FF2DAA", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em" }}
            >
              PITCH ANOTHER
            </button>
            <button
              onClick={() => router.push("/hub/writer/submissions")}
              style={{ padding: "10px 20px", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", border: "none", borderRadius: 9, color: "#fff", fontSize: 11, fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em" }}
            >
              VIEW SUBMISSIONS
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>HUB — WRITER</div>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900 }}>Pitch an Article</h1>
        <p style={{ margin: "0 0 32px", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
          Submit your idea to the TMI editorial desk. Strong pitches have a clear angle, a known subject, and a reason it matters to our audience.
        </p>

        {/* Category picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>CATEGORY</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  background: category === c.value ? "rgba(255,45,170,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${category === c.value ? "#FF2DAA55" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 9,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 14, marginBottom: 3 }}>{c.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: category === c.value ? "#FF2DAA" : "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>{c.label}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>HEADLINE / TITLE *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nova Cipher: The 8-Streak Nobody Saw Coming"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 14, fontWeight: 600, boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>PITCH SUMMARY * (2-4 sentences)</label>
            <textarea
              required
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What is the story? Why does it matter right now? What is the angle?"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>REFERENCES (comma-separated, optional)</label>
              <input
                value={refs}
                onChange={(e) => setRefs(e.target.value)}
                placeholder="nova-cipher, battle-season-2"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>TARGET PUBLISH DATE (optional)</label>
              <input
                type="date"
                value={pubDate}
                onChange={(e) => setPubDate(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, boxSizing: "border-box", colorScheme: "dark" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy || !title.trim() || !summary.trim()}
            style={{
              padding: "13px 24px",
              background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.14em",
              cursor: !title.trim() || !summary.trim() ? "not-allowed" : "pointer",
              opacity: !title.trim() || !summary.trim() ? 0.5 : 1,
              marginTop: 4,
            }}
          >
            {busy ? "SUBMITTING..." : "SUBMIT PITCH"}
          </button>
        </form>
      </div>
    </main>
  );
}
