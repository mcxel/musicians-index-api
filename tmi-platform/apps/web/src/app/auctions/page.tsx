"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type AuctionItem = {
  id: string; title: string; type: string; seller: string; currentBid: number;
  reservePrice: number; buyoutPrice: number; endsAt: number; bids: number; color: string; icon: string;
  description: string;
};

const INITIAL_AUCTIONS: AuctionItem[] = [
  { id: "a1", title: "Holy Water (Beat — Exclusive)", type: "BEAT", seller: "Wavetek", currentBid: 420, reservePrice: 300, buyoutPrice: 1200, endsAt: Date.now() + 2*60*60*1000 + 14*60*1000, bids: 7, color: "#FFD700", icon: "🎛️", description: "Exclusive rights to a cinematic trap beat with orchestral elements. 140BPM. Full stems included." },
  { id: "a2", title: "Cyber Genesis NFT #001", type: "NFT", seller: "TMI Art", currentBid: 280, reservePrice: 200, buyoutPrice: 900, endsAt: Date.now() + 4*60*60*1000 + 22*60*1000, bids: 5, color: "#00FFFF", icon: "🎨", description: "Generative art piece from the first TMI Genesis collection. 1/1 unique. Includes commercial rights." },
  { id: "a3", title: "VIP Table — Dirty Dozens Finale", type: "TICKET", seller: "TMI Events", currentBid: 150, reservePrice: 100, buyoutPrice: 400, endsAt: Date.now() + 24*60*60*1000 + 6*60*60*1000, bids: 9, color: "#FF2DAA", icon: "🎟️", description: "Front-row VIP table for the Dirty Dozens season finale. Includes bottle service and backstage pass." },
  { id: "a4", title: "Cold World — Full Stems", type: "INSTRUMENTAL", seller: "Krypt", currentBid: 550, reservePrice: 400, buyoutPrice: 1500, endsAt: Date.now() + 18*60*60*1000, bids: 12, color: "#AA2DFF", icon: "🎼", description: "Full stem pack for Cold World. Dark melodic trap. 8 stems, 148BPM, D minor. Used on 3 charting tracks." },
  { id: "a5", title: "Wavetek Signed Poster", type: "COLLECTIBLE", seller: "Wavetek", currentBid: 85, reservePrice: 50, buyoutPrice: 300, endsAt: Date.now() + 3*24*60*60*1000 + 2*60*60*1000, bids: 3, color: "#00FF88", icon: "📸", description: "Hand-signed limited edition promo poster from the Wavetape Era tour. Only 10 exist. Authenticated." },
];

const TYPE_COLORS: Record<string, string> = { BEAT: "#FFD700", NFT: "#00FFFF", TICKET: "#FF2DAA", INSTRUMENTAL: "#AA2DFF", COLLECTIBLE: "#00FF88" };

function formatCountdown(ms: number): string {
  if (ms <= 0) return "ENDED";
  const d = Math.floor(ms / (1000*60*60*24));
  const h = Math.floor((ms % (1000*60*60*24)) / (1000*60*60));
  const m = Math.floor((ms % (1000*60*60)) / (1000*60));
  const s = Math.floor((ms % (1000*60)) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function useCountdown(endsAt: number) {
  const [remaining, setRemaining] = useState(endsAt - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(endsAt - Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

function AuctionCard({
  auction,
  onBid,
  onBuyNow,
}: {
  auction: AuctionItem;
  onBid: (id: string) => void;
  onBuyNow: (id: string) => void;
}) {
  const remaining = useCountdown(auction.endsAt);
  const urgent = remaining < 60 * 60 * 1000;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: `0 12px 40px ${auction.color}18` }}
      transition={{ duration: 0.22 }}
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${auction.color}20`, borderRadius: 16, padding: "22px 24px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left: icon + info */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 32, flexShrink: 0 }}>{auction.icon}</span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: TYPE_COLORS[auction.type] ?? auction.color, marginBottom: 4 }}>{auction.type}</div>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 3px" }}>{auction.title}</h3>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>by {auction.seller}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{auction.description}</div>
          </div>
        </div>

        {/* Right: bid info + actions */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em" }}>CURRENT BID</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: auction.color }}>${auction.currentBid.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{auction.bids} bids</div>
            <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: urgent ? "#FF2DAA" : "#00FF88" }}>
              ⏱ {formatCountdown(remaining)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => onBid(auction.id)}
              style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: auction.color, border: `1px solid ${auction.color}55`, borderRadius: 8, background: `${auction.color}10`, cursor: "pointer" }}>
              PLACE BID
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => onBuyNow(auction.id)}
              style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FF88", borderRadius: 8, border: "none", cursor: "pointer" }}>
              BUY ${auction.buyoutPrice.toLocaleString()}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bid history mini bar */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${auction.color}12`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Reserve: ${auction.reservePrice.toLocaleString()} · Buy now: ${auction.buyoutPrice.toLocaleString()}</div>
        <div style={{ fontSize: 9, color: auction.currentBid >= auction.reservePrice ? "#00FF88" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>
          {auction.currentBid >= auction.reservePrice ? "✓ Reserve met" : "Reserve not met"}
        </div>
      </div>
    </motion.article>
  );
}

function BidModal({
  auction,
  onClose,
  onBidPlaced,
}: {
  auction: AuctionItem;
  onClose: () => void;
  onBidPlaced: (id: string, amount: number) => void;
}) {
  const minBid = auction.currentBid + 10;
  const [amount, setAmount] = useState(String(minBid));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (num < minBid) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
    onBidPlaced(auction.id, num);
    setTimeout(onClose, 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#0a0a1a", border: `1px solid ${auction.color}30`, borderRadius: 18, padding: "32px 28px", maxWidth: 420, width: "100%" }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88", marginBottom: 8 }}>Bid Placed!</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>You&apos;re the highest bidder at ${amount}.</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: auction.color, marginBottom: 6 }}>{auction.type}</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{auction.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>by {auction.seller}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Current bid</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: auction.color }}>${auction.currentBid.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Minimum bid</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>${minBid.toLocaleString()}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", display: "block", marginBottom: 8 }}>
                YOUR BID AMOUNT (USD)
              </label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#FFD700", fontWeight: 800 }}>$</span>
                <input
                  type="number" min={minBid} step="5" required
                  value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${auction.color}40`, borderRadius: 10, padding: "12px 12px 12px 28px", color: "#fff", fontSize: 20, fontWeight: 800, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer" }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" disabled={submitting}
                  style={{ flex: 2, padding: "12px", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: submitting ? "rgba(0,255,136,0.5)" : "#00FF88", border: "none", borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Placing Bid..." : `PLACE BID · $${amount}`}
                </motion.button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionItem[]>(INITIAL_AUCTIONS);
  const [bidModalId, setBidModalId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const bidModalAuction = bidModalId ? auctions.find(a => a.id === bidModalId) : null;

  const onBidPlaced = useCallback((id: string, amount: number) => {
    setAuctions(prev => prev.map(a => a.id === id ? { ...a, currentBid: amount, bids: a.bids + 1 } : a));
  }, []);

  const types = ["ALL", ...Object.keys(TYPE_COLORS)];
  const displayed = filter === "ALL" ? auctions : auctions.filter(a => a.type === filter);
  const totalBids = auctions.reduce((s, a) => s + a.bids, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <AnimatePresence>
        {bidModalAuction && (
          <BidModal auction={bidModalAuction} onClose={() => setBidModalId(null)} onBidPlaced={onBidPlaced} />
        )}
      </AnimatePresence>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>TMI VAULT</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Live Auctions</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 12px", lineHeight: 1.6 }}>
          Bid on exclusive beats, NFTs, VIP access, and artist collectibles. Highest bid wins.
        </p>
        <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 700, marginBottom: 28 }}>
          {auctions.length} live auctions · {totalBids} total bids
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/beats/auctions" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, textDecoration: "none" }}>BEAT AUCTIONS</Link>
          <Link href="/nft-marketplace" style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>NFT MARKETPLACE</Link>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "5px 14px", borderRadius: 4, cursor: "pointer", border: `1px solid ${t === "ALL" ? "rgba(255,255,255,0.3)" : (TYPE_COLORS[t] ?? "#fff") + "40"}`,
                background: filter === t ? (t === "ALL" ? "rgba(255,255,255,0.1)" : (TYPE_COLORS[t] ?? "#fff") + "18") : "transparent",
                color: filter === t ? (t === "ALL" ? "#fff" : TYPE_COLORS[t] ?? "#fff") : "rgba(255,255,255,0.4)" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {displayed.map(a => (
            <AuctionCard key={a.id} auction={a} onBid={setBidModalId} onBuyNow={(id) => {
              const item = auctions.find(x => x.id === id);
              if (item) window.location.href = `/checkout?item=${id}&price=${item.buyoutPrice}&type=auction-buyout`;
            }} />
          ))}
        </div>
      </section>
    </main>
  );
}
