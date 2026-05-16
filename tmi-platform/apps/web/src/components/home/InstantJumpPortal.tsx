"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Portal = {
  label: string;
  desc: string;
  color: string;
  href: string;
  icon: string;
};

const PORTALS: Portal[] = [
  { label: "Cypher",  desc: "Circle session · Open",     color: "#AA2DFF", href: "/cypher",                      icon: "⬤" },
  { label: "Battle",  desc: "Head-to-head · Live now",   color: "#CC0000", href: "/battles",                     icon: "⚔️" },
  { label: "Lobby",   desc: "All rooms · Browse live",   color: "#00FFFF", href: "/lobbies",                     icon: "🏛️" },
  { label: "Stage",   desc: "Monday Night · Every week", color: "#FFD700", href: "/events/monday-night-stage",   icon: "🎤" },
];

export default function InstantJumpPortal() {
  const [burst, setBurst] = useState<string | null>(null);

  function handleClick(id: string) {
    setBurst(id);
    setTimeout(() => setBurst(null), 600);
  }

  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 8 }}>
        INSTANT JUMP
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {PORTALS.map((portal) => (
          <Link
            key={portal.label}
            href={portal.href}
            style={{ textDecoration: "none" }}
            onClick={() => handleClick(portal.label)}
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                position: "relative", overflow: "hidden",
                borderRadius: 9,
                border: `1.5px solid ${portal.color}44`,
                background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${portal.color}14 0%, transparent 70%)`,
                padding: "12px 10px",
                cursor: "pointer",
              }}
            >
              {/* Ring pulse */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                style={{
                  position: "absolute", inset: -4, borderRadius: 12,
                  border: `1px solid ${portal.color}33`, pointerEvents: "none",
                }}
              />
              {/* Burst on click */}
              <AnimatePresence>
                {burst === portal.label && (
                  <motion.div
                    key="burst"
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ position: "absolute", inset: 0, borderRadius: 9, border: `2px solid ${portal.color}`, pointerEvents: "none" }}
                  />
                )}
              </AnimatePresence>
              <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 4, filter: `drop-shadow(0 0 8px ${portal.color})` }}>
                  {portal.icon}
                </div>
                <div style={{ fontSize: 9, fontWeight: 900, color: portal.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {portal.label}
                </div>
                <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{portal.desc}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
