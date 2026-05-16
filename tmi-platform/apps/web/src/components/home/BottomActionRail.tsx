"use client";

/**
 * BottomActionRail.tsx
 * Layer 8 — Strong CTA buttons at cover bottom.
 * Large, magazine-style, glowing.
 */

import Link from "next/link";
import { motion } from "framer-motion";

const ACTIONS = [
  { label: "Join TMI",      href: "/auth",           bg: "#FF2DAA", fg: "#fff", glow: "#FF2DAA" },
  { label: "Read Magazine", href: "/home/magazine",  bg: "#00FFFF", fg: "#000", glow: "#00FFFF" },
  { label: "Vote Live",     href: "/rankings/crown", bg: "#FFD700", fg: "#000", glow: "#FFD700" },
  { label: "Join Battle",   href: "/home/5",         bg: "#AA2DFF", fg: "#fff", glow: "#AA2DFF" },
  { label: "See Rooms",     href: "/live",           bg: "#FF6B35", fg: "#fff", glow: "#FF6B35" },
];

export default function BottomActionRail() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "14px 10px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(0deg, rgba(5,5,16,0.98), rgba(5,5,16,0.7))",
      }}
    >
      {ACTIONS.map((a) => (
        <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                `0 0 8px ${a.glow}40`,
                `0 0 18px ${a.glow}80`,
                `0 0 8px ${a.glow}40`,
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{
              background: a.bg,
              color: a.fg,
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {a.label}
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
