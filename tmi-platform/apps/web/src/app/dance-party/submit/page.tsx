"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const GENRES = ["Hip-Hop", "Afrobeats", "R&B", "Dance Hall", "House", "Trap", "EDM", "Latin", "Gospel", "Drill"];

type PoolStatus = {
  schedule?: { phase: string; label: string; weekKey: string };
  fees?: {
    submitCoinReserve: number;
    chargePolicy: string;
    paidBoostAvailable: boolean;
    paidBoostPriceUsd?: string;
    paidBoostNote: string;
  };
};

export default function DancePartySubmitPage() {
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
    fetch("/api/world-dance-party", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStatus(d as PoolStatus))
      .catch(() => setStatus(null));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/world-dance-party", {
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
            ? `Need ${status?.fees?.submitCoinReserve ?? 50} coins reserved (charged only if your track plays Friday).`
            : data.error === "submit_window_closed"
              ? "Submit window closed for this Friday — opens Saturday for next week."
              : data.error ?? "Submit failed",
        );
        setLoading(false);
        return;
      }
      setDone({
        message: data.entry?.scheduledEstimate ?? data.message ?? "Queued for Friday",
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
          <div style={{ fontSize: 52, marginBottom: 16 }}>🌍</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>World Dance Party Queue</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>{done.message}</p>
          {done.queuePosition != null && (
            <p style={{ fontSize: 11, color: "#00FF88", marginBottom: 24 }}>Queue position: #{done.queuePosition}</p>
          )}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
            Points finalize only when DJ Record Ralph plays your track on Friday. Overflow tracks are refunded.
          </p>
          {status?.fees?.paidBoostAvailable && done.entryId && (
            <a
              href={`/api/stripe/checkout?type=wdp_submission_boost&roomId=world-dance-party&category=world_dance_party&wdpEntryId=${encodeURIComponent(done.entryId)}`}
              style={{
                display: "inline-block",
                fontSize: 10,
                fontWeight: 800,
                color: "#050510",
                background: "linear-gradient(90deg, #FFD700, #FF2DAA)",
                textDecoration: "none",
                borderRadius: 8,
                padding: "10px 20px",
                marginBottom: 16,
              }}
            >
              BOOST VISIBILITY · ${status.fees.paidBoostPriceUsd ?? "1.99"} (24h priority band)
            </a>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/rooms/world-dance-party" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FF88", textDecoration: "none", borderRadius: 8, padding: "10px 20px" }}>
              WORLD DANCE PARTY
            </Link>
            <Link href="/dance-party/submit" style={{ fontSize: 10, fontWeight: 800, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: "10px 20px" }}>
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
        <Link href="/rooms/world-dance-party" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← WORLD DANCE PARTY
        </Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FF88", fontWeight: 800, marginTop: 20, marginBottom: 8 }}>
          🌍 OFFICIAL FRIDAY ROTATION
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "0 0 8px" }}>Submit for World Dance Party</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
          Weekly pool only — plays Friday, then cleared. DJ Record Ralph rotates approved tracks with on-screen artist + title credit.
        </p>
        {status?.schedule && (
          <div style={{ fontSize: 11, color: "#00FFFF", marginBottom: 20, padding: "10px 12px", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8 }}>
            {status.schedule.label} · {status.schedule.weekKey}
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
              <span style={lbl}>TRACK TITLE</span>
              <input style={input} placeholder="Midnight Wave" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <span style={lbl}>ARTIST NAME</span>
              <input style={input} placeholder="Your artist name" value={form.artist} onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={lbl}>GENRE</span>
              <select style={{ ...input }} value={form.genre} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))} required>
                <option value="">Select…</option>
                {GENRES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <span style={lbl}>BPM (optional)</span>
              <input style={input} type="number" min="60" max="200" placeholder="120" value={form.bpm} onChange={(e) => setForm((p) => ({ ...p, bpm: e.target.value }))} />
            </div>
          </div>

          <div>
            <span style={lbl}>ON-SCREEN CREDIT LINE</span>
            <input style={input} placeholder="Produced by You · © 2026" value={form.creditLine} onChange={(e) => setForm((p) => ({ ...p, creditLine: e.target.value }))} required />
          </div>

          {error && <p style={{ color: "#FF4466", fontSize: 12, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 0",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#050510",
              background: "linear-gradient(135deg,#00FF88,#00FFFF)",
              borderRadius: 10,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "SUBMITTING…" : "SUBMIT TO FRIDAY POOL"}
          </button>
        </form>
      </div>
    </main>
  );
}
