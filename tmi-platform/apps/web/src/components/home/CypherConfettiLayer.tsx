"use client";

import { motion } from "framer-motion";

const C1 = "#AA2DFF";
const C2 = "#CC0000";

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 3.8) % 97,
  y: (i * 6.1) % 88,
  delay: i * 0.14,
  duration: 2.8 + (i % 7) * 0.4,
  size: 2 + (i % 4),
  color: [C1, C2, "#FFD700", "#00FFFF", "#FF2DAA", "#00FF88", "#FF6B35"][i % 7]!,
  isTriangle: i % 4 === 0,
  rotation: i * 23,
}));

export default function CypherConfettiLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {CONFETTI.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -20, 0],
            x: [0, (p.id % 2 === 0 ? 7 : -7), 0],
            opacity: [0, 0.65, 0],
            rotate: [p.rotation, p.rotation + 180, p.rotation],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.isTriangle ? 0 : p.size,
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
