"use client";

// GenreHexCluster
// Hex-grid genre selector for Home 2 Discovery Belt
// Center: "Genre Cluster" — surrounding hex cells: individual genres with hover

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const GENRES = [
  { label: "Hip-Hop",    color: "#FF2DAA", href: "/genres/hip-hop" },
  { label: "Pop",        color: "#FFD700", href: "/genres/pop" },
  { label: "Rock",       color: "#FF6B35", href: "/genres/rock" },
  { label: "R&B",        color: "#AA2DFF", href: "/genres/rnb" },
  { label: "Electronic", color: "#00FFFF", href: "/genres/electronic" },
  { label: "Jazz",       color: "#00FF88", href: "/genres/jazz" },
];

function HexCell({
  label,
  color,
  href,
  delay,
}: {
  label: string;
  color: string;
  href: string;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      <Link href={href} style={{ textDecoration: "none" }}>
        {/* Hex shape via clip-path */}
        <motion.div
          animate={hovered ? { scale: 1.12 } : { scale: 1 }}
          transition={{ duration: 0.18 }}
          style={{
            width: 68,
            height: 76,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background: hovered
              ? `linear-gradient(135deg, ${color}55, ${color}22)`
              : `linear-gradient(135deg, ${color}22, ${color}0d)`,
            border: `none`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: "pointer",
            transition: "background 0.18s",
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: hovered ? color : `${color}cc`,
              textAlign: "center",
              maxWidth: 50,
              wordBreak: "break-word",
              lineHeight: 1.2,
              textShadow: hovered ? `0 0 8px ${color}` : "none",
            }}
          >
            {label}
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function GenreHexCluster() {
  // 6 hex cells arranged around a center label using offsets
  // Row layout: [2 cells] [center + 2 cells] [2 cells]
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Header label */}
      <div
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.38)",
          marginBottom: 6,
        }}
      >
        Genre Cluster
      </div>

      {/* Top row */}
      <div style={{ display: "flex", gap: 4 }}>
        <HexCell {...GENRES[0]!} delay={0.05} />
        <HexCell {...GENRES[1]!} delay={0.1} />
      </div>

      {/* Middle row */}
      <div style={{ display: "flex", gap: 4, marginTop: -8 }}>
        <HexCell {...GENRES[2]!} delay={0.15} />
        {/* Center hub */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 20 }}
          style={{
            width: 68,
            height: 76,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 9, lineHeight: 1 }}>🎵</span>
        </motion.div>
        <HexCell {...GENRES[3]!} delay={0.2} />
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", gap: 4, marginTop: -8 }}>
        <HexCell {...GENRES[4]!} delay={0.25} />
        <HexCell {...GENRES[5]!} delay={0.3} />
      </div>
    </div>
  );
}
