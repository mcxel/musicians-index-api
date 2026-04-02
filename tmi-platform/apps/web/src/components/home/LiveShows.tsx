"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

const LIVE_ROOMS = [
  { id: "1", name: "CROWN CYPHER ARENA", host: "JAYLEN CROSS", viewers: 1842, genre: "Hip-Hop / Cypher", color: "#FFD700" },
  { id: "2", name: "NEO-SOUL LOUNGE", host: "NOVA REIGN", viewers: 924, genre: "Neo-Soul / R&B", color: "#FF2DAA" },
  { id: "3", name: "BEATLAB OPEN MIC", host: "BEATLAB STUDIOS", viewers: 567, genre: "Open Genre", color: "#00FFFF" },
  { id: "4", name: "UNDERGROUND VAULT", host: "CYPHER KINGS", viewers: 412, genre: "Trap / Rap", color: "#AA2DFF" },
];

function PulseDot({ color }: { color: string }) {
  return (
    <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
      <motion.div
        animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }}
      />
      <div style={{ position: "absolute", inset: 1, borderRadius: "50%", background: color }} />
    </div>
  );
}

export default function LiveShows() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const totalViewers = LIVE_ROOMS.reduce((s, r) => s + r.viewers, 0);

  return (
    <div style={{
      background: "linear-gradient(135deg, #0A0808 0%, #0F080A 100%)",
      border: "1px solid rgba(255,45,45,0.2)",
      borderRadius: 12,
      padding: "22px 24px",
      marginBottom: 20,
      boxShadow: "0 0 40px rgba(255,45,45,0.04)",
    }}>
      <SectionTitle title="Live Now" subtitle="Active rooms across the platform" accent="pink" badge="🔴 LIVE" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <AnimatePresence>
          {LIVE_ROOMS.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              whileHover={{ y: -3, boxShadow: `0 8px 24px ${room.color}25` }}
              onClick={() => setActiveRoom(room.id === activeRoom ? null : room.id)}
              style={{
                background: activeRoom === room.id ? `${room.color}0D` : "#0D0812",
                border: `1px solid ${room.color}${activeRoom === room.id ? "60" : "30"}`,
                borderRadius: 10,
                padding: "14px 16px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${room.color}10 0%, transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <PulseDot color="#FF3333" />
                <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "#FF3333", textTransform: "uppercase" }}>LIVE</span>
                <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>👁 {room.viewers.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "white", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4, lineHeight: 1.2 }}>
                {room.name}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
                {room.host} · {room.genre}
              </div>
              <Link
                href={`/live/room/${room.id}`}
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-block", fontSize: 9, fontWeight: 800,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  padding: "6px 16px", borderRadius: 5,
                  background: room.color, color: "#000",
                  textDecoration: "none",
                  boxShadow: `0 0 12px ${room.color}50`,
                }}
              >
                JOIN →
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          {totalViewers.toLocaleString()} total viewers
        </span>
        <Link href="/live" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#FF2DAA", textDecoration: "none", border: "1px solid rgba(255,45,170,0.3)", padding: "5px 14px", borderRadius: 4 }}>
          All Rooms →
        </Link>
      </div>
    </div>
  );
}
