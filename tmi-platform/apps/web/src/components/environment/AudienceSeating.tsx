"use client";

import React from "react";
import { motion } from "framer-motion";

interface AudienceSeatingProps {
  layout?: "circle" | "rows" | "surrounding" | "theatre" | "pods" | "none";
  color?: string;
  reaction?: "DANCING" | "CHEERING" | "CLAPPING" | "IDLE";
}

const SPECTATORS = ["👤", "👽", "🤖", "🦊", "🦁", "🐼", "🐻", "🐸", "🐱", "🐶"];

export default function AudienceSeating({
  layout = "rows",
  color = "#FF2DAA",
  reaction = "CLAPPING",
}: AudienceSeatingProps) {
  if (layout === "none") return null;

  // Generate 20 spectators positioned based on layout
  const attendees = Array.from({ length: 18 }, (_, idx) => {
    const angle = (idx / 18) * Math.PI * 2;
    let x = 50;
    let y = 50;

    if (layout === "circle" || layout === "surrounding") {
      x = 50 + Math.cos(angle) * 38;
      y = 45 + Math.sin(angle) * 20;
    } else if (layout === "rows" || layout === "theatre") {
      const row = idx % 3;
      const col = Math.floor(idx / 3);
      x = 10 + col * 15;
      y = 65 + row * 10;
    } else {
      // pods layout
      const pod = idx % 4;
      const slot = Math.floor(idx / 4);
      x = 15 + pod * 22 + (slot * 3);
      y = 70 + slot * 12;
    }

    return {
      id: `spec-${idx}`,
      char: SPECTATORS[idx % SPECTATORS.length]!,
      x,
      y,
      delay: idx * 0.1,
    };
  });

  const getBouncingAnimation = () => {
    switch (reaction) {
      case "DANCING":
        return { y: [0, -14, 0], rotate: [-8, 8, -8] };
      case "CHEERING":
        return { y: [0, -20, 0], scale: [1, 1.25, 1] };
      case "CLAPPING":
        return { y: [0, -6, 0] };
      default:
        return { y: [0, -2, 0] };
    }
  };

  const getBounceDuration = () => {
    switch (reaction) {
      case "DANCING": return 0.5;
      case "CHEERING": return 0.45;
      case "CLAPPING": return 0.6;
      default: return 1.8;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      {attendees.map((a) => (
        <motion.div
          key={a.id}
          animate={getBouncingAnimation()}
          transition={{
            repeat: Infinity,
            duration: getBounceDuration(),
            delay: a.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${a.x}%`,
            top: `${a.y}%`,
            fontSize: "clamp(12px, 2vw, 22px)",
            transform: "translate(-50%, -50%)",
            textShadow: `0 0 10px ${color}55`,
            opacity: 0.75,
          }}
        >
          {a.char}
        </motion.div>
      ))}
    </div>
  );
}
