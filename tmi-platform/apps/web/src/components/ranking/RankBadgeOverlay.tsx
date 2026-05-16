"use client";

// RankBadgeOverlay
// Animated rank numerals overlaid on orbit nodes or rank cards
// Designed to sit on top of portraits as corner chips

import { motion } from "framer-motion";

type Props = {
  rank: number;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
};

const SIZE_MAP = {
  sm: { outer: 20, font: 8, padding: "2px 5px" },
  md: { outer: 28, font: 11, padding: "3px 7px" },
  lg: { outer: 36, font: 15, padding: "4px 9px" },
};

function rankColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "#00FFFF";
}

export default function RankBadgeOverlay({
  rank,
  accentColor,
  size = "md",
  animated = true,
}: Props) {
  const color = accentColor ?? rankColor(rank);
  const { outer, font, padding } = SIZE_MAP[size];

  const badge = (
    <div
      style={{
        minWidth: outer,
        height: outer,
        borderRadius: 6,
        background: rank === 1
          ? "linear-gradient(135deg, rgba(255,215,0,0.28), rgba(255,215,0,0.08))"
          : `rgba(0,0,0,0.72)`,
        border: `1.5px solid ${color}88`,
        boxShadow: `0 0 8px ${color}55, inset 0 0 4px ${color}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding,
        fontWeight: 900,
        fontSize: font,
        color,
        letterSpacing: "0.04em",
        lineHeight: 1,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {rank === 1 ? "👑" : `#${rank}`}
    </div>
  );

  if (!animated) return badge;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 20, delay: 0.08 * rank }}
    >
      {rank === 1 ? (
        <motion.div
          animate={{ boxShadow: [
            `0 0 8px ${color}55`,
            `0 0 20px ${color}99`,
            `0 0 8px ${color}55`,
          ]}}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {badge}
        </motion.div>
      ) : badge}
    </motion.div>
  );
}
