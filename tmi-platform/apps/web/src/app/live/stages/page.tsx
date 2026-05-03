"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type StageSnapshot = {
  venueSlug: string;
  active: boolean;
  currentPerformer: { id: string; name: string; genre: string; micHot: boolean; startedAt: number | null } | null;
  queue: { id: string; name: string; genre: string }[];
  rotationCount: number;
  hostMicHot: boolean;
};

const DEMO_VENUES = ["main-stage", "cypher-room", "battle-zone", "concert-hall"];

export default function LiveStagesPage() {
  const [stages, setStages] = useState<StageSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchStages(); }, []);

  async function fetchStages() {
    setLoading(true);
    try {
      const res = await fetch("/api/live/stage");
      const data = await res.json();
      setStages(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load stages");
    } finally {
      setLoading(false);
    }
  }

  async function activateVenueStage(venueSlug: string) {
    setActivating(venueSlug);
    try {
      const res = await fetch("/api/live/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", venueSlug }),
      });
      if (!res.ok) throw new Error("Activate failed");
      await fetchStages();
    } catch {
      setError("Failed to activate stage");
    } finally {
      setActivating(null);
    }
  }

  async function rotateStage(venueSlug: string) {
    setActivating(venueSlug);
    try {
      await fetch("/api/live/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate", venueSlug }),
      });
      await fetchStages();
    } catch {
      setError("Rotation failed");
    } finally {
      setActivating(null);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Live Stages</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Performer rotation, stage activation, host mic control — real time.</p>
        {error && <p style={{ color: "#ff4444", fontSize: 13, marginTop: 8 }}>{error}</p>}
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        {loading && <p style={{ color: "#666" }}>Loading stages...</p>}

        {!loading && stages.length === 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: "#888", marginBottom: 16 }}>No stages initialized. Activate a demo venue:</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DEMO_VENUES.map((v) => (
                <button
                  key={v}
                  onClick={() => activateVenueStage(v)}
                  disabled={activating === v}
                  style={{ background: "#FF2DAA", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                >
                  {activating === v ? "Activating..." : `Activate ${v}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {stages.map((stage) => (
          <div key={stage.venueSlug} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${stage.active ? "#00FF88" : "#333"}`, borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: stage.active ? "#00FF88" : "#555", display: "inline-block", boxShadow: stage.active ? "0 0 10px #00FF88" : "none" }} />
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{stage.venueSlug}</h3>
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: "auto" }}>Rotations: {stage.rotationCount}</span>
            </div>

            {stage.currentPerformer ? (
              <div style={{ background: "rgba(255,45,170,0.08)", border: "1px solid #FF2DAA33", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.1em" }}>ON STAGE</span>
                <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 16 }}>{stage.currentPerformer.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>{stage.currentPerformer.genre} — Mic: {stage.currentPerformer.micHot ? "HOT 🎤" : "off"}</p>
              </div>
            ) : (
              <p style={{ color: "#555", fontSize: 13, marginBottom: 12 }}>No performer on stage</p>
            )}

            {stage.queue.length > 0 && (
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>
                Queue: {stage.queue.map((p) => p.name).join(", ")}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              {!stage.active && (
                <button onClick={() => activateVenueStage(stage.venueSlug)} disabled={activating === stage.venueSlug}
                  style={{ background: "#00FF88", color: "#050510", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                  Activate Stage
                </button>
              )}
              {stage.active && (
                <button onClick={() => rotateStage(stage.venueSlug)} disabled={activating === stage.venueSlug}
                  style={{ background: "#FF2DAA", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                  {activating === stage.venueSlug ? "Rotating..." : "Rotate Performer"}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
