"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GENRES = ["All Genres", "Hip-Hop", "R&B", "Pop", "Electronic", "Trap", "Soul", "Latin"];

const BEATS = [
  { id: "b1", title: "Midnight Ritual", producer: "Wavetek", bpm: 140, key: "Cm", genre: "Trap", licenses: [{ type: "Basic", price: 29.99 }, { type: "Exclusive", price: 299 }], color: "#FF2DAA", icon: "🌙" },
  { id: "b2", title: "Golden Hour", producer: "SoulGrid", bpm: 88, key: "F#maj", genre: "R&B", licenses: [{ type: "Basic", price: 39.99 }, { type: "Exclusive", price: 349 }], color: "#FFD700", icon: "☀️" },
  { id: "b3", title: "Neon District", producer: "Cold Spark", bpm: 128, key: "Am", genre: "Electronic", licenses: [{ type: "Basic", price: 24.99 }, { type: "Exclusive", price: 249 }], color: "#00FFFF", icon: "⚡" },
  { id: "b4", title: "Street Sermon", producer: "Kreach", bpm: 96, key: "Dm", genre: "Hip-Hop", licenses: [{ type: "Basic", price: 34.99 }, { type: "Exclusive", price: 399 }], color: "#AA2DFF", icon: "🎤" },
  { id: "b5", title: "Cali Dreams", producer: "Neon Vibe", bpm: 78, key: "Gmaj", genre: "Pop", licenses: [{ type: "Basic", price: 19.99 }, { type: "Exclusive", price: 199 }], color: "#00FF88", icon: "🌴" },
  { id: "b6", title: "Rhythm Ancestral", producer: "UrbanRoots", bpm: 102, key: "Ebm", genre: "Soul", licenses: [{ type: "Basic", price: 44.99 }, { type: "Exclusive", price: 449 }], color: "#FF9500", icon: "🎷" },
];

function BuyButton({ beat, license }: { beat: typeof BEATS[0]; license: { type: string; price: number } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/beats/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beatId: beat.id,
          title: beat.title,
          producer: beat.producer,
          license: license.type,
          amount: license.price,
          bpm: beat.bpm,
          key: beat.key,
        }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) router.push(data.url);
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      style={{ padding: "7px 13px", fontSize: 9, fontWeight: 800, color: "#050510", background: loading ? `${beat.color}80` : beat.color, borderRadius: 6, border: "none", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
    >
      {loading ? "..." : `${license.type} $${license.price}`}
    </button>
  );
}

export default function BeatMarketplacePage() {
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const filtered = activeGenre === "All Genres" ? BEATS : BEATS.filter((b) => b.genre === activeGenre);

  return (
    <div style={{ minHeight: "100vh", background: "#050510", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "60px 24px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FF9500", fontWeight: 800, marginBottom: 8 }}>TMI BEAT MARKETPLACE</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, color: "#fff", margin: "0 0 10px" }}>Buy & Sell Beats</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>License premium beats from the best producers on the platform.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/beat-lab" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#FF9500,#FFD700)", borderRadius: 8, textDecoration: "none" }}>UPLOAD A BEAT</Link>
          <Link href="/beat-vault" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, color: "#FF9500", border: "1px solid rgba(255,149,0,0.4)", borderRadius: 8, textDecoration: "none" }}>MY BEAT VAULT</Link>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Genre filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {GENRES.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)}
              style={{ padding: "7px 14px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", background: activeGenre === g ? "rgba(255,149,0,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${activeGenre === g ? "rgba(255,149,0,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, cursor: "pointer", color: activeGenre === g ? "#FF9500" : "rgba(255,255,255,0.5)" }}>
              {g}
            </button>
          ))}
        </div>

        {/* Beat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
          {filtered.map((beat) => (
            <article key={beat.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${beat.color}18`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(135deg,${beat.color}18,${beat.color}06)`, padding: "32px 0", textAlign: "center", borderBottom: `1px solid ${beat.color}12` }}>
                <div style={{ fontSize: 40 }}>{beat.icon}</div>
                <div style={{ fontSize: 10, color: beat.color, fontWeight: 800, marginTop: 8, letterSpacing: "0.15em" }}>{beat.genre}</div>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: "#fff" }}>{beat.title}</h3>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>by {beat.producer}</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 10, padding: "3px 9px", background: `${beat.color}12`, border: `1px solid ${beat.color}30`, borderRadius: 4, color: beat.color, fontWeight: 700 }}>{beat.bpm} BPM</span>
                  <span style={{ fontSize: 10, padding: "3px 9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{beat.key}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {beat.licenses.map((lic) => (
                    <BuyButton key={lic.type} beat={beat} license={lic} />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
