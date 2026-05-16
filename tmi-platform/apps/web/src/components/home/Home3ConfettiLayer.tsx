"use client";

import { motion } from "framer-motion";

const PIECES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: (i * 4.7) % 96,
  y: (i * 7.3) % 84,
  delay: i * 0.18,
  duration: 3.2 + (i % 6) * 0.55,
  size: 3 + (i % 3),
  color: ["#FF2DAA", "#00FFFF", "#FFD700", "#AA2DFF", "#00FF88", "#FF6B35"][i % 6]!,
  isTriangle: i % 3 === 0,
  rotation: i * 17,
}));

export default function Home3ConfettiLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PIECES.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -22, 0],
            x: [0, (p.id % 2 === 0 ? 6 : -6), 0],
            opacity: [0, 0.72, 0],
            rotate: [p.rotation, p.rotation + 180, p.rotation],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.isTriangle ? 0 : p.size,
            borderRadius: p.isTriangle ? 0 : 1,
            background: p.isTriangle ? "none" : p.color,
            borderLeft: p.isTriangle ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.isTriangle ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.isTriangle ? `${p.size}px solid ${p.color}` : undefined,
          }}
        />
      ))}
    </div>
  );
}
