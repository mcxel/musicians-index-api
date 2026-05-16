"use client";

import Link from "next/link";

const FEATURED_BEATS = [
  { id: "b1", title: "Midnight Bars", producer: "Wavetek", genre: "Trap", bpm: 140, price: 29, exclusivePrice: 499, plays: 1842, battleReady: true, href: "/beats/marketplace", color: "#FF2DAA" },
  { id: "b2", title: "The Code", producer: "FlowMaster", genre: "Boom Bap", bpm: 88, price: 29, exclusivePrice: 399, plays: 921, battleReady: true, href: "/beats/marketplace", color: "#00FFFF" },
  { id: "b3", title: "808 Dreams", producer: "Krypt", genre: "Drill", bpm: 140, price: 29, exclusivePrice: 599, plays: 654, battleReady: false, href: "/beats/marketplace", color: "#FFD700" },
  { id: "b4", title: "Lagos Nights", producer: "Neon Vibe", genre: "Afrobeats", bpm: 102, price: 29, exclusivePrice: 299, plays: 279, battleReady: false, href: "/beats/marketplace", color: "#00FF88" },
];

const MERCH_ITEMS = [
  { id: "m1", name: "TMI Logo Hoodie", price: 64.99, type: "APPAREL", href: "/artist/tmi/store", color: "#FF2DAA" },
  { id: "m2", name: "Cypher Nation Tee", price: 34.99, type: "APPAREL", href: "/artist/tmi/store", color: "#AA2DFF" },
  { id: "m3", name: "Battle Snapback", price: 29.99, type: "ACCESSORY", href: "/artist/tmi/store", color: "#FFD700" },
  { id: "m4", name: "Wavetek Vinyl 12\"", price: 22.00, type: "VINYL", href: "/artist/wavetek/store", color: "#00FF88" },
];

const NFT_ITEMS = [
  { id: "n1", title: "Cyber Genesis #001", creator: "TMI Art", type: "ART", price: 280, href: "/nft-marketplace", color: "#AA2DFF" },
  { id: "n2", title: "Battle Moment #012", creator: "Krypt", type: "MOMENT", price: 45, href: "/nft-marketplace", color: "#FF2DAA" },
  { id: "n3", title: "Session Pass", creator: "Wavetek", type: "TICKET-ART", price: 120, href: "/nft-marketplace", color: "#00FFFF" },
];

const LIVE_AUCTIONS = [
  { id: "a1", title: "Midnight Bars (Exclusive)", type: "BEAT", currentBid: 680, buyout: 1200, bids: 8, endsIn: "14h 22m", color: "#FF2DAA" },
  { id: "a2", title: "Cyber Genesis NFT #002", type: "NFT", currentBid: 195, buyout: 500, bids: 3, endsIn: "28h 00m", color: "#AA2DFF" },
  { id: "a3", title: "VIP Table — Neon Vibe", type: "TICKET", currentBid: 420, buyout: 600, bids: 11, endsIn: "6h 48m", color: "#FFD700" },
];

export default function Home5Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "16px 20px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 8, color: "#00FF88", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 4 }}>HOME 5 · MARKETPLACE</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Beats · Merch · NFTs · Auctions</h2>
        </div>
        <Link href="/beats/submit" style={{ textDecoration: "none", padding: "8px 14px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#00FF88" }}>
          + SELL YOUR WORK
        </Link>
      </div>

      {/* Beat Marketplace */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em" }}>BEAT MARKETPLACE</div>
          <Link href="/beats/marketplace" style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, textDecoration: "none" }}>VIEW ALL →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {FEATURED_BEATS.map(b => (
            <Link key={b.id} href={b.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: `linear-gradient(135deg, ${b.color}08, rgba(0,0,0,0.5))`,
                border: `1px solid ${b.color}25`,
                borderRadius: 10,
                padding: "14px",
                transition: "all 0.25s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{b.genre} · {b.bpm} BPM</span>
                  {b.battleReady && <span style={{ fontSize: 7, fontWeight: 900, color: "#FFD700", border: "1px solid #FFD70050", borderRadius: 3, padding: "1px 5px" }}>BATTLE</span>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{b.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>{b.producer} · {b.plays.toLocaleString()} plays</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ flex: 1, padding: "5px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>BASIC</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: b.color }}>${b.price}</div>
                  </div>
                  <div style={{ flex: 1, padding: "5px 8px", background: `${b.color}08`, border: `1px solid ${b.color}30`, borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>EXCLUSIVE</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: b.color }}>${b.exclusivePrice}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Merch + NFTs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Merch */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em" }}>MERCH</div>
            <Link href="/artist/tmi/store" style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 800, textDecoration: "none" }}>SHOP →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MERCH_ITEMS.map(m => (
              <Link key={m.id} href={m.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${m.color}15`, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{m.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{m.type}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>${m.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* NFTs */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em" }}>NFT MARKETPLACE</div>
            <Link href="/nft-marketplace" style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, textDecoration: "none" }}>VIEW →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {NFT_ITEMS.map(n => (
              <Link key={n.id} href={n.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: `${n.color}06`, border: `1px solid ${n.color}20`, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{n.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{n.creator} · {n.type}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: n.color }}>${n.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Live Auctions */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em" }}>LIVE AUCTIONS</div>
          <Link href="/auctions" style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, textDecoration: "none" }}>ALL AUCTIONS →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {LIVE_AUCTIONS.map(a => (
            <Link key={a.id} href="/auctions" style={{ textDecoration: "none" }}>
              <div style={{
                background: `linear-gradient(135deg, ${a.color}08, rgba(0,0,0,0.5))`,
                border: `1px solid ${a.color}25`,
                borderRadius: 10,
                padding: "14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 8, color: a.color, fontWeight: 800, border: `1px solid ${a.color}40`, borderRadius: 3, padding: "2px 6px" }}>{a.type}</span>
                  <span style={{ fontSize: 8, color: "#FF2DAA", fontWeight: 700 }}>⏱ {a.endsIn}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{a.title}</div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>CURRENT BID</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88" }}>${a.currentBid}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                  <span>{a.bids} bids</span>
                  <span>Buyout: ${a.buyout}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
