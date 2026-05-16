"use client";

import { motion, useReducedMotion } from "framer-motion";

type EnergyRibbonProps = {
  zIndex?: number;
  opacity?: number;
  speed?: number;
  color?: string;
};

export default function EnergyRibbon({
  zIndex = 3,
  opacity = 0.2,
  speed = 1,
  color = "#00ffff",
}: EnergyRibbonProps) {
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
            ? { x: "0%" }
            : { x: ["-15%", "8%", "-15%"], y: ["0%", "-4%", "0%"] }
        }
        transition={{
          duration: 11 / Math.max(0.6, speed),
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          left: "-10%",
          top: "38%",
          width: "120%",
          height: 120,
          borderRadius: 120,
          background: `linear-gradient(90deg, ${color}00 0%, ${color}22 32%, ${color}44 48%, ${color}20 62%, ${color}00 100%)`,
          filter: "blur(14px)",
          transform: "rotate(-6deg)",
          mixBlendMode: "screen",
        }}
      />
      <motion.div
        animate={
          reduceMotion
            ? { x: "0%" }
            : { x: ["12%", "-10%", "12%"], y: ["0%", "3%", "0%"] }
        }
        transition={{
          duration: 7.5 / Math.max(0.6, speed),
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          left: "-12%",
          top: "52%",
          width: "118%",
          height: 84,
          borderRadius: 120,
          background: `linear-gradient(90deg, transparent 0%, ${color}18 24%, ${color}30 52%, ${color}12 72%, transparent 100%)`,
          filter: "blur(10px)",
          transform: "rotate(4deg)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
