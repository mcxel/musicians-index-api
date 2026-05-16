"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type LiveRoom = {
  id: string;
  genre: string;
  hostInitials: string;
  crowd: number;
  accent: string;
  href: string;
};

const ROOMS: LiveRoom[] = [
  { id: "r1", genre: "R&B",       hostInitials: "KV", crowd: 5, accent: "#FF2DAA", href: "/cypher" },
  { id: "r2", genre: "Trap",      hostInitials: "BA", crowd: 4, accent: "#AA2DFF", href: "/cypher" },
  { id: "r3", genre: "Rock",      hostInitials: "DS", crowd: 2, accent: "#00FFFF", href: "/cypher" },
  { id: "r4", genre: "Afrobeats", hostInitials: "NV", crowd: 6, accent: "#FFD700", href: "/lobbies" },
  { id: "r5", genre: "Gospel",    hostInitials: "JB", crowd: 3, accent: "#00FF88", href: "/lobbies" },
  { id: "r6", genre: "Open",      hostInitials: "MR", crowd: 1, accent: "#FF6B35", href: "/lobbies" },
];

function RoomMiniCard({ room, delay }: { room: LiveRoom; delay: number }) {
  return (
    <Link href={room.href} style={{ textDecoration: "none" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay }}
        whileHover={{ scale: 1.06 }}
        style={{
          position: "relative", overflow: "hidden",
          borderRadius: 7, padding: "6px 7px", cursor: "pointer",
          border: `1px solid ${room.accent}33`,
          background: `${room.accent}0a`,
        }}
      >
        {/* Live blink */}
        <motion.div
          animate={{ opacity: [0, 0.55, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, borderRadius: 7, border: `1px solid ${room.accent}`, pointerEvents: "none" }}
        />
        {/* Host circle */}
        <div style={{
          width: 22, height: 22, borderRadius: "50%", marginBottom: 3,
          background: `${room.accent}1a`, border: `1px solid ${room.accent}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 6, fontWeight: 900, color: room.accent,
        }}>
          {room.hostInitials}
        </div>
        <div style={{ fontSize: 6, fontWeight: 900, color: room.accent, letterSpacing: "0.08em" }}>{room.genre}</div>
        <div style={{ fontSize: 5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{room.crowd} live</div>
      </motion.div>
    </Link>
  );
}

export default function CypherRoomPreviewGrid() {
  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 6 }}>
        LIVE ROOMS · {ROOMS.length} ACTIVE
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
        {ROOMS.map((room, i) => (
          <RoomMiniCard key={room.id} room={room} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}
