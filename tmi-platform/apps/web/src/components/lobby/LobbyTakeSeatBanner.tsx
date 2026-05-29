"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface LobbyTakeSeatBannerProps {
  roomId: string;
}

export default function LobbyTakeSeatBanner({ roomId }: LobbyTakeSeatBannerProps) {
  const seatHref = `/live/rooms/${encodeURIComponent(roomId)}?from=live-lobby`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "linear-gradient(90deg, rgba(170,45,255,0.92), rgba(0,255,255,0.85))",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(5,5,16,0.7)", textTransform: "uppercase" }}>
          YOUR SEAT IS WAITING
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#050510", marginTop: 2 }}>
          You were redirected here so you can be properly seated. Pick your spot, then enter the room.
        </div>
      </div>
      <Link
        href={seatHref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 22px",
          background: "#050510",
          color: "#00FFFF",
          borderRadius: 8,
          fontWeight: 900,
          fontSize: 11,
          letterSpacing: "0.12em",
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        🎟 TAKE A SEAT →
      </Link>
    </motion.div>
  );
}
