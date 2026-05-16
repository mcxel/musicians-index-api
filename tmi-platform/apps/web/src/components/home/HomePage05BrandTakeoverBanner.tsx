"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type BannerProps = {
  brandName?: string;
  tagline?: string;
  weekType?: "weekly_sponsor" | "battle_sponsor" | "artist_sponsor";
  accent?: string;
  href?: string;
};

const TYPE_LABELS: Record<NonNullable<BannerProps["weekType"]>, string> = {
  weekly_sponsor: "WEEKLY SPONSOR",
  battle_sponsor: "BATTLE SPONSOR",
  artist_sponsor: "FEATURED ARTIST",
};

export default function HomePage05BrandTakeoverBanner({
  brandName = "SoundWave Audio",
  tagline = "Powering every beat, every battle, every season.",
  weekType = "battle_sponsor",
  accent = "#00FFFF",
  href = "/advertise",
}: BannerProps) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: 8,
        border: `1px solid ${accent}33`,
        background: `linear-gradient(90deg, ${accent}0a 0%, rgba(0,0,0,0) 60%, ${accent}06 100%)`,
        padding: "7px 14px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Neon sweep animation */}
        <motion.div
          animate={{ x: ["-110%", "110%"] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          style={{
            position: "absolute", top: 0, left: 0,
            width: "40%", height: "100%",
            background: `linear-gradient(90deg, transparent, ${accent}1a, transparent)`,
            pointerEvents: "none",
          }}
        />

        {/* Left bolt icon */}
        <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, filter: `drop-shadow(0 0 6px ${accent})` }}>⚡</span>

        {/* Type badge */}
        <span style={{
          padding: "2px 8px", borderRadius: 999,
          border: `1px solid ${accent}44`, background: `${accent}14`,
          fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: accent, textTransform: "uppercase",
          flexShrink: 0,
        }}>
          {TYPE_LABELS[weekType]}
        </span>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: `${accent}33`, flexShrink: 0 }} />

        {/* Brand + tagline */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>{brandName}</span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.42)", marginLeft: 8 }}>{tagline}</span>
        </div>

        {/* Right CTA chip */}
        <motion.span
          whileHover={{ scale: 1.06 }}
          style={{
            padding: "3px 10px", borderRadius: 999,
            border: `1px solid ${accent}55`, background: `${accent}18`,
            fontSize: 6, fontWeight: 900, letterSpacing: "0.14em", color: accent, textTransform: "uppercase",
            flexShrink: 0, cursor: "pointer",
          }}
        >
          Sponsor This →
        </motion.span>
      </div>
    </Link>
  );
}
