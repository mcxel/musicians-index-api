"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Bid { bidder: string; amount: number; at: number }

const MOCK: Record<string, { title: string; seller: string; emoji: string; color: string; currentBid: number; endsAt: number; bids: Bid[]; description: string }> = {
  a1: { title: "Exclusive Beat Pack Vol.12", seller: "Nova Cipher", emoji: "🎛️", color: "#AA2DFF", currentBid: 280,  endsAt: Date.now() + 2 * 3600000, description: "12 exclusive trap/R&B beats, stems included, full commercial rights.", bids: [{ bidder: "Fan_A", amount: 280, at: Date.now() - 120000 }, { bidder: "Fan_B", amount: 240, at: Date.now() - 300000 }] },
  a2: { title: "Front-Row VIP Seat",         seller: "TMI Events",  emoji: "💺", color: "#FFD700", currentBid: 550,  endsAt: Date.now() + 5 * 3600000, description: "Front-row seat at the World Concert with backstage access pass included.", bids: [{ bidder: "Fan_C", amount: 550, at: Date.now() - 60000 }] },
  a3: { title: "Signed NFT Drop #007",        seller: "Wavetek",     emoji: "🖼️", color: "#FF2DAA", currentBid: 1200, endsAt: Date.now() + 1 * 3600000, description: "1-of-1 generative NFT hand-signed by the artist with unlockable content.", bids: [{ bidder: "Fan_D", amount: 1200, at: Date.now() - 30000 }] },
};

function countdown(ms: number) {
  if (ms <= 0) return "ENDED";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

export default function AuctionDetailPage() {
  const rawParams = useParams<{ id: string }>();
  const id = rawParams?.id ?? "a1";
  const router = useRouter();
  const item = (id && MOCK[id]) ? MOCK[id] : MOCK["a1"];

  const [now, setNow] = useState(Date.now());
  const [bidAmount, setBidAmount] = useState(item.currentBid + 10);
  const [bids, setBids] = useState(item.bids);
  const [topBid, setTopBid] = useState(item.currentBid);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  async function placeBid() {
    if (bidAmount <= topBid) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const newBid: Bid = { bidder: "You", amount: bidAmount, at: Date.now() };
    setBids(prev => [newBid, ...prev]);
    setTopBid(bidAmount);
    setBidAmount(bidAmount + 10);
    setSubmitting(false);
    // In production: POST /api/auction/bid with { auctionId: id, amount: bidAmount }
    router.push(`/api/stripe/checkout?priceId=price_auction&amount=${bidAmount * 100}&productName=${encodeURIComponent(item.title)}&mode=payment`);
  }

  const remaining = item.endsAt - now;
  const urgent = remaining < 3600000;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 20px", display: "flex", gap: 16, alignItems: "center", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/auction" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← Auction House</Link>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* Left — item detail */}
          <div>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{item.emoji}</div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(20px,3vw,30px)", fontWeight: 900 }}>{item.title}</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Listed by <span style={{ color: item.color, fontWeight: 700 }}>{item.seller}</span></div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 24 }}>{item.description}</p>

            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", marginBottom: 10 }}>BID HISTORY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bids.map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize: 12, fontWeight: b.bidder === "You" ? 800 : 400, color: b.bidder === "You" ? item.color : "#fff" }}>{b.bidder}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: item.color }}>${b.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — bid box */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}33`, borderRadius: 16, padding: 24, position: "sticky", top: 64 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>CURRENT HIGH BID</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: item.color }}>${topBid}</div>
              <div style={{ fontSize: 12, marginTop: 4, color: urgent ? "#FF2020" : "rgba(255,255,255,0.4)", fontWeight: urgent ? 800 : 400 }}>
                {urgent ? "⚠️ " : ""}Ends in {countdown(remaining)}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", display: "block", marginBottom: 6 }}>YOUR BID (USD)</label>
              <input
                type="number"
                min={topBid + 1}
                step={5}
                value={bidAmount}
                onChange={e => setBidAmount(Number(e.target.value))}
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: `1px solid ${item.color}44`, borderRadius: 8, color: "#fff", fontSize: 18, fontWeight: 900, outline: "none", boxSizing: "border-box" }}
              />
              {bidAmount <= topBid && <div style={{ fontSize: 10, color: "#FF2020", marginTop: 4 }}>Bid must be above ${topBid}</div>}
            </div>

            <button
              onClick={placeBid}
              disabled={submitting || bidAmount <= topBid}
              style={{ width: "100%", padding: "14px 0", borderRadius: 10, border: "none", background: bidAmount > topBid ? `linear-gradient(90deg, ${item.color}, ${item.color}AA)` : "rgba(255,255,255,0.08)", color: bidAmount > topBid ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 900, fontSize: 13, cursor: bidAmount > topBid ? "pointer" : "not-allowed", letterSpacing: "0.1em" }}
            >
              {submitting ? "PLACING BID…" : "PLACE BID →"}
            </button>

            <div style={{ marginTop: 14, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.6 }}>
              By bidding you agree to complete the purchase via Stripe if you win.
              Winning bid is charged automatically at auction close.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
