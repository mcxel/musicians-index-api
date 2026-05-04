"use client";

// Motion B — Headline shimmer: sweeping sheen pass over headline text.

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  accentColor: string;
}

export default function HeadlineShimmer({ children, accentColor }: Props) {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {children}
      <motion.div
        aria-hidden
        animate={{ x: ["-130%", "130%"] }}
        transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 6.0, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "42%",
          background: `linear-gradient(90deg, transparent, ${accentColor}1e, transparent)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
