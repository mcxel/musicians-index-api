"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  sponsorName?: string;
  sponsorIcon?: string;
  accentColor?: string;
  slogan?: string;
  href?: string;
};

export default function BattleSponsorBadge({
  sponsorName = "Crown Energy",
  sponsorIcon = "⚡",
  accentColor = "#FFD700",
  slogan = "Official Energy Partner",
  href = "/advertise",
}: Props) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <motion.div
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.24 }}
        style={{
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 12px", borderRadius: 999,
          border: `1px solid ${accentColor}33`,
          background: `${accentColor}0c`,
        }}
      >
        {/* Sweep shimmer */}
        <motion.div
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
          style={{
            position: "absolute", top: 0, left: 0,
            width: "35%", height: "100%",
            background: `linear-gradient(90deg, transparent, ${accentColor}18, transparent)`,
            pointerEvents: "none",
          }}
        />
        <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", flexShrink: 0 }}>
          PRESENTED BY
        </span>
        <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>{sponsorIcon}</span>
        <span style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: "0.08em" }}>{sponsorName}</span>
        <div style={{ flex: 1 }} />
        <motion.span
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: 6, color: accentColor, letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}
        >
          {slogan}
        </motion.span>
      </motion.div>
    </Link>
  );
}
