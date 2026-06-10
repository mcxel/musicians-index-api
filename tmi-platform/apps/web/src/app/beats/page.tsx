"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GENRES = ["All", "Hip-Hop", "Trap", "R&B", "Drill", "Afrobeats", "Lo-fi", "Pop"];
const BEATS: { id: string; title: string; producer: string; genre: string; bpm: number; price: number; plays: number }[] = [];

export default function BeatsPage() {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState("All");
  const [playing, setPlaying] = useState<string | null>(null);

  const displayed = activeGenre === "All" ? BEATS : BEATS.filter(b => b.genre === activeGenre);

  function buyBeat(beat: typeof BEATS[0]) {
    router.push(`/api/stripe/checkout?priceId=price_beat_${beat.id}&mode=payment&name=${encodeURIComponent(beat.title)}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>MARKETPLACE</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,42px)", fontWeight: 900, margin: "0 0 8px" }}>Beat Marketplace</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>Exclusive beats from TMI producers. License instantly.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              style={{ padding: "7px 16px", borderRadius: 20, background: activeGenre === g ? "#AA2DFF" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: activeGenre === g ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
            >
              {g}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {displayed.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "48px 24px", textAlign: "center", background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.12)", borderRadius: 14, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              No beats listed yet — producers join to upload.
            </div>
          )}
          {displayed.map((b) => (
            <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 14, padding: "20px" }}>
              <div style={{ width: "100%", height: 80, background: playing === b.id ? "linear-gradient(135deg, rgba(170,45,255,0.35), rgba(255,45,170,0.2))" : "linear-gradient(135deg, rgba(170,45,255,0.15), rgba(255,45,170,0.08))", borderRadius: 10, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {playing === b.id ? "⏸" : "🎶"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{b.producer} · {b.genre} · {b.bpm} BPM</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, fontSize: 16, color: "#AA2DFF" }}>${b.price}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPlaying(playing === b.id ? null : b.id)} style={{ padding: "7px 12px", borderRadius: 7, background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                    {playing === b.id ? "⏸ Pause" : "▶ Play"}
                  </button>
                  <button onClick={() => buyBeat(b)} style={{ padding: "7px 14px", borderRadius: 7, background: "#AA2DFF", color: "#fff", border: "none", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Buy</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
          <Link href="/beat-vault" style={{ fontSize: 12, color: "#AA2DFF", fontWeight: 700, textDecoration: "none" }}>Beat Vault Archive →</Link>
          <Link href="/hub/performer" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Upload a Beat</Link>
        </div>
      </div>
    </main>
  );
}
