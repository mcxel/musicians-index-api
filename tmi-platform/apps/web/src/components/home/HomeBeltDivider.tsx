"use client";

// HomeBeltDivider
// Hard horizontal zone divider between Editorial / Discovery / Marketplace belts
// Neon line + glow corners + animated label

import { motion } from "framer-motion";

export type BeltLabel = "Editorial" | "Discovery" | "Platform & Marketplace";

const BELT_COLORS: Record<BeltLabel, string> = {
  "Editorial":              "#00FFFF",
  "Discovery":              "#FF2DAA",
  "Platform & Marketplace": "#FFD700",
};

type Props = {
  label: BeltLabel;
  animationDelay?: number;
};

export default function HomeBeltDivider({ label, animationDelay = 0 }: Props) {
  const color = BELT_COLORS[label];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: animationDelay }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "18px 0 12px",
        padding: "0 2px",
      }}
    >
      {/* Glow corner — left */}
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: animationDelay }}
        style={{
          width: 6,
          height: 6,
          borderRadius: 2,
          background: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }}
      />

      {/* Belt label */}
      <span
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color,
          textShadow: `0 0 10px ${color}66`,
          flexShrink: 0,
        }}
      >
        {label}
      </span>

      {/* Neon line */}
      <div
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(90deg, ${color}88, ${color}22, transparent)`,
        }}
      />

      {/* Glow corner — right */}
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: animationDelay + 0.9 }}
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
        }}
      />
    </motion.div>
  );
}
