import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audio Library | TMI",
  description: "Browse the TMI audio library — beat previews, sample packs, and original tracks from verified producers.",
};

const FEATURED_TRACKS = [
  { title: "Electric Sky",     artist: "Ray Journey",  genre: "Trap",      bpm: 140, key: "F# min", duration: "2:48", plays: "24K", color: "#FFD700", icon: "⚡" },
  { title: "Lagos Night",      artist: "Zuri Bloom",   genre: "Afrobeats", bpm: 102, key: "A maj",  duration: "3:12", plays: "18K", color: "#00FF88", icon: "🌙" },
  { title: "Cipher Code",      artist: "Krypt",        genre: "Boom Bap",  bpm: 88,  key: "E min",  duration: "2:56", plays: "14K", color: "#AA2DFF", icon: "🔐" },
  { title: "Neon Pulse",       artist: "Neon Vibe",    genre: "House",     bpm: 128, key: "C maj",  duration: "4:01", plays: "9.8K",color: "#00FFFF", icon: "💡" },
  { title: "Frequency Drop",   artist: "Wavetek",      genre: "Trap",      bpm: 144, key: "G# min", duration: "2:34", plays: "31K", color: "#FF2DAA", icon: "📡" },
  { title: "Soul Architect",   artist: "Ray Journey",  genre: "Neo-Soul",  bpm: 92,  key: "D maj",  duration: "3:44", plays: "7.2K",color: "#FFD700", icon: "🏛️" },
];

const SAMPLE_PACKS = [
  { name: "Trap Gods Vol. 1",    tracks: 24, size: "1.2 GB", price: "$49.99", color: "#FF2DAA", icon: "🎛️" },
  { name: "Afro Rhythms Pack",   tracks: 18, size: "890 MB", price: "$39.99", color: "#00FF88", icon: "🥁" },
  { name: "Boom Bap Essentials", tracks: 30, size: "1.4 GB", price: "$44.99", color: "#AA2DFF", icon: "🎚️" },
  { name: "Neo-Soul Chords",     tracks: 16, size: "640 MB", price: "$34.99", color: "#FFD700", icon: "🎹" },
];

export default function AudioPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>TMI AUDIO LIBRARY</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Audio Library</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
          Beat previews, sample packs, and original tracks — all from verified TMI producers.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 18 }}>FEATURED TRACKS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FEATURED_TRACKS.map((t, i) => (
            <div key={t.title} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${t.color}15`, borderRadius: 10, padding: "12px 16px" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.25)", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
              <div style={{ width: 36, height: 36, background: `${t.color}20`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{t.title}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{t.artist} · {t.genre} · {t.bpm} BPM · {t.key}</div>
              </div>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{t.plays} plays</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{t.duration}</span>
                <div style={{ width: 100, height: 24, background: `${t.color}10`, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                  {/* Waveform placeholder */}
                  {Array.from({ length: 20 }).map((_, j) => (
                    <div key={j} style={{ position: "absolute", bottom: 0, left: `${j * 5}%`, width: "3%", height: `${20 + Math.abs(Math.sin(j * 0.9) * 14)}px`, background: t.color, opacity: 0.6, borderRadius: 1 }} />
                  ))}
                </div>
                <Link href="/beats" style={{ fontSize: 8, fontWeight: 800, color: "#050510", background: t.color, borderRadius: 5, padding: "5px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>BUY</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "40px auto 0", padding: "0 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 18 }}>SAMPLE PACKS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {SAMPLE_PACKS.map(p => (
            <div key={p.name} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${p.color}20`, borderRadius: 12, padding: "20px 16px" }}>
              <span style={{ fontSize: 28 }}>{p.icon}</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 10 }}>{p.name}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{p.tracks} tracks · {p.size}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: p.color }}>{p.price}</span>
                <Link href="/beats" style={{ fontSize: 8, fontWeight: 800, color: "#050510", background: p.color, borderRadius: 5, padding: "6px 12px", textDecoration: "none" }}>GET PACK</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 40 }}>
        <Link href="/beats" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FFFF", borderRadius: 7, textDecoration: "none" }}>BEAT MARKETPLACE →</Link>
      </section>
    </main>
  );
}
