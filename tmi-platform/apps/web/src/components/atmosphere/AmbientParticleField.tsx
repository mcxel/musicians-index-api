"use client";

import { motion, useReducedMotion } from "framer-motion";

type AmbientParticleFieldProps = {
  count?: number;
  zIndex?: number;
  opacity?: number;
  palette?: readonly string[];
  speed?: number;
};

const DEFAULT_PALETTE = ["#00ffff", "#ff2daa", "#aa2dff", "#ffd700"] as const;

export default function AmbientParticleField({
  count = 16,
  zIndex = 2,
  opacity = 0.16,
  palette = DEFAULT_PALETTE,
  speed = 1,
}: AmbientParticleFieldProps) {
  const reduceMotion = useReducedMotion();

  const particles = Array.from({ length: count }, (_, i) => {
    const x = (i * 37) % 100;
    const y = (i * 29) % 100;
    const size = 2 + ((i * 7) % 6);
    const color = palette[i % palette.length];
    const delay = (i % 9) * 0.3;
    const duration = (6 + (i % 5) * 1.8) / Math.max(0.6, speed);
    return { x, y, size, color, delay, duration };
  });

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
        pointerEvents: "none",
        overflow: "hidden",
        opacity,
      }}
    >
      {particles.map((p, idx) => (
        <motion.span
          key={`${p.x}-${p.y}-${idx}`}
          initial={{ opacity: 0.15, y: 0 }}
          animate={
            reduceMotion
              ? { opacity: 0.2 }
              : { opacity: [0.1, 0.45, 0.1], y: [0, -10, 0], x: [0, 4, 0] }
          }
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 10px ${p.color}`,
            filter: "blur(0.2px)",
          }}
        />
      ))}
    </div>
  );
}
