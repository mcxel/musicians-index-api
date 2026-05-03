"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type GreenRoomSlot = {
  performerId: string;
  performerName: string;
  status: string;
  techCheckPassed: boolean;
  notes: string;
};

type GreenRoom = {
  venueSlug: string;
  open: boolean;
  slots: GreenRoomSlot[];
  capacity: number;
};

export default function GreenRoomPage() {
  const [room, setRoom] = useState<GreenRoom | null>(null);
  const [venueSlug, setVenueSlug] = useState("main-stage");
  const [performerId, setPerformerId] = useState("");
  const [performerName, setPerformerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/live/stage?venue=${venueSlug}`)
      .then((r) => r.json())
      .then((d) => {
        // Synthesize a green room view from stage state
        setRoom({ venueSlug, open: d.active ?? true, slots: [], capacity: 10 });
      })
      .catch(() => setRoom({ venueSlug, open: true, slots: [], capacity: 10 }));
  }, [venueSlug]);

  async function handleEnterRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!performerId || !performerName) return;
    setSubmitting(true);
    setMsg(null);
    try {
      // Add performer to stage queue (green room feeds into stage queue)
      const res = await fetch("/api/live/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-performer",
          venueSlug,
          performer: { id: performerId, name: performerName, genre: "Live", slotDurationSec: 300 },
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setMsg(`${performerName} entered green room and joined stage queue.`);
      setPerformerId("");
      setPerformerName("");
    } catch {
      setMsg("Failed to enter green room.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Green Room</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Performer warmup, tech check, and pre-stage briefing area.</p>
      </section>

      <section style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Venue</label>
          <select
            value={venueSlug}
            onChange={(e) => setVenueSlug(e.target.value)}
            style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 14 }}
          >
            {["main-stage","cypher-room","battle-zone","concert-hall"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid #00FF8833", borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#00FF88", marginBottom: 16 }}>
            {room ? (room.open ? "GREEN ROOM OPEN" : "GREEN ROOM CLOSED") : "LOADING..."}
          </h2>
          {room && (
            <p style={{ fontSize: 13, color: "#aaa" }}>{room.slots.length} / {room.capacity} slots filled</p>
          )}
        </div>

        <form onSubmit={handleEnterRoom} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "24px 28px" }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 20 }}>Performer Check-In</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Performer ID</label>
            <input
              value={performerId}
              onChange={(e) => setPerformerId(e.target.value)}
              placeholder="e.g. perf-001"
              style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "9px 14px", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Performer Name</label>
            <input
              value={performerName}
              onChange={(e) => setPerformerName(e.target.value)}
              placeholder="e.g. Wavetek"
              style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "9px 14px", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !performerId || !performerName}
            style={{ background: "#00FF88", color: "#050510", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            {submitting ? "Checking in..." : "Enter Green Room"}
          </button>
          {msg && <p style={{ marginTop: 14, fontSize: 13, color: "#00FF88" }}>{msg}</p>}
        </form>
      </section>
    </main>
  );
}
