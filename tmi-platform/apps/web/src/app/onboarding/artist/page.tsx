"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingArtistPage() {
  const router = useRouter();
  const [artistName, setArtistName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [genres, setGenres] = useState("");
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

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (!res.ok) { router.replace("/auth?next=/onboarding"); return; }
        const data = await res.json() as { authenticated?: boolean; user?: { role?: string } };
        if (!data.authenticated) { router.replace("/auth?next=/onboarding"); return; }
        const role = (data.user?.role ?? "user").toLowerCase();
        if (role !== "user" && role !== "artist") {
          router.replace("/onboarding");
        }
      } catch { /* stay */ }
    };
    void check();
  }, [router]);

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
        body: JSON.stringify({ role: "ARTIST" }),
      });

      if (res.ok) {
        router.replace("/dashboard/artist");
      } else {
        const err = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
        setMessage(`Setup failed (${res.status})${err?.error ?? err?.message ? ": " + (err.error ?? err.message) : ""}`);
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
        <p style={{ fontSize: 12, letterSpacing: 2, color: "#FF2DAA", textTransform: "uppercase", marginBottom: 8 }}>
          The Musician&apos;s Index
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px" }}>Artist Setup</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 36, fontSize: 15 }}>
          Tell us about your artistry to complete your profile.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div>
            <label htmlFor="artist-name" style={labelStyle}>Artist name</label>
            <input
              id="artist-name"
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Your artist name"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="short-bio" style={labelStyle}>Short bio</label>
            <textarea
              id="short-bio"
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="Describe your sound and style…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={labelStyle}>Genres (comma-separated)</label>
            <input
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="e.g. Hip-Hop, R&B, Soul"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: "13px 24px",
              background: busy ? "rgba(255,45,170,0.35)" : "#FF2DAA",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Setting up your stage…" : "Save and continue"}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 20, color: "#fbbf24", fontSize: 14, lineHeight: 1.5 }}>{message}</p>
        ) : null}
      </div>
    </main>
  );
}
