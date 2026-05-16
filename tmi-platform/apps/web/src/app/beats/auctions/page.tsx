import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beat Auctions | TMI",
  description: "Bid on exclusive beats from TMI producers. Reserve price, buyout options, and countdown timers.",
};

const AUCTIONS = [
  { id: "ba1", title: "Holy Water (Exclusive)", producer: "Wavetek", genre: "Gospel/Hip-Hop", bpm: 88, currentBid: 420, reservePrice: 300, buyoutPrice: 1200, endsIn: "2h 14m", bids: 7, color: "#FFD700" },
  { id: "ba2", title: "Neon God", producer: "Producer 88", genre: "EDM", bpm: 128, currentBid: 180, reservePrice: 150, buyoutPrice: 800, endsIn: "5h 42m", bids: 3, color: "#00FFFF" },
  { id: "ba3", title: "Cold World (Full Stems)", producer: "Krypt", genre: "Trap", bpm: 145, currentBid: 550, reservePrice: 400, buyoutPrice: 1500, endsIn: "1d 3h", bids: 12, color: "#FF2DAA" },
  { id: "ba4", title: "Cipher King", producer: "Verse Knight", genre: "Battle Rap", bpm: 92, currentBid: 310, reservePrice: 250, buyoutPrice: 999, endsIn: "18h 30m", bids: 5, color: "#AA2DFF" },
];

export default function BeatAuctionsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>BEAT VAULT</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Beat Auctions</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.6 }}>
          Bid on exclusive rights. Win the auction — own the beat.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/beats/marketplace" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, textDecoration: "none" }}>MARKETPLACE</Link>
          <Link href="/auctions" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, textDecoration: "none" }}>ALL AUCTIONS</Link>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {AUCTIONS.map(a => (
            <article key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}20`, borderRadius: 14, padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: a.color, letterSpacing: "0.15em", marginBottom: 6 }}>
                    {a.genre} · {a.bpm} BPM
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{a.title}</h3>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>by {a.producer}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>CURRENT BID</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: a.color }}>${a.currentBid}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.bids} bids</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 18, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>RESERVE</div><div style={{ fontSize: 13, fontWeight: 800 }}>${a.reservePrice}</div></div>
                <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>BUYOUT</div><div style={{ fontSize: 13, fontWeight: 800, color: "#00FF88" }}>${a.buyoutPrice}</div></div>
                <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>ENDS IN</div><div style={{ fontSize: 13, fontWeight: 800, color: "#00FFFF" }}>{a.endsIn}</div></div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                  <Link href={`/auctions/${a.id}`} style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: a.color, border: `1px solid ${a.color}50`, borderRadius: 8, textDecoration: "none" }}>
                    PLACE BID
                  </Link>
                  <Link href={`/checkout?item=${a.id}&price=${a.buyoutPrice}&type=beat-buyout`} style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FF88", borderRadius: 8, textDecoration: "none" }}>
                    BUY NOW ${a.buyoutPrice}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
