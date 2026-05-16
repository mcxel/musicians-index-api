"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const C1 = "#FF2DAA";
const C2 = "#AA2DFF";

type LobbyRoom = {
  id: string;
  name: string;
  genre: string;
  hostName: string;
  population: number;
  maxSlots: number;
  isLive: boolean;
  accent: string;
};

const LOBBY_ROOMS: LobbyRoom[] = [
  { id: "r1", name: "Crown Cypher", genre: "R&B", hostName: "KOVA", population: 5, maxSlots: 6, isLive: true, accent: C1 },
  { id: "r2", name: "Guitar Clash", genre: "Rock", hostName: "Drift Sound", population: 2, maxSlots: 4, isLive: true, accent: "#00FFFF" },
  { id: "r3", name: "Producer Beat Off", genre: "Trap", hostName: "BeatArchitect", population: 4, maxSlots: 6, isLive: true, accent: "#FFD700" },
  { id: "r4", name: "Open Jam", genre: "Open", hostName: "Julius.B", population: 3, maxSlots: 8, isLive: false, accent: "#00FF88" },
];

// Stage light positions
const STAGE_LIGHTS = [
  { x: "18%", color: C1 },
  { x: "38%", color: "#FFD700" },
  { x: "58%", color: C2 },
  { x: "78%", color: "#00FFFF" },
];

export default function Home3PreviewLobbyCard({ href = "/lobbies" }: { href?: string }) {
  const [activeRoom, setActiveRoom] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveRoom((i) => (i + 1) % LOBBY_ROOMS.length), 4200);
    return () => clearInterval(t);
  }, []);

  const room = LOBBY_ROOMS[activeRoom]!;
  const pct = Math.round((room.population / room.maxSlots) * 100);

  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#0a0012", border: `1.5px solid ${room.accent}33`, minHeight: 130 }}>
      {/* Stage light layer */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, pointerEvents: "none" }}>
        {STAGE_LIGHTS.map((l, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.18, 0.55, 0.18], scaleY: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
            style={{
              position: "absolute", top: 0, left: l.x,
              width: 40, height: 80,
              background: `linear-gradient(180deg, ${l.color}44 0%, transparent 100%)`,
              clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)",
              transformOrigin: "50% 0%",
            }}
          />
        ))}
      </div>

      {/* Background glow */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${room.accent}12 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "10px 12px 10px" }}>
        {/* Live badge + room label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <AnimatePresence mode="wait">
            {room.isLive ? (
              <motion.div
                key="live"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 999, background: "#CC000020", border: "1px solid #CC000055" }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4444", flexShrink: 0, boxShadow: "0 0 6px #FF4444" }}
                />
                <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.2em", color: "#FF4444", textTransform: "uppercase" }}>LIVE</span>
              </motion.div>
            ) : (
              <motion.div
                key="queuing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: "2px 7px", borderRadius: 999, background: `${room.accent}14`, border: `1px solid ${room.accent}33` }}
              >
                <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.2em", color: room.accent, textTransform: "uppercase" }}>QUEUEING</span>
              </motion.div>
            )}
          </AnimatePresence>
          <span style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>MAIN STAGE</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "0.04em", marginBottom: 2 }}>{room.name}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
              Hosted by <span style={{ color: room.accent, fontWeight: 700 }}>{room.hostName}</span> · {room.genre}
            </div>

            {/* Audience visual */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: room.maxSlots }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: i < room.population ? room.accent : "rgba(255,255,255,0.1)",
                      border: `1px solid ${i < room.population ? room.accent : "rgba(255,255,255,0.08)"}`,
                      boxShadow: i < room.population ? `0 0 4px ${room.accent}` : "none",
                      transition: "all 0.4s ease",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>{room.population}/{room.maxSlots} performers</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Capacity bar */}
        <div style={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 8 }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ height: "100%", background: room.accent, borderRadius: 1, boxShadow: `0 0 6px ${room.accent}` }}
          />
        </div>

        {/* CTA */}
        <Link href={href} style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 999,
              background: `linear-gradient(135deg, ${C1}22, ${C2}22)`,
              border: `1px solid ${room.accent}55`,
              fontSize: 7, fontWeight: 900, letterSpacing: "0.18em",
              color: room.accent, textTransform: "uppercase",
            }}
          >
            ENTER LIVE ROOM →
          </motion.div>
        </Link>
      </div>

      {/* Bottom room selector dots */}
      <div style={{ position: "absolute", bottom: 8, right: 10, display: "flex", gap: 4 }}>
        {LOBBY_ROOMS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveRoom(i)}
            style={{
              width: i === activeRoom ? 14 : 5, height: 5, borderRadius: 999, padding: 0, border: "none", cursor: "pointer",
              background: i === activeRoom ? room.accent : "rgba(255,255,255,0.18)",
              transition: "all 220ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
