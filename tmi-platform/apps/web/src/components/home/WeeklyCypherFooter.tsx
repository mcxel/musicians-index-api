"use client";

// WeeklyCypherFooter
// Bottom footer strip for Home 1: "Weekly Cyphers" with animated ticker text

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Weekly Cyphers · Every Monday 8PM",
  "Open Mic · All Genres Welcome",
  "Battle Season 1 · Crown Duel Live",
  "Top 10 Artists · Updated Daily",
  "Hip-Hop · R&B · Afrobeats · Jazz",
];

type Props = {
  accentColor?: string;
  intervalMs?: number;
};

export default function WeeklyCypherFooter({
  accentColor = "#00FFFF",
  intervalMs = 3800,
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflow: "hidden",
        height: 18,
      }}
    >
      {/* Pulse dot */}
      <motion.span
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: accentColor,
          boxShadow: `0 0 6px ${accentColor}`,
          flexShrink: 0,
        }}
      />

      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28 }}
          style={{
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accentColor,
            whiteSpace: "nowrap",
          }}
        >
          {MESSAGES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
