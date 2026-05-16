"use client";

import { motion, useReducedMotion } from "framer-motion";

type NeonWaveUnderlayProps = {
  zIndex?: number;
  opacity?: number;
  speed?: number;
  colorA?: string;
  colorB?: string;
  colorC?: string;
};

export default function NeonWaveUnderlay({
  zIndex = 1,
  opacity = 0.22,
  speed = 1,
  colorA = "#00ffff",
  colorB = "#ff2daa",
  colorC = "#aa2dff",
}: NeonWaveUnderlayProps) {
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
            ? { opacity: 0.7 }
            : { x: ["-8%", "5%", "-8%"], y: ["0%", "-2%", "0%"], opacity: [0.5, 0.85, 0.5] }
        }
        transition={{ duration: 18 / Math.max(0.6, speed), repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: "-10% -6%",
          background:
            `radial-gradient(ellipse 70% 55% at 15% 35%, ${colorA}55 0%, transparent 70%),` +
            `radial-gradient(ellipse 65% 50% at 78% 30%, ${colorB}45 0%, transparent 70%),` +
            `radial-gradient(ellipse 60% 60% at 45% 80%, ${colorC}40 0%, transparent 72%)`,
          filter: "blur(20px)",
          mixBlendMode: "screen",
        }}
      />
      <motion.div
        animate={
          reduceMotion
            ? { opacity: 0.5 }
            : { x: ["8%", "-4%", "8%"], y: ["0%", "3%", "0%"], opacity: [0.35, 0.72, 0.35] }
        }
        transition={{ duration: 12 / Math.max(0.6, speed), repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: "-8% -8%",
          background:
            `linear-gradient(135deg, ${colorA}00 10%, ${colorA}22 35%, transparent 55%),` +
            `linear-gradient(320deg, ${colorB}00 8%, ${colorB}2a 30%, transparent 58%),` +
            `linear-gradient(200deg, ${colorC}00 12%, ${colorC}24 36%, transparent 62%)`,
          filter: "blur(14px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
