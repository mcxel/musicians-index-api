"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type CoverSurfaceMotionProps = {
  children: ReactNode;
};

export default function CoverSurfaceMotion({ children }: CoverSurfaceMotionProps) {
  return (
    <motion.div
      whileHover={{ y: -4, rotateX: 3.2, rotateY: -3.2 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        aria-hidden
        animate={{ x: ["-30%", "130%"] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 46%, transparent 62%)",
          mixBlendMode: "screen",
        }}
      />
      {children}
    </motion.div>
  );
}
