import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instrumentals | TMI",
  description: "Browse and license instrumentals from TMI producers — battles, cyphers, shows, and more.",
};

const INSTRUMENTALS = [
  { id: "i1", title: "The Code",     producer: "FlowMaster", genre: "Hip-Hop",     bpm: 93, key: "Dm", price: 49, stems: true, battleReady: true,  color: "#FF2DAA" },
  { id: "i2", title: "Solar Flare",  producer: "Cold Spark",  genre: "EDM",         bpm: 132, key: "Am", price: 65, stems: true, battleReady: false, color: "#00FFFF" },
  { id: "i3", title: "Raw Steel",    producer: "Bar God",     genre: "Battle Rap",  bpm: 88, key: "Bm", price: 39, stems: false, battleReady: true,  color: "#FFD700" },
  { id: "i4", title: "Velvet Rain",  producer: "Zuri Bloom",  genre: "R&B",         bpm: 72, key: "Eb", price: 55, stems: true,  battleReady: false, color: "#AA2DFF" },
  { id: "i5", title: "Iron Forge",   producer: "Overdrive",   genre: "Rock",        bpm: 142, key: "E",  price: 59, stems: false, battleReady: true,  color: "#00FF88" },
  { id: "i6", title: "Sunday Soul",  producer: "Prophet",     genre: "Gospel",      bpm: 68, key: "G",  price: 45, stems: true,  battleReady: false, color: "#FFD700" },
];

export default function InstrumentalsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>TMI PRODUCER VAULT</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Instrumentals</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.6 }}>
          Full instrumentals with optional stems. License for battles, cyphers, shows, or recordings.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/beats/submit" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#AA2DFF", borderRadius: 8, textDecoration: "none" }}>SUBMIT INSTRUMENTAL</Link>
          <Link href="/beats/marketplace" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 8, textDecoration: "none" }}>BEATS</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {INSTRUMENTALS.map(inst => (
            <Link key={inst.id} href={`/instrumentals/${inst.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${inst.color}14`, borderRadius: 14, padding: "22px" }}>
                <div style={{ background: `${inst.color}08`, borderRadius: 10, padding: "20px", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>🎼</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{inst.title}</h3>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>by {inst.producer}</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: inst.color }}>${inst.price}</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, color: inst.color, border: `1px solid ${inst.color}40`, borderRadius: 4, padding: "2px 7px" }}>{inst.genre}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 7px" }}>{inst.bpm} BPM · {inst.key}</span>
                  {inst.stems && <span style={{ fontSize: 9, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "2px 7px" }}>STEMS</span>}
                  {inst.battleReady && <span style={{ fontSize: 9, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, padding: "2px 7px" }}>BATTLE</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <span style={{ textAlign: "center", padding: "8px", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7 }}>
                    LEASE ${inst.price}
                  </span>
                  <span style={{ textAlign: "center", padding: "8px", fontSize: 9, fontWeight: 800, color: inst.color, border: `1px solid ${inst.color}40`, borderRadius: 7 }}>
                    EXCLUSIVE
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
