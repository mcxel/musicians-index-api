"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface DiscoveryLiveTileProps {
  roomId: string;
  performerName: string;
  genre: string;
  viewerCount: number;
  isLive: boolean;
  thumbnailUrl?: string;
  /** Width of the tile in px. Default 220. */
  width?: number;
}

/**
 * DiscoveryLiveTile — rectangular tile for live discovery walls and room listings.
 * Displays LIVE badge, viewer count, performer name, genre tag.
 * Tapping routes to /live/rooms/[roomId].
 *
 * Rule 2 compliance: LIVE content wins over static thumbnail.
 * Rule 14 compliance: always routes to a real destination.
 * Rule 20 compliance: isLive must come from a real registry — never Math.random().
 */
export default function DiscoveryLiveTile({
  roomId,
  performerName,
  genre,
  viewerCount,
  isLive,
  thumbnailUrl,
  width = 220,
}: DiscoveryLiveTileProps) {
  const router = useRouter();
  const height = Math.round(width * 0.62);

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={() => router.push(`/live/rooms/${roomId}`)}
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
        border: isLive
          ? "1.5px solid rgba(255,45,45,0.6)"
          : "1px solid rgba(255,255,255,0.1)",
        background: "#080a16",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        textAlign: "left",
        boxShadow: isLive
          ? "0 0 18px rgba(255,45,45,0.25)"
          : "0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      {/* Thumbnail / gradient bg */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={performerName}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(170,45,255,0.22), transparent 70%), radial-gradient(ellipse at 70% 60%, rgba(0,255,255,0.12), transparent 70%)",
          }}
        />
      )}

      {/* Darkening scrim at bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(5,5,16,0.92) 100%)",
        }}
      />

      {/* LIVE badge */}
      {isLive && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 10,
            background: "#FF2D2D",
            borderRadius: 4,
            padding: "2px 7px",
            fontSize: 9,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.14em",
            lineHeight: 1.4,
          }}
        >
          ● LIVE
        </div>
      )}

      {/* Viewer count */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          background: "rgba(0,0,0,0.6)",
          borderRadius: 4,
          padding: "2px 7px",
          fontSize: 9,
          fontWeight: 700,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.06em",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        👁 {viewerCount >= 1000
          ? `${(viewerCount / 1000).toFixed(1)}k`
          : viewerCount}
      </div>

      {/* Bottom info */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.02em",
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {performerName}
        </div>
        <div
          style={{
            display: "inline-block",
            fontSize: 9,
            fontWeight: 800,
            color: "#AA2DFF",
            letterSpacing: "0.14em",
            background: "rgba(170,45,255,0.15)",
            border: "1px solid rgba(170,45,255,0.35)",
            borderRadius: 4,
            padding: "2px 7px",
            textTransform: "uppercase",
          }}
        >
          {genre}
        </div>
      </div>
    </motion.button>
  );
}
