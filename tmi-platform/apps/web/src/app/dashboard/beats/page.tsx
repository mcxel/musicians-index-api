"use client";
import Link from "next/link";
import { useState } from "react";

type Beat = { id: string; title: string; genre: string; bpm: number; price: number; plays: number; sales: number; status: "published" | "draft" };

const SEED: Beat[] = [];

export default function DashboardBeatsPage() {
  const [beats, setBeats] = useState<Beat[]>(SEED);
  const [editMsg, setEditMsg] = useState("");

  function editBeat(id: string) {
    setEditMsg(`Editing: ${beats.find(b => b.id === id)?.title}`);
    setTimeout(() => setEditMsg(""), 3000);
  }

  function togglePublish(id: string) {
    setBeats(prev => prev.map(b => b.id === id ? { ...b, status: b.status === "published" ? "draft" : "published" } : b));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/performer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Performer Hub</Link>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>DASHBOARD</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>My Beats</h1>
          </div>
          <Link href="/beats/upload" style={{ padding: "11px 22px", borderRadius: 8, background: "#AA2DFF", color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>+ Upload Beat</Link>
        </div>
        {editMsg && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, fontSize: 12, color: "#AA2DFF" }}>{editMsg}</div>}
        <div style={{ display: "grid", gap: 10 }}>
          {beats.map((b) => (
            <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{b.genre} · {b.bpm} BPM · ${b.price} · {b.plays.toLocaleString()} plays · {b.sales} sales</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: b.status === "published" ? "#22c55e" : "#FFD700", letterSpacing: "0.15em" }}>{b.status.toUpperCase()}</span>
                <button onClick={() => editBeat(b.id)} style={{ padding: "6px 14px", borderRadius: 7, background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.25)", color: "#AA2DFF", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Edit</button>
                <button onClick={() => togglePublish(b.id)} style={{ padding: "6px 14px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}>{b.status === "published" ? "Unpublish" : "Publish"}</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Link href="/beats" style={{ fontSize: 12, color: "#AA2DFF", fontWeight: 700, textDecoration: "none" }}>View Marketplace →</Link>
        </div>
      </div>
    </main>
  );
}
