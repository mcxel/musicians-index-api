"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AutoFanWelcomeMessage from "@/components/onboarding/AutoFanWelcomeMessage";

export default function OnboardingFanPage() {
  const router = useRouter();
  const [favoriteGenres, setFavoriteGenres] = useState("");
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
        body: JSON.stringify({ role: "USER" }),
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
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    marginBottom: 6,
    color: "rgba(255,255,255,0.7)",
    fontWeight: 500,
  };

  if (done) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <AutoFanWelcomeMessage displayName="" />
          <button onClick={() => router.replace('/dashboard/fan')} style={{ padding: '10px 24px', background: 'rgba(0,255,255,0.12)', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            Go to My Dashboard →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#fff",
        padding: "60px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Brand header */}
        <p style={{ fontSize: 12, letterSpacing: 2, color: "#ff6b35", textTransform: "uppercase", marginBottom: 8 }}>
          The Musician&apos;s Index
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px" }}>
          Fan Setup
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 36, fontSize: 15 }}>
          Tell us what you love so we can personalize your experience.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div>
            <label style={labelStyle}>Favorite Genres (comma-separated)</label>
            <input
              type="text"
              value={favoriteGenres}
              onChange={(e) => setFavoriteGenres(e.target.value)}
              placeholder="e.g. Hip-Hop, R&B, Jazz"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself…"
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 6 }}>
              🚀 LAUNCH BONUS — DOUBLE XP ON ALL INVITES
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              Invite a fan or performer who joins free → <strong style={{ color: '#FFD700' }}>1,000 XP</strong><br />
              They upgrade to a paid tier → up to <strong style={{ color: '#FFD700' }}>5,000 XP</strong> per invite
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: "13px 24px",
              background: busy ? "rgba(255,107,53,0.35)" : "#ff6b35",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer",
              letterSpacing: 0.3,
            }}
          >
            {busy ? "Setting up your profile…" : "Continue as Fan →"}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 20, color: "#fbbf24", fontSize: 14, lineHeight: 1.5 }}>{message}</p>
        ) : null}
      </div>
    </main>
  );
}
