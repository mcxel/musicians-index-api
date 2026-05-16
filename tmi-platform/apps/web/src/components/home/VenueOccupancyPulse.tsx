"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type VenueRoom = {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  accent: string;
  href: string;
};

const ROOMS: VenueRoom[] = [
  { id: "v1", name: "Crown Cypher",       capacity: 20,  occupied: 17, accent: "#FFD700", href: "/cypher" },
  { id: "v2", name: "Guitar Clash",       capacity: 12,  occupied: 12, accent: "#00FFFF", href: "/cypher" },
  { id: "v3", name: "Producer Beat Off",  capacity: 16,  occupied: 9,  accent: "#AA2DFF", href: "/cypher" },
  { id: "v4", name: "R&B Spotlight",      capacity: 8,   occupied: 6,  accent: "#FF2DAA", href: "/cypher" },
  { id: "v5", name: "Open Jam",           capacity: 30,  occupied: 4,  accent: "#00FF88", href: "/lobbies" },
  { id: "v6", name: "Monday Stage",       capacity: 100, occupied: 82, accent: "#FF6B35", href: "/events/monday-night-stage" },
];

function occupancyStatus(occupied: number, capacity: number): { label: string; color: string } {
  const pct = occupied / capacity;
  if (pct >= 1)    return { label: "FULL",    color: "#CC0000" };
  if (pct >= 0.8)  return { label: "FILLING", color: "#FFD700" };
  if (pct >= 0.4)  return { label: "ACTIVE",  color: "#00FF88" };
  return             { label: "OPEN",    color: "rgba(255,255,255,0.35)" };
}

export default function VenueOccupancyPulse() {
  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 8 }}>
        VENUE OCCUPANCY
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {ROOMS.map((room, i) => {
          const fill = room.occupied / room.capacity;
          const { label, color } = occupancyStatus(room.occupied, room.capacity);
          const pct = Math.round(fill * 100);
          return (
            <Link key={room.id} href={room.href} style={{ textDecoration: "none" }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.01 }}
                style={{
                  borderRadius: 7, border: `1px solid ${room.accent}22`,
                  background: "rgba(0,0,0,0.3)", padding: "6px 10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, fontSize: 8, fontWeight: 900, color: "#fff" }}>{room.name}</div>
                  <motion.span
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: room.accent, boxShadow: `0 0 6px ${room.accent}` }}
                  />
                  <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.14em", color, textTransform: "uppercase" }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 7, color: room.accent, fontWeight: 900 }}>{pct}%</span>
                </div>
                {/* Occupancy bar */}
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: [fill, Math.max(0.04, fill - 0.03), fill] }}
                    transition={{ duration: 1.9, delay: i * 0.08, ease: "easeInOut", repeat: Infinity }}
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      transformOrigin: "left",
                      background: fill >= 1
                        ? "#CC0000"
                        : `linear-gradient(90deg, ${room.accent}, ${room.accent}88)`,
                    }}
                  />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
