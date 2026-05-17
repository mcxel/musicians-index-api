"use client";

/**
 * OrbitRankingGrid.tsx
 * Layer 5 — Top 10 artists 2–10 arranged asymmetrically around the crown center.
 * Absolute positioned editorial layout (not circular orbit).
 * Each card routes to artist profile. Rank swaps flash on update.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageSlotWrapper } from "@/components/visual-enforcement";

export interface RankArtist {
  id: string;
  rank: number;
  name: string;
  score: string;
  trend: string;
  genre: string;
  image: string;
}

// Asymmetric cover positions for ranks 2–10
// x/y as % of container, offset from center
const ORBIT_POSITIONS = [
  { rankSlot: 2,  x: "8%",  y: "10%", rotate: -8 },
  { rankSlot: 3,  x: "18%", y: "68%", rotate: -11 },
  { rankSlot: 4,  x: "3%",  y: "39%", rotate: -4 },
  { rankSlot: 5,  x: "72%", y: "70%", rotate: 10 },
  { rankSlot: 6,  x: "73%", y: "14%", rotate: 8 },
  { rankSlot: 7,  x: "84%", y: "39%", rotate: 4 },
  { rankSlot: 8,  x: "28%", y: "84%", rotate: -2 },
  { rankSlot: 9,  x: "62%", y: "83%", rotate: 2 },
  { rankSlot: 10, x: "44%", y: "9%", rotate: -1 },
];

interface Props {
  artists: RankArtist[];
  accentColor?: string;
  rankShiftPulse?: boolean;
}

export default function OrbitRankingGrid({ artists, accentColor = "#00FFFF", rankShiftPulse = false }: Props) {
  const [flashRank, setFlashRank] = useState<number | null>(null);

  // Simulate rank swap flashes
  useEffect(() => {
    const t = setInterval(() => {
      const randRank = Math.floor(Math.random() * 9) + 2;
      setFlashRank(randRank);
      setTimeout(() => setFlashRank(null), 800);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const orbiting = artists.slice(1, 10); // ranks 2-10

  return (
    <>
      {orbiting.map((artist, idx) => {
        const pos = ORBIT_POSITIONS[idx];
        if (!pos) return null;
        const isFlashing = flashRank === artist.rank;
        const isRising = artist.trend.startsWith("+");
        const isFalling = artist.trend.startsWith("-");

        return (
          <Link
            key={artist.id}
            href={`/profile/${artist.id}`}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              textDecoration: "none",
              zIndex: 4,
            }}
          >
            <motion.div
              animate={
                isFlashing
                  ? { scale: [1, 1.12, 1], borderColor: ["#FF2DAA", "#FFD700", accentColor] }
                  : { scale: [1, 1.03, 1], rotate: [pos.rotate, pos.rotate + 1.5, pos.rotate] }
              }
              transition={
                isFlashing
                  ? { duration: 0.6 }
                  : { duration: 3.5 + idx * 0.3, repeat: Infinity, delay: idx * 0.15 }
              }
              style={{
                width: 88,
                transform: `rotate(${pos.rotate}deg)`,
                borderRadius: 10,
                border: `1px solid ${isFlashing ? "#FFD700" : accentColor}44`,
                overflow: "hidden",
                background: "rgba(5,5,16,0.92)",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            >
              {rankShiftPulse && (
                <motion.div
                  animate={{ opacity: [0, 0.95, 0], x: [-12, 10, 18] }}
                  transition={{ duration: 0.85, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: -8,
                    left: 18,
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: "#00FF88",
                    fontWeight: 900,
                    zIndex: 6,
                    textShadow: "0 0 10px rgba(0,255,136,0.7)",
                    pointerEvents: "none",
                  }}
                >
                  RANK SHIFT {"->"}
                </motion.div>
              )}
              {/* Artist image */}
              <div
                style={{
                  height: 60,
                  position: "relative",
                }}
              >
                <ImageSlotWrapper
                  imageId={`orbit-rank-${artist.id}`}
                  roomId="home-orbit-ranking"
                  priority="high"
                  fallbackUrl={artist.image}
                  altText={artist.name}
                  className="w-full h-full object-cover"
                  containerStyle={{ position: "absolute", inset: 0 }}
                />
                {/* Rank badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    left: 3,
                    background: isFlashing
                      ? "#FFD700"
                      : "rgba(5,5,16,0.85)",
                    border: `1px solid ${accentColor}66`,
                    borderRadius: 4,
                    padding: "1px 5px",
                    fontSize: 9,
                    fontWeight: 900,
                    color: isFlashing ? "#000" : accentColor,
                    letterSpacing: "0.06em",
                    transition: "all 0.3s ease",
                  }}
                >
                  #{artist.rank}
                </div>

                {/* Trend indicator */}
                {artist.trend !== "0" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      right: 3,
                      fontSize: 8,
                      fontWeight: 700,
                      color: isRising ? "#00FF88" : isFalling ? "#FF4444" : "#fff",
                    }}
                  >
                    {isRising ? "▲" : "▼"}{artist.trend.replace(/[+-]/, "")}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "4px 6px", display: "grid", gap: 1 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#fff",
                    fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
                    letterSpacing: "0.04em",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {artist.name}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: accentColor,
                    opacity: 0.8,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {artist.genre}
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </>
  );
}
