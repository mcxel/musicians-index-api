"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type QueueSlot = {
  slotId: string;
  performerId: string;
  performerName: string;
  priority: number;
  status: string;
  boostedAt: number | null;
};

type QueueSnapshot = {
  venueSlug: string;
  paused: boolean;
  count: number;
  slots: QueueSlot[];
};

const STATUS_COLOR: Record<string, string> = { "waiting": "#aaa", "next-up": "#FFD700", "on-stage": "#00FF88", "done": "#555" };

export default function VenueQueuePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [queue, setQueue] = useState<QueueSnapshot | null>(null);
  const [performerId, setPerformerId] = useState("");
  const [performerName, setPerformerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { fetchQueue(); }, [slug]);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/queue?venue=${slug}`);
      setQueue(await res.json());
    } catch {
      setMsg("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  async function queueAction(action: string, extra: Record<string, unknown> = {}) {
    try {
      await fetch("/api/live/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, venueSlug: slug, ...extra }),
      });
      setMsg(`${action} completed`);
      await fetchQueue();
    } catch {
      setMsg("Action failed");
    }
  }

  async function joinQueue(e: React.FormEvent) {
    e.preventDefault();
    if (!performerId || !performerName) return;
    await queueAction("join", { performerId, performerName, priority: 5 });
    setPerformerId("");
    setPerformerName("");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <Link href={`/venues/${slug}/live`} style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Venue Live"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>{slug} — Queue</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Performer queue for this venue. Join, boost, advance, remove.</p>
      </section>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>
        {msg && <p style={{ color: "#00FF88", fontSize: 13, marginBottom: 16 }}>{msg}</p>}

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => queueAction("advance")}
            style={{ background: "#FF2DAA", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
            Advance Queue
          </button>
          <button onClick={() => queueAction(queue?.paused ? "resume" : "pause")}
            style={{ background: "#333", color: queue?.paused ? "#00FF88" : "#FFD700", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
            {queue?.paused ? "Resume" : "Pause"}
          </button>
        </div>

        {loading && <p style={{ color: "#666" }}>Loading queue...</p>}
        {queue && !loading && (
          <>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>{queue.count} performers queued — {queue.paused ? "PAUSED" : "ACTIVE"}</div>
            {queue.slots.map((slot) => (
              <div key={slot.slotId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 8, border: `1px solid ${STATUS_COLOR[slot.status] ?? "#333"}33` }}>
                <span style={{ color: STATUS_COLOR[slot.status], fontWeight: 800, fontSize: 11, width: 76 }}>{slot.status.toUpperCase()}</span>
                <span style={{ fontWeight: 700, flex: 1 }}>{slot.performerName}</span>
                {slot.boostedAt && <span style={{ fontSize: 11, color: "#FFD700" }}>BOOSTED</span>}
                <button onClick={() => queueAction("boost", { performerId: slot.performerId })}
                  style={{ background: "#FFD70022", color: "#FFD700", border: "1px solid #FFD70033", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Boost</button>
                <button onClick={() => queueAction("remove", { performerId: slot.performerId })}
                  style={{ background: "#ff444422", color: "#ff4444", border: "1px solid #ff444433", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Remove</button>
              </div>
            ))}
          </>
        )}

        <form onSubmit={joinQueue} style={{ marginTop: 28, background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "22px 26px" }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Join Queue</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
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
          </div>
          <button type="submit" disabled={!performerId || !performerName}
            style={{ background: "#FFD700", color: "#050510", border: "none", borderRadius: 8, padding: "9px 22px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            Join Queue
          </button>
        </form>
      </section>
    </main>
  );
}
