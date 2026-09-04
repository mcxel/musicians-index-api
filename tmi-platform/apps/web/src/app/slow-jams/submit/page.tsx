"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const GENRES = ["R&B", "Neo-Soul", "Quiet Storm", "Slow Jam", "Gospel Ballad", "Jazz", "Chill", "Afro-Soul"];

type PoolStatus = {
  schedule?: { phase: string; label: string; weekKey: string };
  fees?: {
    submitCoinReserve: number;
    chargePolicy: string;
    paidBoostAvailable: boolean;
    paidBoostPriceUsd?: string;
    paidBoostNote: string;
  };
  atmosphere?: { label: string; environment: string };
};

export default function SlowJamsSubmitPage() {
  const [form, setForm] = useState({
    title: "",
    artist: "",
    genre: "",
    bpm: "",
    creditLine: "",
    url: "",
  });
  const [status, setStatus] = useState<PoolStatus | null>(null);
  const [done, setDone] = useState<{ message: string; queuePosition?: number | null; entryId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/slow-jams", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStatus(d as PoolStatus))
      .catch(() => setStatus(null));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/slow-jams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          artistName: form.artist,
          genre: form.genre,
          bpm: form.bpm ? Number(form.bpm) : undefined,
          creditLine: form.creditLine,
          url: form.url,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        entry?: { id?: string; queuePosition?: number | null; scheduledEstimate?: string };
      };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "insufficient_coins"
            ? `Need ${status?.fees?.submitCoinReserve ?? 50} coins reserved (charged only if your track plays Sunday).`
            : data.error === "submit_window_closed"
              ? "Submit window closed — opens Saturday for next Sunday Slow Jams."
              : data.error ?? "Submit failed",
        );
        setLoading(false);
        return;
      }
      setDone({
        message: data.entry?.scheduledEstimate ?? data.message ?? "Queued for Sunday",
        queuePosition: data.entry?.queuePosition,
        entryId: data.entry?.id,
      });
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.4)",
    display: "block",
    marginBottom: 6,
  };

  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🌙</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Sunday Slow Jams Queue</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>{done.message}</p>
          {done.queuePosition != null && (
            <p style={{ fontSize: 11, color: "#AA2DFF", marginBottom: 24 }}>Queue position: #{done.queuePosition}</p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/rooms/slow-jams" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#AA2DFF", textDecoration: "none", borderRadius: 8, padding: "10px 20px" }}>
              SLOW JAMS LOUNGE
            </Link>
            <Link href="/slow-jams/submit" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 20px" }}>
              SUBMIT ANOTHER
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/rooms/slow-jams" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← SUNDAY SLOW JAMS
        </Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800, marginTop: 20, marginBottom: 8 }}>
          🌙 SUNDAY ROTATION · CHILL ONLY
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "0 0 8px" }}>Submit a Slow Song</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
          Separate from World Dance Party — plays all day Sunday ET, then cleared. Soft fades · artist + title overlay.
        </p>
        {status?.schedule && (
          <div style={{ fontSize: 11, color: "#FFD700", marginBottom: 12, padding: "10px 12px", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8 }}>
            {status.schedule.label} · {status.schedule.weekKey}
          </div>
        )}
        {status?.atmosphere && (
          <div style={{ fontSize: 10, color: "rgba(170,45,255,0.85)", marginBottom: 20 }}>
            Venue: {status.atmosphere.label}
          </div>
        )}
        {status?.fees && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 24, lineHeight: 1.6 }}>
            Reserve {status.fees.submitCoinReserve} coins · {status.fees.chargePolicy.replace(/_/g, " ")} · {status.fees.paidBoostNote}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <span style={lbl}>TRACK URL (audio link)</span>
            <input style={input} placeholder="Direct mp3/wav or hosted link" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={lbl}>TITLE</span>
              <input style={input} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <span style={lbl}>ARTIST</span>
              <input style={input} value={form.artist} onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))} required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={lbl}>GENRE</span>
              <select
                style={input}
                value={form.genre}
                onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
              >
                <option value="">Select…</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <span style={lbl}>BPM (optional · keep it slow)</span>
              <input style={input} type="number" min={50} max={100} value={form.bpm} onChange={(e) => setForm((p) => ({ ...p, bpm: e.target.value }))} />
            </div>
          </div>
          <div>
            <span style={lbl}>CREDIT LINE</span>
            <input style={input} placeholder="Artist · Song Title" value={form.creditLine} onChange={(e) => setForm((p) => ({ ...p, creditLine: e.target.value }))} />
          </div>
          {error && <p style={{ color: "#FF4444", fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg,#AA2DFF,#6B5CFF)",
              color: "#fff",
              border: "none",
              padding: "12px 0",
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              borderRadius: 8,
            }}
          >
            {loading ? "Submitting…" : "Enter the Sunday pool"}
          </button>
        </form>
      </div>
    </main>
  );
}
