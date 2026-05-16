import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beat Marketplace | TMI",
  description: "Buy and license beats from TMI producers. Basic, premium, and exclusive licenses.",
};

const BEATS = [
  { id: "b1", title: "Midnight Bars", producer: "Wavetek", genre: "Hip-Hop", bpm: 140, key: "Cm", basicPrice: 29, premiumPrice: 59, exclusivePrice: 499, plays: 4200, tags: ["dark", "trap", "808s"], battleReady: true },
  { id: "b2", title: "Neon Circuit", producer: "Producer 88", genre: "EDM", bpm: 128, key: "Am", basicPrice: 35, premiumPrice: 79, exclusivePrice: 599, plays: 2800, tags: ["synth", "electronic", "build"], battleReady: false },
  { id: "b3", title: "Gold Standard", producer: "FlowMaster", genre: "Trap", bpm: 145, key: "Gm", basicPrice: 29, premiumPrice: 59, exclusivePrice: 399, plays: 5600, tags: ["gold", "hard", "drums"], battleReady: true },
  { id: "b4", title: "Soul Splice", producer: "Krypt", genre: "R&B", bpm: 88, key: "Eb", basicPrice: 39, premiumPrice: 89, exclusivePrice: 699, plays: 3100, tags: ["soul", "smooth", "melody"], battleReady: false },
  { id: "b5", title: "Battle Code", producer: "Verse Knight", genre: "Hip-Hop", bpm: 95, key: "Dm", basicPrice: 29, premiumPrice: 59, exclusivePrice: 499, plays: 7800, tags: ["battle", "raw", "boom-bap"], battleReady: true },
  { id: "b6", title: "Frequency", producer: "Cold Spark", genre: "Instrumental", bpm: 110, key: "F", basicPrice: 45, premiumPrice: 99, exclusivePrice: 799, plays: 1900, tags: ["cinematic", "build", "epic"], battleReady: false },
];

export default function BeatMarketplacePage() {
  const totalBeats = BEATS.length;
  const battleBeats = BEATS.filter(b => b.battleReady).length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>TMI BEAT VAULT</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Beat Marketplace</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 12px", lineHeight: 1.6 }}>
          License-protected beats from TMI producers. Buy a license — producer keeps ownership.
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 28, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          <span>{totalBeats} beats listed</span>
          <span>·</span>
          <span>{battleBeats} battle-ready</span>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/beats/submit" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#FFD700", borderRadius: 8, textDecoration: "none" }}>SUBMIT A BEAT</Link>
          <Link href="/beats/auctions" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, textDecoration: "none" }}>BEAT AUCTIONS</Link>
          <Link href="/beats" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, textDecoration: "none" }}>ALL BEATS</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
          {BEATS.map(beat => (
            <article key={beat.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 14, padding: "22px" }}>
              {/* Preview zone */}
              <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.1)", borderRadius: 10, padding: "16px", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🎵</div>
                <div style={{ fontSize: 9, color: "rgba(255,215,0,0.5)", fontWeight: 700 }}>WATERMARKED PREVIEW</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{beat.title}</h3>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>by {beat.producer}</div>
                </div>
                {beat.battleReady && (
                  <span style={{ fontSize: 8, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 4, padding: "3px 8px" }}>BATTLE READY</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4, padding: "2px 7px" }}>{beat.genre}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 7px" }}>{beat.bpm} BPM</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 7px" }}>{beat.key}</span>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                {beat.tags.map(t => (
                  <span key={t} style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>#{t}</span>
                ))}
              </div>

              {/* License buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Link href={`/checkout?item=${beat.id}&price=${beat.basicPrice}&type=beat-basic`} style={{ textAlign: "center", padding: "8px 4px", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, textDecoration: "none" }}>
                  BASIC<br />${beat.basicPrice}
                </Link>
                <Link href={`/checkout?item=${beat.id}&price=${beat.premiumPrice}&type=beat-premium`} style={{ textAlign: "center", padding: "8px 4px", fontSize: 9, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 7, textDecoration: "none" }}>
                  PREMIUM<br />${beat.premiumPrice}
                </Link>
                <Link href={`/checkout?item=${beat.id}&price=${beat.exclusivePrice}&type=beat-exclusive`} style={{ textAlign: "center", padding: "8px 4px", fontSize: 9, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 7, textDecoration: "none" }}>
                  EXCLUSIVE<br />${beat.exclusivePrice}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
