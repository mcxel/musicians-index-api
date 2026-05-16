"use client";

// GenreBattleTicker
// Rotating genre battle labels for Home 1 center-right
// Animates through: Rap Battle, Rock Battle, etc.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BATTLES = [
  { label: "Rap Battle",      icon: "🎤", color: "#FF2DAA" },
  { label: "Rock Battle",     icon: "🎸", color: "#FF6B35" },
  { label: "Country Battle",  icon: "🤠", color: "#FFD700" },
  { label: "Vocal Battle",    icon: "🎵", color: "#00FFFF" },
  { label: "Guitar Battle",   icon: "🎸", color: "#AA2DFF" },
  { label: "Piano Battle",    icon: "🎹", color: "#00FF88" },
  { label: "Producer Battle", icon: "🎛️", color: "#FFD700" },
];

type Props = {
  intervalMs?: number;
};

export default function GenreBattleTicker({ intervalMs = 2600 }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BATTLES.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  const current = BATTLES[idx]!;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "8px 10px",
        borderRadius: 10,
        border: `1px solid ${current.color}44`,
        background: `${current.color}09`,
        minWidth: 64,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
        }}
      >
        Live
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{current.icon}</span>
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: current.color,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            {current.label}
          </span>
        </motion.div>
      </AnimatePresence>

      <motion.span
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          fontSize: 6,
          fontWeight: 800,
          letterSpacing: "0.16em",
          color: current.color,
          textTransform: "uppercase",
        }}
      >
        LIVE ⚔️
      </motion.span>
    </div>
  );
}
