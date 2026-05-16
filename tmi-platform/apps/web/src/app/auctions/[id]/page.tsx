"use client";

import { useState } from "react";
import Link from "next/link";

const SEED: Record<string, { title: string; type: string; seller: string; currentBid: number; reservePrice: number; buyoutPrice: number; endsIn: string; bids: number; color: string; icon: string; desc: string }> = {
  a1: { title: "Holy Water (Beat — Exclusive)", type: "BEAT", seller: "Wavetek", currentBid: 420, reservePrice: 300, buyoutPrice: 1200, endsIn: "2h 14m", bids: 7, color: "#FFD700", icon: "🎛️", desc: "Gospel-infused hip-hop with full stem pack. Exclusive ownership transfer." },
  a2: { title: "Cyber Genesis NFT #001", type: "NFT", seller: "TMI Art", currentBid: 280, reservePrice: 200, buyoutPrice: 900, endsIn: "4h 22m", bids: 5, color: "#00FFFF", icon: "🎨", desc: "1-of-1 generative art piece from the TMI Cyber Genesis collection." },
  a3: { title: "VIP Table — Dirty Dozens Finale", type: "TICKET", seller: "TMI Events", currentBid: 150, reservePrice: 100, buyoutPrice: 400, endsIn: "1d 6h", bids: 9, color: "#FF2DAA", icon: "🎟️", desc: "Front-row VIP table for the Dirty Dozens Season 1 Grand Finale." },
};

const BID_HISTORY = [
  { user: "krypt_rider", bid: 420, time: "2 min ago" },
  { user: "mega_fan_007", bid: 380, time: "8 min ago" },
  { user: "producer_88", bid: 350, time: "14 min ago" },
  { user: "fan_xyz_421", bid: 310, time: "22 min ago" },
];

export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  const item = SEED[params.id] ?? {
    title: `Auction ${params.id}`, type: "ITEM", seller: "TMI", currentBid: 100, reservePrice: 75,
    buyoutPrice: 500, endsIn: "12h", bids: 0, color: "#00FFFF", icon: "🏷️", desc: "Auction item.",
  };

  const [bidAmt, setBidAmt] = useState(item.currentBid + 10);
  const [bidding, setBidding] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);

  async function placeBid() {
    if (bidAmt <= item.currentBid || bidding) return;
    setBidding(true);
    await fetch(`/api/auctions/${params.id}/bid`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount: bidAmt }),
    }).catch(() => {});
    setBidPlaced(true);
    setBidding(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/auctions" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← AUCTIONS</Link>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Left */}
        <div>
          <div style={{ background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: 16, padding: "60px 32px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 10 }}>{item.icon}</div>
            <span style={{ fontSize: 9, fontWeight: 800, color: item.color, letterSpacing: "0.15em", border: `1px solid ${item.color}40`, borderRadius: 4, padding: "3px 10px" }}>{item.type}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.8rem)", fontWeight: 900, marginBottom: 6 }}>{item.title}</h1>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>by {item.seller}</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.desc}</p>
        </div>

        {/* Right */}
        <div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 4 }}>CURRENT BID</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: item.color }}>${item.currentBid}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{item.bids} bids · ends {item.endsIn}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 4 }}>BUYOUT</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88" }}>${item.buyoutPrice}</div>
              </div>
            </div>

            {bidPlaced ? (
              <div style={{ textAlign: "center", padding: "16px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 10 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#00FF88" }}>Bid placed — ${bidAmt}</div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <input
                    type="number" min={item.currentBid + 1} value={bidAmt}
                    onChange={e => setBidAmt(Number(e.target.value))}
                    style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 16, fontWeight: 800, outline: "none" }}
                  />
                  <button onClick={placeBid} disabled={bidding || bidAmt <= item.currentBid} style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: bidAmt > item.currentBid ? item.color : "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, cursor: bidAmt > item.currentBid ? "pointer" : "not-allowed" }}>
                    {bidding ? "…" : "BID"}
                  </button>
                </div>
                <Link href={`/checkout?item=${params.id}&price=${item.buyoutPrice}&type=auction-buyout`} style={{ display: "block", textAlign: "center", padding: "12px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FF88", borderRadius: 8, textDecoration: "none" }}>
                  BUY NOW — ${item.buyoutPrice}
                </Link>
              </>
            )}
          </div>

          {/* Bid history */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 12 }}>BID HISTORY</div>
            {BID_HISTORY.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 11 }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{b.user}</span>
                <span style={{ fontWeight: 800 }}>${b.bid}</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>{b.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
