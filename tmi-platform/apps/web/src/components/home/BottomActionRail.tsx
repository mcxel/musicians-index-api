"use client";

/**
 * BottomActionRail.tsx
 * Layer 8 — Strong CTA buttons at cover bottom.
 * Large, magazine-style, glowing.
 */

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const CTA_LABELS = ["Join TMI", "Join for free"];
const CTA_INTERVAL_MS = 4500;

const ACTIONS = [
  { id: "join",          href: "/auth",           bg: "#FF2DAA", fg: "#fff", glow: "#FF2DAA" },
  { id: "magazine",      href: "/home/2",          bg: "#00FFFF", fg: "#000", glow: "#00FFFF",  label: "Read Magazine" },
  { id: "vote",          href: "/rankings",       bg: "#FFD700", fg: "#000", glow: "#FFD700",  label: "Vote Live"     },
  { id: "battle",        href: "/home/5",         bg: "#AA2DFF", fg: "#fff", glow: "#AA2DFF",  label: "Join Battle"   },
  { id: "rooms",         href: "/live",           bg: "#FF6B35", fg: "#fff", glow: "#FF6B35",  label: "See Rooms"     },
];

export default function BottomActionRail() {
  const [ctaIdx,   setCtaIdx]   = useState(0);
  const [ctaFlash, setCtaFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setCtaFlash(true);
      const swap = setTimeout(() => {
        setCtaIdx((i) => (i + 1) % CTA_LABELS.length);
        setCtaFlash(false);
      }, 220);
      return () => clearTimeout(swap);
    }, CTA_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

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
      {ACTIONS.map((a) => {
        const isJoin = a.id === "join";
        const label  = isJoin ? CTA_LABELS[ctaIdx] : a.label!;

        return (
          <Link key={a.id} href={a.href} style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  `0 0 8px ${a.glow}40`,
                  `0 0 18px ${a.glow}80`,
                  `0 0 8px ${a.glow}40`,
                ],
                opacity: isJoin && ctaFlash ? 0 : 1,
              }}
              transition={{ duration: isJoin && ctaFlash ? 0.18 : 2.2, repeat: isJoin && ctaFlash ? 0 : Infinity }}
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
                minWidth: isJoin ? 110 : undefined,
                textAlign: "center",
              }}
            >
              {label}
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
