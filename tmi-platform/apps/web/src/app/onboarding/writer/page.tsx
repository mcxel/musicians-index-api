"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingWriterPage() {
  const router = useRouter();
  const [topics, setTopics] = useState("");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const getCsrfToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
      const data = (await res.json()) as { csrfToken?: string };
      return data?.csrfToken ?? null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const csrf = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrf) headers["X-CSRF-Token"] = csrf;

      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ role: "WRITER", topics, expertise, bio }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        setMessage(`Setup failed (${res.status})${err?.message ? ": " + err.message : ""}`);
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 15,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "system-ui, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    marginBottom: 6,
    color: "rgba(255,255,255,0.7)",
    fontWeight: 500,
  };

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => router.replace("/dashboard/writer"), 2200);
      return () => clearTimeout(t);
    }
  }, [done, router]);

  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✍️</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#00C8FF", marginBottom: 8 }}>Welcome to the Press Deck</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Your writer profile is live. Start covering artists, battles, and live events — your byline is ready.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.replace("/magazine")} style={{ padding: "10px 20px", background: "rgba(0,200,255,0.12)", color: "#00C8FF", border: "1px solid rgba(0,200,255,0.3)", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              Go to Magazine →
            </button>
            <button onClick={() => router.replace("/dashboard/writer")} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              My Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "60px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ fontSize: 12, letterSpacing: 2, color: "#00C8FF", textTransform: "uppercase", marginBottom: 8 }}>
          The Musician&apos;s Index
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px" }}>Writer Setup</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 36, fontSize: 15 }}>
          Tell us what you cover so we can connect you with the right beats, battles, and stories.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Topics You Cover (comma-separated)</label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Hip-Hop, Battle Rap, Live Events, Artist Profiles"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Areas of Expertise</label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Music journalism, Reviews, Interviews"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Writer Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Introduce yourself to artists and readers…"
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          <div style={{ background: "rgba(0,200,255,0.07)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#00C8FF", fontWeight: 800, marginBottom: 6 }}>
              📰 PRESS PASS INCLUDED
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
              Get backstage access to artist profiles, battle results, and live event data.
              Your articles appear in the TMI Magazine and earn XP per read.
            </div>
          </div>

          {message && (
            <div style={{ padding: "10px 14px", background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.3)", borderRadius: 8, fontSize: 13, color: "#ff8888" }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: "13px 24px",
              background: busy ? "rgba(0,200,255,0.2)" : "#00C8FF",
              color: busy ? "rgba(255,255,255,0.5)" : "#000",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Setting up…" : "Activate My Press Pass →"}
          </button>
        </form>
      </div>
    </main>
  );
}
