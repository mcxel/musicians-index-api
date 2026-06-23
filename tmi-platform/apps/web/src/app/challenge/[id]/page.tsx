"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const SEED: Record<string, { title: string; host: string; genre: string; prize: string; emoji: string; color: string; rules: string[]; entries: { name: string; votes: number; preview: string }[] }> = {
  ch1: { title: "Beat the Beat", host: "Wavetek", genre: "Hip-Hop", prize: "$500 + Crown Points", emoji: "🎤", color: "#FF2DAA",
    rules: ["Submit one original track (2–4 min)", "No samples — original beats only", "Any rap style welcome", "Submissions close at midnight", "Winner selected by community vote + judges"],
    entries: [{ name: "Bar God", votes: 441, preview: "🎵" }, { name: "FlowMaster", votes: 319, preview: "🎶" }, { name: "Krypt", votes: 287, preview: "🔥" }] },
  ch5: { title: "Open Bars — No Rules", host: "Bar God", genre: "Open", prize: "$1000 + Crown", emoji: "⚔️", color: "#00FFFF",
    rules: ["Any genre", "Any format — audio, video, or live", "No word restrictions", "Community vote determines winner", "Panel of 3 judges reserve 20% weight"],
    entries: [{ name: "Wavetek", votes: 834, preview: "🎤" }, { name: "Nova Cipher", votes: 711, preview: "👑" }, { name: "Verse Knight", votes: 502, preview: "⚡" }] },
};

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "ch1";
  const ch = SEED[id] ?? SEED["ch1"];

  const [voted, setVoted] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const performerNameRef = useRef<HTMLInputElement>(null);
  // Stable guest voter ID for rate-limiting (session only)
  const voterIdRef = useRef(`guest-${Math.random().toString(36).slice(2, 10)}`);

  async function handleVote(name: string) {
    if (voted) return;
    setVoted(name);
    setVoteError(null);
    try {
      const res = await fetch("/api/rooms/challenges/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: id,
          voterId: voterIdRef.current,
          contestantId: name,
          weight: 1,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setVoteError(data.error ?? "Vote failed. Try again.");
        setVoted(null);
      }
    } catch {
      setVoteError("Could not reach vote server. Your vote was not recorded.");
      setVoted(null);
    }
  }

  async function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    setSubmitError(null);
    const performerName = performerNameRef.current?.value?.trim() ?? "";
    try {
      const res = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "live",
          genre: ch?.genre ?? "Hip-Hop",
          title: performerName ? `${performerName} — ${ch?.title ?? "Challenge Entry"}` : (ch?.title ?? "Challenge Entry"),
          opponentSlug: id,
          pointsWager: 0,
        }),
      });
      const data = await res.json() as { ok?: boolean; challengeId?: string; error?: string };
      if (data.ok) {
        router.push("/challenge?submitted=1");
      } else {
        setSubmitError(data.error ?? "Submission failed. Try again.");
        setSubmitted(false);
      }
    } catch {
      setSubmitError("Could not reach submission server. Try again.");
      setSubmitted(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "11px 20px", display: "flex", gap: 14, alignItems: "center", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/challenge" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Challenges</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 16px" }}>
        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${ch.color}12, rgba(5,5,16,0.98))`, border: `1px solid ${ch.color}33`, borderRadius: 18, padding: "28px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{ch.emoji}</div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ch.color, fontWeight: 800, marginBottom: 6 }}>{ch.genre} CHALLENGE</div>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 900 }}>{ch.title}</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>Hosted by <span style={{ color: ch.color, fontWeight: 700 }}>{ch.host}</span></div>
          <div style={{ fontSize: 14, color: "#FFD700", fontWeight: 800 }}>🏆 Prize: {ch.prize}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Rules */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>RULES</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {ch.rules.map((r, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: ch.color, fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>{r}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ch.color}22`, borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: ch.color, marginBottom: 12 }}>SUBMIT YOUR ENTRY</div>
            <div
              onClick={() => setFileLabel("my_track.mp3")}
              style={{ border: `2px dashed ${ch.color}44`, borderRadius: 10, padding: "24px 16px", textAlign: "center", marginBottom: 14, cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 12 }}
            >
              {fileLabel ? `✓ ${fileLabel}` : "Click to upload your track (MP3/WAV/MP4)"}
            </div>
            <input ref={performerNameRef} placeholder="Your performer name…" style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: `1px solid ${ch.color}33`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
            {submitError && (
              <div style={{ fontSize: 10, color: "#E63000", marginBottom: 8 }}>{submitError}</div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!fileLabel || submitted}
              style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: fileLabel && !submitted ? ch.color : "rgba(255,255,255,0.08)", color: fileLabel && !submitted ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 900, fontSize: 12, cursor: fileLabel && !submitted ? "pointer" : "not-allowed", letterSpacing: "0.08em" }}
            >
              {submitted ? "SUBMITTED ✓" : "SUBMIT ENTRY →"}
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>CURRENT LEADERBOARD</div>
          {voteError && (
            <div style={{ fontSize: 10, color: "#E63000", marginBottom: 10 }}>{voteError}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ch.entries.map((e, i) => (
              <div key={e.name} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", background: i === 0 ? `${ch.color}0D` : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? ch.color + "44" : "rgba(255,255,255,0.07)"}`, borderRadius: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? "#FFD700" : "rgba(255,255,255,0.35)", minWidth: 28 }}>#{i + 1}</span>
                <span style={{ fontSize: 24 }}>{e.preview}</span>
                <span style={{ flex: 1, fontWeight: i === 0 ? 900 : 700, fontSize: 14 }}>{e.name}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: i === 0 ? ch.color : "#fff" }}>{e.votes.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>VOTES</div>
                </div>
                <button
                  onClick={() => handleVote(e.name)}
                  disabled={!!voted}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: voted === e.name ? ch.color : "rgba(255,255,255,0.08)", color: voted === e.name ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 10, cursor: voted ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
                >
                  {voted === e.name ? "VOTED ✓" : "VOTE"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
