"use client";

import React from "react";
import { motion } from "framer-motion";

interface SponsorBannerRailProps {
  color?: string;
  speed?: number;
}

const LOGOS = ["★ TMI SPONSORS ★", "NATIVE GEAR", "AUDIO PRO", "VIBE LABS", "BEAT MATRIX", "NEON CLOTHING", "SYNTH CO"];

export default function SponsorBannerRail({
  color = "#FFD700",
  speed = 22,
}: SponsorBannerRailProps) {
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: "rgba(0,0,0,0.85)",
        borderTop: `1px solid ${color}33`,
        borderBottom: `1px solid ${color}33`,
        padding: "6px 0",
        whiteSpace: "nowrap",
        display: "flex",
      }}
    >
      <motion.div
        animate={{ x: [0, -400] }}
        transition={{
          repeat: Infinity,
          duration: speed,
          ease: "linear",
        }}
        style={{
          display: "flex",
          gap: 60,
          paddingRight: 60,
        }}
      >
        {/* Double array for infinite seamless scroll */}
        {[...LOGOS, ...LOGOS].map((logo, idx) => (
          <span
            key={idx}
            style={{
              fontSize: 9,
              fontWeight: 900,
              color: logo.startsWith("★") ? color : "rgba(255,255,255,0.45)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            {logo}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
