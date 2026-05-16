"use client";

// SpreadCollisionBackground
// Behind ranking cards on Home 1-2: polygon color collisions,
// asymmetrical layered shapes giving 1980s magazine spread energy

import { motion } from "framer-motion";

type Props = {
  side: "left" | "right";
  accentColor?: string;
};

const LEFT_SHAPES = [
  { x: "-8%", y: "10%",  w: "55%",  h: "38%", color: "rgba(255,45,170,0.12)", rotate: -14, delay: 0 },
  { x: "18%", y: "32%",  w: "42%",  h: "28%", color: "rgba(0,255,255,0.09)",  rotate: 8,  delay: 0.12 },
  { x: "-4%", y: "58%",  w: "60%",  h: "32%", color: "rgba(255,215,0,0.08)",  rotate: -6, delay: 0.22 },
  { x: "24%", y: "74%",  w: "38%",  h: "22%", color: "rgba(170,45,255,0.10)", rotate: 12, delay: 0.08 },
];

const RIGHT_SHAPES = [
  { x: "42%", y: "8%",   w: "62%",  h: "36%", color: "rgba(0,255,255,0.11)",  rotate: 10,  delay: 0 },
  { x: "28%", y: "38%",  w: "50%",  h: "30%", color: "rgba(255,215,0,0.09)",  rotate: -12, delay: 0.14 },
  { x: "52%", y: "62%",  w: "58%",  h: "28%", color: "rgba(255,45,170,0.10)", rotate: 7,   delay: 0.18 },
  { x: "20%", y: "78%",  w: "40%",  h: "20%", color: "rgba(170,45,255,0.08)", rotate: -8,  delay: 0.06 },
];

export default function SpreadCollisionBackground({ side, accentColor }: Props) {
  const shapes = side === "left" ? LEFT_SHAPES : RIGHT_SHAPES;
  const laneColor = side === "left" ? "rgba(255,45,170,0.04)" : "rgba(0,255,255,0.04)";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        background: laneColor,
      }}
    >
      {/* Color collision polygons */}
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: s.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.w,
            height: s.h,
            background: accentColor
              ? `${accentColor}${i % 2 === 0 ? "1a" : "0d"}`
              : s.color,
            borderRadius: 8,
            transform: `rotate(${s.rotate}deg)`,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* Gutter energy strip — vertical center accent */}
      {side === "right" && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "15%",
            width: 2,
            height: "70%",
            background: "linear-gradient(180deg, transparent, #FFD70044, #FFD70066, #FFD70044, transparent)",
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
}
