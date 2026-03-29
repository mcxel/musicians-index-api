"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingFanPage() {
  const router = useRouter();
  const [favoriteGenres, setFavoriteGenres] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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
        router.replace("/dashboard/fan");
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
