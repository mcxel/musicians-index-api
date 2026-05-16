"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const TIP_AMOUNTS = [5, 10, 25, 50, 100];

const RECENT_TIPS = [
  { fan: "StarGazer_99",   amount: 50,  message: "Crown Night was 🔥🔥",        color: "#FF2DAA", time: "2m ago" },
  { fan: "BeatRider_7",    amount: 25,  message: "Keep pushing the sound!",      color: "#00FFFF", time: "8m ago" },
  { fan: "NeonQueen",      amount: 100, message: "Legendary set. No cap.",        color: "#FFD700", time: "15m ago" },
  { fan: "PulseCheck_404", amount: 10,  message: "TMI forever",                  color: "#AA2DFF", time: "22m ago" },
];

export default function ArtistTipRail() {
  const [selected, setSelected] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!selected) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSelected(null); }, 2500);
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(170,45,255,0.04) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(170,45,255,0.12)",
        borderLeft: "3px solid #AA2DFF",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#AA2DFF" }}>
          ♥ TIP JAR
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          {RECENT_TIPS.length} tips this show
        </div>
      </div>

      {/* Tip amount selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {TIP_AMOUNTS.map(amt => (
          <button
            key={amt}
            onClick={() => setSelected(selected === amt ? null : amt)}
            style={{
              flex: "0 0 auto",
              padding: "8px 14px",
              borderRadius: 8,
              border: selected === amt ? "1px solid rgba(170,45,255,0.7)" : "1px solid rgba(170,45,255,0.2)",
              background: selected === amt ? "rgba(170,45,255,0.15)" : "rgba(170,45,255,0.04)",
              color: selected === amt ? "#AA2DFF" : "rgba(255,255,255,0.5)",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Send button */}
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: "center", padding: "10px", borderRadius: 8,
              background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.4)",
              color: "#AA2DFF", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
              marginBottom: 18,
            }}
          >
            ✓ TIP SENT — THANK YOU!
          </motion.div>
        ) : (
          <motion.button
            key="send"
            onClick={handleSend}
            disabled={!selected}
            style={{
              width: "100%", marginBottom: 18,
              padding: "10px 0", borderRadius: 8,
              background: selected ? "rgba(170,45,255,0.18)" : "rgba(255,255,255,0.03)",
              border: selected ? "1px solid rgba(170,45,255,0.5)" : "1px solid rgba(255,255,255,0.07)",
              color: selected ? "#AA2DFF" : "rgba(255,255,255,0.2)",
              fontSize: 10, fontWeight: 900, letterSpacing: "0.2em",
              cursor: selected ? "pointer" : "default",
              textTransform: "uppercase", transition: "all 0.15s",
            }}
          >
            {selected ? `SEND $${selected} TIP` : "SELECT AN AMOUNT"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Recent tips feed */}
      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
        RECENT TIPS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {RECENT_TIPS.map((tip, i) => (
          <motion.div
            key={`${tip.fan}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "8px 12px", borderRadius: 6,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${tip.color}10`,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: `${tip.color}18`, border: `1px solid ${tip.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: tip.color, fontWeight: 900,
            }}>
              {tip.fan[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: tip.color }}>{tip.fan}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>${tip.amount}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{tip.time}</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tip.message}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
