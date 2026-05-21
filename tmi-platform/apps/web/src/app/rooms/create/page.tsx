"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROOM_TYPES = [
  { id: "live-concert",      label: "Live Concert",       desc: "Full live performance for your audience",        color: "#AA2DFF" },
  { id: "cypher",            label: "Cypher / Battle",    desc: "Open freestyle or structured rap battles",       color: "#FF2DAA" },
  { id: "listening-party",   label: "Listening Party",    desc: "Drop new music and listen together",             color: "#FFD700" },
  { id: "studio",            label: "Studio Session",     desc: "Create live in the studio",                      color: "#00FFFF" },
  { id: "fan-meetup",        label: "Fan Meet-Up",        desc: "Private session with your fans",                 color: "#22c55e" },
  { id: "collaboration",     label: "Collaboration",      desc: "Build something with other artists",             color: "#FF6B35" },
];

export default function CreateRoomPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!selected || !title.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push(`/rooms/${selected}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/rooms" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← All Rooms</Link>
        </div>

        <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>LAUNCH A SESSION</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>Create Live Room</h1>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8 }}>ROOM TITLE</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Monday Night Cypher, Album Drop Party..."
            style={{
              width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff",
              fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 12 }}>ROOM TYPE</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
            {ROOM_TYPES.map((rt) => (
              <button
                key={rt.id}
                onClick={() => setSelected(rt.id)}
                style={{
                  background: selected === rt.id ? `${rt.color}18` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === rt.id ? rt.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10, padding: "14px 16px", textAlign: "left", cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: selected === rt.id ? rt.color : "#fff", marginBottom: 4 }}>{rt.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{rt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!selected || !title.trim() || submitting}
          style={{
            padding: "14px 36px",
            background: selected && title.trim() ? "linear-gradient(90deg,#AA2DFF,#FF2DAA)" : "rgba(255,255,255,0.06)",
            border: "none", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 14,
            letterSpacing: 1, cursor: selected && title.trim() ? "pointer" : "not-allowed",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "LAUNCHING..." : "LAUNCH ROOM →"}
        </button>
      </div>
    </main>
  );
}
