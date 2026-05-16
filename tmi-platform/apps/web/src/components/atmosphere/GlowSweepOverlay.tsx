"use client";

import { motion, useReducedMotion } from "framer-motion";

type GlowSweepOverlayProps = {
  zIndex?: number;
  opacity?: number;
  color?: string;
  speed?: number;
};

export default function GlowSweepOverlay({
  zIndex = 4,
  opacity = 0.2,
  color = "#ffffff",
  speed = 1,
}: GlowSweepOverlayProps) {
  const reduceMotion = useReducedMotion();

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
      <motion.div
        animate={
          reduceMotion
            ? { x: "10%" }
            : { x: ["-65%", "135%"] }
        }
        transition={{
          duration: 9 / Math.max(0.6, speed),
          repeat: Infinity,
          repeatDelay: 1.3,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "-20%",
          left: "-35%",
          width: "45%",
          height: "160%",
          transform: "rotate(18deg)",
          background: `linear-gradient(90deg, transparent 0%, ${color}00 15%, ${color}22 45%, ${color}30 55%, ${color}00 85%, transparent 100%)`,
          filter: "blur(8px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
