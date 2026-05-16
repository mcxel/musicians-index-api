"use client";

import { motion } from "framer-motion";
import MotionPortraitCard from "@/components/cards/MotionPortraitCard";
import Link from "next/link";

type ArtistOfDay = {
  name: string;
  genre: string;
  streams: string;
  accent: string;
  boostStatus: "active" | "ending_soon" | "available";
  href: string;
};

const ARTIST_OF_DAY: ArtistOfDay = {
  name: "Lyric.44",
  genre: "Hip-Hop · Trap",
  streams: "124K today",
  accent: "#00FF88",
  boostStatus: "active",
  href: "/artists/lyric-44",
};

const BOOST_LABELS: Record<ArtistOfDay["boostStatus"], string> = {
  active: "BOOST ACTIVE",
  ending_soon: "BOOST ENDING SOON",
  available: "AVAILABLE FOR BOOST",
};

const BOOST_COLORS: Record<ArtistOfDay["boostStatus"], string> = {
  active: "#00FF88",
  ending_soon: "#FFD700",
  available: "#AA2DFF",
};

export default function Home3UndiscoveredBoostCard({ artist = ARTIST_OF_DAY }: { artist?: ArtistOfDay }) {
  const boostColor = BOOST_COLORS[artist.boostStatus];

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${artist.accent}33`, background: `${artist.accent}08`, position: "relative" }}>
      <div style={{ padding: "10px 12px" }}>
        {/* Label */}
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>
          NEW ARTIST OF THE DAY
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <MotionPortraitCard name={artist.name} accent={artist.accent} size={52} showLabel={false} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{artist.name}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", marginBottom: 5 }}>{artist.genre}</div>
            <div style={{ fontSize: 7, color: artist.accent, fontWeight: 700 }}>🎵 {artist.streams}</div>
          </div>
        </div>

        {/* Boost status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "2px 7px", borderRadius: 999,
              background: `${boostColor}14`, border: `1px solid ${boostColor}44`,
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: boostColor, boxShadow: `0 0 5px ${boostColor}`, flexShrink: 0 }} />
            <span style={{ fontSize: 6, fontWeight: 900, color: boostColor, letterSpacing: "0.14em" }}>{BOOST_LABELS[artist.boostStatus]}</span>
          </motion.div>
        </div>

        <Link href={artist.href} style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "6px 12px", borderRadius: 8, textAlign: "center",
              background: `linear-gradient(135deg, ${artist.accent}22, ${artist.accent}0a)`,
              border: `1px solid ${artist.accent}44`,
              fontSize: 7, fontWeight: 900, letterSpacing: "0.16em",
              color: artist.accent, textTransform: "uppercase", cursor: "pointer",
            }}
          >
            DISCOVER THIS ARTIST →
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
