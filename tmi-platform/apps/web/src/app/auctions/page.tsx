import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auctions | TMI",
  description: "Bid on exclusive beats, instrumentals, NFTs, VIP seats, and collectibles on TMI.",
};

type AuctionItem = {
  id: string; title: string; type: string; seller: string; currentBid: number;
  reservePrice: number; buyoutPrice: number; endsIn: string; bids: number; color: string; icon: string;
};

const LIVE_AUCTIONS: AuctionItem[] = [
  { id: "a1", title: "Holy Water (Beat — Exclusive)", type: "BEAT", seller: "Wavetek", currentBid: 420, reservePrice: 300, buyoutPrice: 1200, endsIn: "2h 14m", bids: 7, color: "#FFD700", icon: "🎛️" },
  { id: "a2", title: "Cyber Genesis NFT #001", type: "NFT", seller: "TMI Art", currentBid: 280, reservePrice: 200, buyoutPrice: 900, endsIn: "4h 22m", bids: 5, color: "#00FFFF", icon: "🎨" },
  { id: "a3", title: "VIP Table — Dirty Dozens Finale", type: "TICKET", seller: "TMI Events", currentBid: 150, reservePrice: 100, buyoutPrice: 400, endsIn: "1d 6h", bids: 9, color: "#FF2DAA", icon: "🎟️" },
  { id: "a4", title: "Cold World — Full Stems", type: "INSTRUMENTAL", seller: "Krypt", currentBid: 550, reservePrice: 400, buyoutPrice: 1500, endsIn: "18h", bids: 12, color: "#AA2DFF", icon: "🎼" },
  { id: "a5", title: "Wavetek Signed Poster", type: "COLLECTIBLE", seller: "Wavetek", currentBid: 85, reservePrice: 50, buyoutPrice: 300, endsIn: "3d 2h", bids: 3, color: "#00FF88", icon: "📸" },
];

const TYPE_COLORS: Record<string, string> = { BEAT: "#FFD700", NFT: "#00FFFF", TICKET: "#FF2DAA", INSTRUMENTAL: "#AA2DFF", COLLECTIBLE: "#00FF88" };

export default function AuctionsPage() {
  const totalBids = LIVE_AUCTIONS.reduce((a, x) => a + x.bids, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>TMI VAULT</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Live Auctions</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 12px", lineHeight: 1.6 }}>
          Bid on exclusive beats, NFTs, VIP access, and artist collectibles. Highest bid wins.
        </p>
        <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 700, marginBottom: 28 }}>
          {LIVE_AUCTIONS.length} live auctions · {totalBids} total bids
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/beats/auctions" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, textDecoration: "none" }}>BEAT AUCTIONS</Link>
          <Link href="/nft-marketplace" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>NFT MARKETPLACE</Link>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {/* Type filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <span key={type} style={{ fontSize: 9, fontWeight: 800, color, border: `1px solid ${color}40`, borderRadius: 4, padding: "4px 10px", letterSpacing: "0.1em", cursor: "pointer" }}>
              {type}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {LIVE_AUCTIONS.map(a => (
            <article key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}18`, borderRadius: 14, padding: "22px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ fontSize: 28 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: TYPE_COLORS[a.type] ?? a.color, marginBottom: 4 }}>{a.type}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{a.title}</h3>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>by {a.seller}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>BID</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: a.color }}>${a.currentBid}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.bids} bids · ends {a.endsIn}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link href={`/auctions/${a.id}`} style={{ padding: "9px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: a.color, border: `1px solid ${a.color}50`, borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                      BID
                    </Link>
                    <Link href={`/checkout?item=${a.id}&price=${a.buyoutPrice}&type=auction-buyout`} style={{ padding: "9px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FF88", borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                      BUY ${a.buyoutPrice}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
