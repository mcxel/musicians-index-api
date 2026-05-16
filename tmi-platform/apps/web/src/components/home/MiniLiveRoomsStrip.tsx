"use client";

/**
 * MiniLiveRoomsStrip.tsx
 * Layer 6 — 3 mini clickable live room preview windows.
 * Battle room live / Cypher room live / Monday Night room live.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import type { Home1ShowcaseMode } from "@/lib/home/GenreRotationEngine";
import { ImageSlotWrapper } from "@/components/visual-enforcement";

interface MiniRoom {
  label: string;
  type: Home1ShowcaseMode;
  route: string;
  thumbnail: string;
  viewers: number;
  accent: string;
  statusLive: string;
  statusWaiting: string;
}

const ROOMS: MiniRoom[] = [
  {
    label: "Battle",
    type: "battle",
    route: "/battles/live",
    thumbnail: "/tmi-curated/gameshow-31.jpg",
    viewers: 142,
    accent: "#FF2DAA",
    statusLive: "LIVE",
    statusWaiting: "QUEUED",
  },
  {
    label: "Cypher",
    type: "cypher",
    route: "/cypher/live",
    thumbnail: "/tmi-curated/venue-10.jpg",
    viewers: 89,
    accent: "#AA2DFF",
    statusLive: "OPEN",
    statusWaiting: "WAITING",
  },
  {
    label: "Mon Night",
    type: "monday-stage",
    route: "/games/monday-night",
    thumbnail: "/tmi-curated/home5.png",
    viewers: 0,
    accent: "#FFD700",
    statusLive: "LIVE",
    statusWaiting: "NEXT MON",
  },
];

interface Props {
  roomPhase?: "waiting" | "live";
  activeMode?: Home1ShowcaseMode;
}

export default function MiniLiveRoomsStrip({ roomPhase = "live", activeMode }: Props) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {ROOMS.map((room) => {
        const status = roomPhase === "live" ? room.statusLive : room.statusWaiting;
        const isActive = activeMode === room.type;
        return (
          <Link
            key={room.type}
            href={room.route}
            style={{ flex: 1, textDecoration: "none", display: "block" }}
          >
          <motion.div
            whileHover={{ scale: 1.04, zIndex: 2 }}
            animate={isActive ? { y: [0, -3, 0], boxShadow: [`0 0 0 ${room.accent}00`, `0 0 18px ${room.accent}99`, `0 0 0 ${room.accent}00`] } : undefined}
            transition={isActive ? { duration: 1.8, repeat: Infinity } : undefined}
            style={{
              borderRadius: 8,
              border: `1px solid ${isActive ? room.accent : `${room.accent}44`}`,
              overflow: "hidden",
              background: "#06080e",
              cursor: "pointer",
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                height: 56,
                position: "relative",
              }}
            >
              <ImageSlotWrapper
                imageId={`mini-room-${room.type}`}
                roomId="home-mini-live-rooms"
                priority="high"
                fallbackUrl={room.thumbnail}
                altText={`${room.label} room preview`}
                className="w-full h-full object-cover"
                containerStyle={{ position: "absolute", inset: 0 }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(180deg, transparent 30%, rgba(6,8,14,0.85) 100%)`,
                }}
              />
              {/* Status badge */}
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background:
                    status === "LIVE"
                      ? "rgba(255,0,64,0.9)"
                      : status === "OPEN"
                      ? "rgba(0,255,136,0.9)"
                      : "rgba(255,215,0,0.9)",
                  color:
                    status === "LIVE"
                      ? "#fff"
                      : status === "OPEN"
                      ? "#000"
                      : "#000",
                  fontSize: 7,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  borderRadius: 999,
                  padding: "1px 5px",
                }}
              >
                {status}
              </div>
              {/* Viewers */}
              {room.viewers > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 3,
                    right: 4,
                    fontSize: 7,
                    color: "#fff",
                    opacity: 0.8,
                    fontWeight: 600,
                  }}
                >
                  👁 {room.viewers}
                </div>
              )}
            </div>

            {/* Label */}
            <div
              style={{
                padding: "3px 6px",
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: room.accent,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {room.label}
            </div>
          </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
