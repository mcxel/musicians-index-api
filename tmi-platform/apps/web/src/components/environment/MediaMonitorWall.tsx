"use client";

import React from "react";
import { motion } from "framer-motion";

interface MediaMonitorWallProps {
  title?: string;
  subtitle?: string;
  activeColor?: string;
}

export default function MediaMonitorWall({
  title = "VOCAL SHOWDOWN",
  subtitle = "LIVE VENUE",
  activeColor = "#00FFFF",
}: MediaMonitorWallProps) {
  return (
    <div
      style={{
        background: "rgba(10, 10, 20, 0.75)",
        border: `2px solid ${activeColor}44`,
        borderRadius: 16,
        padding: "16px 20px",
        boxShadow: `0 0 20px ${activeColor}15`,
        backdropFilter: "blur(8px)",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 9, letterSpacing: "0.25em", color: activeColor, fontWeight: 900, textTransform: "uppercase" }}>
          📺 LIVE BROADCAST
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} className="animate-pulse" />
          ON-AIR
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
          {title}
        </h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#eab308", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {subtitle}
        </span>
      </div>

      {/* Dynamic waveform visualizer strip */}
      <div style={{ display: "flex", gap: 3, alignItems: "center", height: 16, marginTop: 12, opacity: 0.8 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: [4, 14, 4],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.55 + i * 0.03,
              ease: "easeInOut",
            }}
            style={{
              width: 2,
              background: `linear-gradient(to top, ${activeColor}, #aa2dff)`,
              borderRadius: 20,
            }}
          />
        ))}
      </div>
    </div>
  );
}
