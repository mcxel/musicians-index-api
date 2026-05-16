"use client";

// WeeklyPlaylistCard
// Playlist artifact for Home 2 Discovery Belt
// Shows cover art, genre, runtime, track count, play link

import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  title: string;
  genre: string;
  description?: string;
  coverEmoji?: string;
  trackCount: number;
  runtimeDisplay: string;   // "48:22"
  href: string;
  accentColor?: string;
};

export default function WeeklyPlaylistCard({
  title,
  genre,
  description,
  coverEmoji = "🎵",
  trackCount,
  runtimeDisplay,
  href,
  accentColor = "#AA2DFF",
}: Props) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <motion.div
        whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
        style={{
          borderRadius: 10,
          border: `1px solid ${accentColor}33`,
          background: `linear-gradient(135deg, ${accentColor}0d, rgba(0,0,0,0.5))`,
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        {/* Cover art area */}
        <div
          style={{
            height: 68,
            background: `linear-gradient(135deg, ${accentColor}33, rgba(0,0,0,0.7))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            position: "relative",
          }}
        >
          {coverEmoji}
          {/* Play overlay hint */}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              right: 8,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: `${accentColor}cc`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              color: "#fff",
              fontWeight: 900,
            }}
          >
            ▶
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "8px 10px 10px" }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: accentColor,
              marginBottom: 3,
            }}
          >
            {genre}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "rgba(255,255,255,0.9)",
              marginBottom: description ? 4 : 6,
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.42)",
                marginBottom: 6,
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              fontSize: 8,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
            }}
          >
            <span>{trackCount} tracks</span>
            <span>·</span>
            <span>{runtimeDisplay}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
