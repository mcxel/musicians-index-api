"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type AuctionItemType = "beats" | "nfts" | "tickets" | "merch" | "vip-seats" | "backstage-passes";

interface AuctionItem {
  id: string;
  title: string;
  seller: string;
  type: AuctionItemType;
  currentBid: number;
  reservePrice: number;
  bids: number;
  endsAt: number;
  emoji: string;
  color: string;
}

const SEED: AuctionItem[] = [
  { id: "a1", title: "Exclusive Beat Pack Vol.12",         seller: "Nova Cipher",   type: "beats",            currentBid: 280,   reservePrice: 200,  bids: 14, endsAt: Date.now() + 2 * 3600000,  emoji: "🎛️", color: "#AA2DFF" },
  { id: "a2", title: "Front-Row VIP Seat — World Concert", seller: "TMI Events",    type: "vip-seats",        currentBid: 550,   reservePrice: 400,  bids: 31, endsAt: Date.now() + 5 * 3600000,  emoji: "💺", color: "#FFD700" },
  { id: "a3", title: "Signed NFT Drop #007",               seller: "Wavetek",       type: "nfts",             currentBid: 1200,  reservePrice: 800,  bids: 7,  endsAt: Date.now() + 1 * 3600000,  emoji: "🖼️", color: "#FF2DAA" },
  { id: "a4", title: "Backstage Pass — Monthly Idol",      seller: "Krypt",         type: "backstage-passes", currentBid: 350,   reservePrice: 300,  bids: 19, endsAt: Date.now() + 8 * 3600000,  emoji: "🎪", color: "#00FFFF" },
  { id: "a5", title: "Limited Merch Bundle — Crown S1",    seller: "TMI Store",     type: "merch",            currentBid: 145,   reservePrice: 100,  bids: 6,  endsAt: Date.now() + 12 * 3600000, emoji: "👑", color: "#00FF88" },
  { id: "a6", title: "General Admission — Battle Night",   seller: "Bar God",       type: "tickets",          currentBid: 75,    reservePrice: 50,   bids: 22, endsAt: Date.now() + 3 * 3600000,  emoji: "🎫", color: "#FF6B35" },
];

const FILTERS: AuctionItemType[] = ["beats", "nfts", "tickets", "merch", "vip-seats", "backstage-passes"];

function countdown(ms: number) {
  if (ms <= 0) return "ENDED";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

export default function AuctionPage() {
  const [filter, setFilter] = useState<AuctionItemType | "all">("all");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const items = filter === "all" ? SEED : SEED.filter(i => i.type === filter);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 20px", display: "flex", gap: 16, alignItems: "center", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", textDecoration: "none", letterSpacing: "0.14em" }}>TMI</Link>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>LIVE AUCTION HOUSE</span>
        <Link href="/auction/sell" style={{ marginLeft: "auto", padding: "7px 16px", background: "#FFD700", color: "#000", borderRadius: 8, fontWeight: 900, fontSize: 10, textDecoration: "none", letterSpacing: "0.1em" }}>+ LIST ITEM</Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>LIVE BIDS</div>
          <h1 style={{ margin: 0, fontSize: "clamp(24px,4vw,42px)", fontWeight: 900 }}>AUCTION HOUSE</h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Beats · NFTs · VIP Seats · Backstage Passes · Merch · Tickets</p>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {(["all", ...FILTERS] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 14px", borderRadius: 20, fontSize: 9, fontWeight: 800, cursor: "pointer", border: "none", letterSpacing: "0.1em", textTransform: "capitalize", background: filter === f ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.05)", color: filter === f ? "#FFD700" : "rgba(255,255,255,0.4)", outline: filter === f ? "1px solid rgba(255,215,0,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
              {f.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {items.map(item => {
            const remaining = item.endsAt - now;
            const urgent = remaining < 3600000;
            return (
              <div key={item.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}22`, borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 32 }}>{item.emoji}</span>
                  <span style={{ fontSize: 8, fontWeight: 900, color: item.color, background: `${item.color}18`, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.1em" }}>
                    {item.type.replace("-", " ").toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>by {item.seller}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>CURRENT BID</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>${item.currentBid}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{item.bids} bids</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: urgent ? "#FF2020" : "rgba(255,255,255,0.35)", marginBottom: 2, fontWeight: urgent ? 800 : 400 }}>ENDS IN</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: urgent ? "#FF2020" : "#fff", fontVariantNumeric: "tabular-nums" }}>{countdown(remaining)}</div>
                  </div>
                </div>
                <Link href={`/auction/${item.id}`} style={{ display: "block", textAlign: "center", padding: "11px 0", borderRadius: 10, background: `linear-gradient(90deg, ${item.color}CC, ${item.color}88)`, color: "#000", fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.1em" }}>
                  BID NOW →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
