"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getActiveSessions } from "@/lib/broadcast/GlobalLiveSessionRegistry";

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

const STAGE_LIGHTS = [
  { x: "18%", color: C1 },
  { x: "38%", color: "#FFD700" },
  { x: "58%", color: C2 },
  { x: "78%", color: "#00FFFF" },
];

function roomsFromLiveSessions(): LobbyRoom[] {
  const sessions = getActiveSessions().filter((s) => s.privacy !== "INVITE_ONLY");
  const accents = [C1, "#00FFFF", "#FFD700", "#00FF88"];
  return sessions.slice(0, 8).map((s, i) => ({
    id: s.roomId,
    name: s.displayName || s.roomId,
    genre: "Live",
    hostName: s.displayName || "Host",
    population: Math.max(0, s.viewerCount ?? 0),
    maxSlots: Math.max(1, (s.viewerCount ?? 0) + 4),
    isLive: true,
    accent: accents[i % accents.length]!,
  }));
}

export default function Home3PreviewLobbyCard({ href = "/lobbies" }: { href?: string }) {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState(0);

  useEffect(() => {
    const refresh = () => setRooms(roomsFromLiveSessions());
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (rooms.length === 0) return;
    const t = setInterval(() => setActiveRoom((i) => (i + 1) % rooms.length), 4200);
    return () => clearInterval(t);
  }, [rooms.length]);

  if (rooms.length === 0) {
    return (
      <div
        style={{
          position: "relative",
          borderRadius: 14,
          overflow: "hidden",
          background: "#0a0012",
          border: "1.5px solid rgba(255,45,170,0.2)",
          minHeight: 130,
          padding: "14px 12px",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: C1, marginBottom: 8 }}>
          LIVE LOBBIES
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.45 }}>
          No live rooms right now. When performers go live, real lobbies appear here.
        </p>
        <Link href={href} style={{ display: "inline-block", marginTop: 10, fontSize: 10, fontWeight: 800, color: "#00FFFF", textDecoration: "none" }}>
          OPEN LOBBIES →
        </Link>
      </div>
    );
  }

  const room = rooms[activeRoom % rooms.length]!;
  const pct = Math.round((room.population / room.maxSlots) * 100);

  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#0a0012", border: `1.5px solid ${room.accent}33`, minHeight: 130 }}>
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, pointerEvents: "none" }}>
        {STAGE_LIGHTS.map((l, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.18, 0.55, 0.18], scaleY: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
            style={{
              position: "absolute",
              top: 0,
              left: l.x,
              width: 40,
              height: 80,
              background: `linear-gradient(180deg, ${l.color}44 0%, transparent 100%)`,
              clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)",
              transformOrigin: "50% 0%",
            }}
          />
        ))}
      </div>

      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${room.accent}12 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, padding: "10px 12px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          {room.isLive ? (
            <div style={{ fontSize: 9, fontWeight: 900, color: "#fff", background: "#e11", padding: "2px 6px", borderRadius: 4 }}>LIVE</div>
          ) : null}
          <span style={{ fontSize: 10, fontWeight: 800, color: room.accent, letterSpacing: "0.08em" }}>{room.genre}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{room.name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>Host · {room.hostName}</div>
        <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: room.accent }} />
        </div>
        <Link href={href} style={{ display: "inline-block", marginTop: 10, fontSize: 10, fontWeight: 800, color: room.accent, textDecoration: "none" }}>
          JOIN →
        </Link>
      </div>
    </div>
  );
}
