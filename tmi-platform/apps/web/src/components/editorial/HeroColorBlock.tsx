"use client";

// Motion C — Hero image pulse: subtle scale-breathe on the hero color band.

import { motion } from "framer-motion";

interface Props {
  heroColor: string;
  accentColor: string;
}

export default function HeroColorBlock({ heroColor, accentColor }: Props) {
  return (
    <motion.div
      aria-hidden
      animate={{ scaleX: [1, 1.05, 1], opacity: [0.6, 0.92, 0.6] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        height: 3,
        borderRadius: 2,
        background: `linear-gradient(90deg, ${heroColor}cc, ${accentColor}77, transparent)`,
        marginBottom: 20,
        transformOrigin: "left center",
      }}
    />
  );
}
