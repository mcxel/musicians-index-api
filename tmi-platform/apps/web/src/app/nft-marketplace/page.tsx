import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NFT Marketplace | TMI",
  description: "Buy, sell, and auction 1-of-1 digital collectibles from TMI artists and producers.",
};

const NFTS = [
  { id: "n1", title: "Cyber Genesis #001", creator: "TMI Art", collection: "Cyber Genesis", price: 280, edition: "1/1", color: "#00FFFF", icon: "🎨", type: "ART" },
  { id: "n2", title: "Wavetek — Fifth Ward Vol. 1", creator: "Wavetek", collection: "Wavetek Originals", price: 150, edition: "1/100", color: "#FF2DAA", icon: "🎤", type: "MUSIC" },
  { id: "n3", title: "Dirty Dozens S1 Trophy", creator: "TMI", collection: "Season Trophies", price: 499, edition: "1/1", color: "#FFD700", icon: "🏆", type: "COLLECTIBLE" },
  { id: "n4", title: "Neon Vibe — Night 1 Pass", creator: "Neon Vibe", collection: "Event Passes", price: 90, edition: "1/250", color: "#AA2DFF", icon: "🎧", type: "TICKET-ART" },
  { id: "n5", title: "Cold Spark Genesis", creator: "Cold Spark", collection: "Artist Genesis", price: 320, edition: "1/1", color: "#00FF88", icon: "❄️", type: "ART" },
  { id: "n6", title: "Monday Cypher #4 Clip", creator: "TMI", collection: "Cypher Moments", price: 75, edition: "1/500", color: "#FF2DAA", icon: "🎙️", type: "MOMENT" },
];

const TYPE_COLORS: Record<string, string> = { ART: "#00FFFF", MUSIC: "#FF2DAA", COLLECTIBLE: "#FFD700", "TICKET-ART": "#AA2DFF", MOMENT: "#00FF88" };

export default function NFTMarketplacePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>TMI NFT LAB</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>NFT Marketplace</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.6 }}>
          1-of-1 art, music collectibles, event passes, and artist originals. Own a piece of TMI culture.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/nft-lab" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#00FFFF", borderRadius: 8, textDecoration: "none" }}>CREATE NFT</Link>
          <Link href="/auctions" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 8, textDecoration: "none" }}>NFT AUCTIONS</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        {/* Type filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>ALL</span>
          {Object.entries(TYPE_COLORS).map(([t, c]) => (
            <span key={t} style={{ fontSize: 9, fontWeight: 800, color: c, border: `1px solid ${c}40`, borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>{t}</span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {NFTS.map(nft => (
            <article key={nft.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${nft.color}18`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(135deg,${nft.color}15,${nft.color}05)`, padding: "52px 0", textAlign: "center", borderBottom: `1px solid ${nft.color}10` }}>
                <div style={{ fontSize: 52 }}>{nft.icon}</div>
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: TYPE_COLORS[nft.type] ?? nft.color, fontWeight: 800 }}>{nft.type}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{nft.edition}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{nft.title}</h3>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>by {nft.creator}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>{nft.collection}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: nft.color }}>${nft.price}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/checkout?item=${nft.id}&price=${nft.price}&type=nft-buy`} style={{ padding: "8px 16px", fontSize: 9, fontWeight: 800, color: "#050510", background: nft.color, borderRadius: 7, textDecoration: "none" }}>
                      BUY
                    </Link>
                    <Link href={`/auctions?type=nft&id=${nft.id}`} style={{ padding: "8px 14px", fontSize: 9, fontWeight: 800, color: nft.color, border: `1px solid ${nft.color}50`, borderRadius: 7, textDecoration: "none" }}>
                      BID
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
