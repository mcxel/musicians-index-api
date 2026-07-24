"use client";

import React from "react";
import { motion } from "framer-motion";

interface VenueLightingProps {
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: number;
  strobe?: boolean;
}

export default function VenueLighting({
  primaryColor = "#00FFFF",
  secondaryColor = "#FF2DAA",
  intensity = 0.8,
  strobe = false,
}: VenueLightingProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
      }}
      className={strobe ? "animate-[pulse_0.15s_infinite]" : ""}
    >
      {/* Dynamic spot ray lights */}
      <div style={{ position: "absolute", inset: 0, opacity: intensity }}>
        <SpotBeam color={primaryColor} angle={-25} left="15%" delay={0} />
        <SpotBeam color={secondaryColor} angle={-10} left="35%" delay={1.2} />
        <SpotBeam color={primaryColor} angle={10} left="65%" delay={0.6} />
        <SpotBeam color={secondaryColor} angle={25} left="85%" delay={1.8} />
      </div>

      {/* Stage spotlight glow reflection */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "25%",
          background: `radial-gradient(ellipse at 50% 100%, ${primaryColor}44 0%, ${secondaryColor}11 50%, transparent 80%)`,
          filter: "blur(20px)",
          opacity: intensity,
        }}
      />
    </div>
  );
}

function SpotBeam({ color, angle, left, delay }: { color: string; angle: number; left: string; delay: number }) {
  return (
    <motion.div
      animate={{
        rotate: [angle - 6, angle + 6, angle - 6],
        opacity: [0.35, 0.75, 0.35],
      }}
      transition={{
        repeat: Infinity,
        duration: 4.5,
        delay,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        top: 0,
        left,
        width: 4,
        height: "75%",
        background: `linear-gradient(to bottom, ${color}cc, transparent)`,
        transformOrigin: "top center",
        filter: "blur(6px) brightness(1.2)",
      }}
    />
  );
}
