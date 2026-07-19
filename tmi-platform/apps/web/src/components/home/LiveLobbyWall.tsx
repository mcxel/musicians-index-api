"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedLobbyWallDrawer } from "@/components/lobby/AnimatedLobbyWallDrawer";

const QUICK_ROOMS = [
  { title: "Lobby A",     subtitle: "R&B · Concerts",   accent: "#FF2DAA", glyph: "🎤" },
  { title: "Lobby B",     subtitle: "Battles · Cyphers", accent: "#00FFFF", glyph: "⚔️" },
  { title: "Fan Lounge",  subtitle: "Chill · Social",    accent: "#AA2DFF", glyph: "🛋️" },
  { title: "Dance Party", subtitle: "DJ · Floor",        accent: "#FFD700", glyph: "💃" },
];

export default function LiveLobbyWall() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AnimatedLobbyWallDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Quick-access 2×2 grid — tapping any card opens the full drawer */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          {QUICK_ROOMS.map((room, i) => (
            <motion.button
              key={room.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawerOpen(true)}
              style={{
                borderRadius: 12,
                border: `1px solid ${room.accent}44`,
                background: `linear-gradient(160deg, ${room.accent}14 0%, rgba(8,6,22,0.94) 100%)`,
                minHeight: 76,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Animated glow pulse */}
              <motion.div
                animate={{ opacity: [0, 0.28, 0] }}
                transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.5 }}
                style={{
                  position: "absolute", inset: 0,
                  boxShadow: `inset 0 0 18px ${room.accent}`,
                  borderRadius: 12, pointerEvents: "none",
                }}
              />
              <div style={{ fontSize: 16 }}>{room.glyph}</div>
              <div>
                <div style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>{room.title}</div>
                <div style={{ fontSize: 8, color: room.accent, fontWeight: 700, letterSpacing: "0.08em", marginTop: 2 }}>
                  {room.subtitle}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* "See All" button opens the full animated drawer */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setDrawerOpen(true)}
          style={{
            width: "100%", padding: "8px 0", borderRadius: 8,
            border: "1px solid rgba(0,229,255,0.3)",
            background: "rgba(0,229,255,0.06)",
            color: "#00e5ff", fontSize: 11, fontWeight: 800,
            letterSpacing: "0.08em", cursor: "pointer",
          }}
        >
          ALL LOBBIES & LOUNGES →
        </motion.button>
      </div>
    </>
  );
}
