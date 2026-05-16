"use client";

// SpreadRankChip
// Large corner rank number chips for Home 1-2 rank cards
// Positioned top-left of each card row — replaces the quiet "#N" text

import { motion } from "framer-motion";

type Props = {
  rank: number;
  accentColor: string;
};

export default function SpreadRankChip({ rank, accentColor }: Props) {
  const isFirst = rank === 1;
  const color = isFirst ? "#FFD700" : rank <= 3 ? "#FF2DAA" : accentColor;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.82 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 440, damping: 22, delay: 0.06 * rank }}
      style={{
        minWidth: 28,
        height: 28,
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: isFirst ? 12 : 10,
        letterSpacing: isFirst ? "0.04em" : "0.06em",
        color,
        background: isFirst
          ? "linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,215,0,0.06))"
          : `rgba(0,0,0,0.55)`,
        border: `1.5px solid ${color}66`,
        boxShadow: isFirst
          ? `0 0 12px rgba(255,215,0,0.55), 0 0 4px rgba(255,215,0,0.3) inset`
          : `0 0 6px ${color}44`,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {isFirst ? "👑" : `#${rank}`}
    </motion.div>
  );
}
