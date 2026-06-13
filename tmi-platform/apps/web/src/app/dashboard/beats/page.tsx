"use client";
import Link from "next/link";
import { useState } from "react";

type Beat = { id: string; title: string; genre: string; bpm: number; price: number; plays: number; sales: number; status: "published" | "draft"; tag?: string; };

const SEED: Beat[] = [
  { id: "b1", title: "Night Protocol",    genre: "Trap",     bpm: 145, price: 29,  plays: 8420,  sales: 34, status: "published", tag: "TRENDING" },
  { id: "b2", title: "Pressure Wave",     genre: "Hip-Hop",  bpm: 92,  price: 49,  plays: 5110,  sales: 21, status: "published" },
  { id: "b3", title: "Storm Season",      genre: "Drill",    bpm: 148, price: 39,  plays: 3780,  sales: 15, status: "published" },
  { id: "b4", title: "Neon Frequency",    genre: "Trap",     bpm: 138, price: 79,  plays: 2200,  sales: 8,  status: "published", tag: "EXCLUSIVE" },
  { id: "b5", title: "City After Dark",   genre: "Ambient",  bpm: 80,  price: 19,  plays: 940,   sales: 4,  status: "draft" },
  { id: "b6", title: "Signal Lost",       genre: "Electronic", bpm: 128, price: 59, plays: 0,    sales: 0,  status: "draft" },
];

const TOTALS = {
  plays: SEED.reduce((a, b) => a + b.plays, 0),
  sales: SEED.reduce((a, b) => a + b.sales, 0),
  revenue: SEED.reduce((a, b) => a + b.sales * b.price, 0),
  published: SEED.filter(b => b.status === "published").length,
};

export default function DashboardBeatsPage() {
  const [beats, setBeats] = useState<Beat[]>(SEED);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const togglePublish = (id: string) => {
    setBeats(prev => prev.map(b => b.id === id ? { ...b, status: b.status === "published" ? "draft" : "published" } : b));
    const beat = beats.find(b => b.id === id);
    showToast(beat?.status === "published" ? `"${beat?.title}" set to draft` : `"${beat?.title}" published!`);
  };

  const filtered = filter === "all" ? beats : beats.filter(b => b.status === filter);

  const GENRE_COLORS: Record<string, string> = {
    "Trap": "#FF2DAA", "Hip-Hop": "#00FFFF", "Drill": "#FFD700",
    "Ambient": "#00FF88", "Electronic": "#AA2DFF",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(170,45,255,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <Link href="/hub/performer" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Performer Hub</Link>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2, color: "#AA2DFF" }}>🎵 Beat Catalog</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/beats" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>VIEW MARKETPLACE</Link>
          <Link href="/beats/upload" style={{ fontSize: 10, background: "#AA2DFF", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 6, textDecoration: "none", fontWeight: 900 }}>+ UPLOAD BEAT</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Plays",  value: TOTALS.plays.toLocaleString(), icon: "▶", color: "#00FFFF" },
            { label: "Total Sales",  value: TOTALS.sales,                  icon: "🛒", color: "#00FF88" },
            { label: "Revenue",      value: `$${TOTALS.revenue.toLocaleString()}`, icon: "💵", color: "#FFD700" },
            { label: "Published",    value: `${TOTALS.published} / ${beats.length}`, icon: "✓", color: "#AA2DFF" },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(170,45,255,0.1)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, fontSize: 12, color: "#AA2DFF" }}>{toast}</div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", background: filter === f ? "#AA2DFF" : "transparent", color: filter === f ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Beats list */}
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((b) => (
            <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{b.title}</span>
                  {b.tag && <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 10, background: b.tag === "TRENDING" ? "rgba(255,45,170,0.2)" : "rgba(255,215,0,0.15)", color: b.tag === "TRENDING" ? "#FF2DAA" : "#FFD700", letterSpacing: "0.1em" }}>{b.tag}</span>}
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                  <span style={{ color: GENRE_COLORS[b.genre] ?? "#888", fontWeight: 700 }}>{b.genre}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{b.bpm} BPM</span>
                  <span style={{ color: "#00FF88", fontWeight: 700 }}>${b.price}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>▶ {b.plays.toLocaleString()}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>🛒 {b.sales} sales</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: b.status === "published" ? "#00FF88" : "#FFD700", letterSpacing: "0.15em", minWidth: 60, textAlign: "right" }}>{b.status.toUpperCase()}</span>
                <Link href={`/beats/upload?edit=${b.id}`} style={{ padding: "7px 14px", borderRadius: 7, background: "rgba(170,45,255,0.1)", border: "1px solid rgba(170,45,255,0.25)", color: "#AA2DFF", fontSize: 11, cursor: "pointer", fontWeight: 700, textDecoration: "none" }}>Edit</Link>
                <button onClick={() => togglePublish(b.id)} style={{ padding: "7px 14px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}>
                  {b.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No {filter} beats yet.{" "}
            <Link href="/beats/upload" style={{ color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>Upload your first beat →</Link>
          </div>
        )}

        {/* Bottom actions */}
        <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
          <Link href="/beats/upload" style={{ padding: "11px 22px", borderRadius: 8, background: "#AA2DFF", color: "#fff", fontWeight: 900, fontSize: 13, textDecoration: "none" }}>
            + Upload Beat
          </Link>
          <Link href="/nft-lab" style={{ padding: "11px 22px", borderRadius: 8, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
            🎨 Mint as NFT
          </Link>
          <Link href="/beats" style={{ padding: "11px 22px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            View Marketplace →
          </Link>
        </div>
      </div>
    </main>
  );
}
