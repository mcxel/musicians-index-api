"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TicketingCreatePage() {
  const router = useRouter();
  const [title, setTitle]   = useState("");
  const [date, setDate]     = useState("");
  const [price, setPrice]   = useState("0");
  const [capacity, setCapacity] = useState("100");
  const [type, setType]     = useState<"CONCERT"|"BATTLE"|"CYPHER"|"EVENT">("CONCERT");

  function handleCreate() {
    if (!title || !date) return;
    router.push("/ticketing");
  }

  const TYPE_COLOR: Record<string, string> = {
    CONCERT: "#FF2DAA", BATTLE: "#FFD700", CYPHER: "#00FFFF", EVENT: "#00FF88",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/ticketing" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← TICKETING
        </Link>

        <h1 style={{ fontSize: 22, fontWeight: 900, marginTop: 20, marginBottom: 8 }}>Create Event</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Set up a ticketed event. Stripe checkout is wired automatically.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Event type */}
          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 10 }}>EVENT TYPE</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["CONCERT","BATTLE","CYPHER","EVENT"] as const).map(t => (
                <button key={t} onClick={() => setType(t)} style={{ padding: "7px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: type === t ? "#050510" : TYPE_COLOR[t], background: type === t ? TYPE_COLOR[t] : "transparent", border: `1px solid ${TYPE_COLOR[t]}50`, borderRadius: 6, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>EVENT TITLE</div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Wavetek — Fifth Ward Live" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>DATE</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>TICKET PRICE ($)</div>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0 = FREE" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>CAPACITY</div>
            <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleCreate} disabled={!title || !date} style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: !title || !date ? "rgba(0,255,255,0.2)" : "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 10, border: "none", cursor: !title || !date ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}>
            CREATE EVENT
          </button>
        </div>
      </div>
    </main>
  );
}
