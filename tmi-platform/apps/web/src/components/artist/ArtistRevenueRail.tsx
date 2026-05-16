"use client";
import { motion } from "framer-motion";

const REVENUE_STREAMS = [
  { label: "Streaming",    amount: 4820,  pct: 38, color: "#00FFFF",  icon: "▶" },
  { label: "Live Shows",   amount: 3200,  pct: 25, color: "#FF2DAA",  icon: "🎤" },
  { label: "Merchandise",  amount: 2240,  pct: 18, color: "#FFD700",  icon: "◈" },
  { label: "Sponsorships", amount: 1540,  pct: 12, color: "#AA2DFF",  icon: "★" },
  { label: "Fan Tips",     amount: 880,   pct: 7,  color: "#FF8C00",  icon: "♥" },
];

const TOTAL = REVENUE_STREAMS.reduce((s, r) => s + r.amount, 0);

const RECENT_PAYOUTS = [
  { date: "Apr 28", amount: 1240, source: "TMI Streaming", color: "#00FFFF" },
  { date: "Apr 22", amount: 800,  source: "Crown Night Show", color: "#FF2DAA" },
  { date: "Apr 15", amount: 420,  source: "Merch Drop #3", color: "#FFD700" },
];

export default function ArtistRevenueRail() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.04) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(255,215,0,0.12)",
        borderLeft: "3px solid #FFD700",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FFD700" }}>
          $ REVENUE
        </div>
        <div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>THIS MONTH  </span>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#FFD700", letterSpacing: "-0.01em" }}>
            ${TOTAL.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Revenue breakdown bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {REVENUE_STREAMS.map((stream, i) => (
          <motion.div
            key={stream.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.07 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: stream.color }}>{stream.icon}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{stream.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: stream.color, fontWeight: 700 }}>${stream.amount.toLocaleString()}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", width: 28, textAlign: "right" }}>{stream.pct}%</span>
              </div>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${stream.pct}%` }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", background: stream.color, borderRadius: 2, opacity: 0.8 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent payouts */}
      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
        RECENT PAYOUTS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {RECENT_PAYOUTS.map((payout, i) => (
          <motion.div
            key={`${payout.date}-${payout.source}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.06 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderRadius: 6,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${payout.color}10`,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", width: 36 }}>{payout.date}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{payout.source}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: payout.color }}>+${payout.amount}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
