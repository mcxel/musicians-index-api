"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type QueueSlot = {
  slotId: string;
  performerId: string;
  performerName: string;
  priority: number;
  status: string;
  requestedAt: number;
  boostedAt: number | null;
};

type QueueSnapshot = {
  venueSlug: string;
  paused: boolean;
  count: number;
  maxSlots: number;
  slots: QueueSlot[];
};

const STATUS_COLOR: Record<string, string> = {
  "waiting": "#aaa",
  "next-up": "#FFD700",
  "staging": "#FF8C00",
  "on-stage": "#00FF88",
  "done": "#555",
};

export default function LiveQueuePage() {
  const [queue, setQueue] = useState<QueueSnapshot | null>(null);
  const [venueSlug, setVenueSlug] = useState("main-stage");
  const [performerId, setPerformerId] = useState("");
  const [performerName, setPerformerName] = useState("");
  const [priority, setPriority] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchQueue(); }, [venueSlug]);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/queue?venue=${venueSlug}`);
      setQueue(await res.json());
    } catch {
      setMsg("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  async function queueAction(action: string, extra: Record<string, unknown> = {}) {
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/live/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, venueSlug, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
      setMsg(`Action "${action}" completed.`);
      await fetchQueue();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function joinQueue(e: React.FormEvent) {
    e.preventDefault();
    if (!performerId || !performerName) return;
    await queueAction("join", { performerId, performerName, priority });
    setPerformerId("");
    setPerformerName("");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Performer Queue</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Live queue management — join, boost, advance, pause.</p>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
          <select
            value={venueSlug}
            onChange={(e) => setVenueSlug(e.target.value)}
            style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 14 }}
          >
            {["main-stage","cypher-room","battle-zone","concert-hall"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          {queue && (
            <span style={{ fontSize: 13, color: "#aaa" }}>{queue.count}/{queue.maxSlots} slots — {queue.paused ? "PAUSED" : "ACTIVE"}</span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onClick={() => queueAction("pause")} disabled={submitting}
              style={{ background: "#333", color: "#FFD700", border: "none", borderRadius: 6, padding: "7px 14px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
              Pause
            </button>
            <button onClick={() => queueAction("resume")} disabled={submitting}
              style={{ background: "#333", color: "#00FF88", border: "none", borderRadius: 6, padding: "7px 14px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
              Resume
            </button>
            <button onClick={() => queueAction("advance")} disabled={submitting}
              style={{ background: "#FF2DAA", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
              Advance
            </button>
          </div>
        </div>

        {msg && <p style={{ color: "#00FF88", fontSize: 13, marginBottom: 16 }}>{msg}</p>}

        {loading ? (
          <p style={{ color: "#666" }}>Loading queue...</p>
        ) : queue && queue.slots.length > 0 ? (
          <div style={{ marginBottom: 32 }}>
            {queue.slots.map((slot) => (
              <div key={slot.slotId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 8, border: `1px solid ${STATUS_COLOR[slot.status] ?? "#333"}33` }}>
                <span style={{ color: STATUS_COLOR[slot.status], fontWeight: 800, fontSize: 11, width: 80, letterSpacing: "0.06em" }}>{slot.status.toUpperCase()}</span>
                <span style={{ fontWeight: 700, flex: 1 }}>{slot.performerName}</span>
                <span style={{ fontSize: 12, color: "#666" }}>P{slot.priority}</span>
                {slot.boostedAt && <span style={{ fontSize: 11, color: "#FFD700" }}>BOOSTED</span>}
                <button
                  onClick={() => queueAction("boost", { performerId: slot.performerId })}
                  disabled={submitting}
                  style={{ background: "#FFD70022", color: "#FFD700", border: "1px solid #FFD70044", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                >
                  Boost
                </button>
                <button
                  onClick={() => queueAction("remove", { performerId: slot.performerId })}
                  disabled={submitting}
                  style={{ background: "#ff444422", color: "#ff4444", border: "1px solid #ff444444", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#555", marginBottom: 32 }}>Queue is empty. Join below to test.</p>
        )}

        <form onSubmit={joinQueue} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "24px 28px" }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Join Queue</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>Performer ID</label>
              <input value={performerId} onChange={(e) => setPerformerId(e.target.value)} placeholder="perf-001"
                style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>Name</label>
              <input value={performerName} onChange={(e) => setPerformerName(e.target.value)} placeholder="Wavetek"
                style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>Priority</label>
              <input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} min={1} max={10}
                style={{ width: 60, background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13 }} />
            </div>
          </div>
          <button type="submit" disabled={submitting || !performerId || !performerName}
            style={{ marginTop: 16, background: "#FFD700", color: "#050510", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
            {submitting ? "Joining..." : "Join Queue"}
          </button>
        </form>
      </section>
    </main>
  );
}
