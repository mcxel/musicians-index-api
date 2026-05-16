"use client";

// LightningAccent
// One-shot animated lightning bolt energy punctuation
// Fires on mount, can be retriggered via key prop

import { motion } from "framer-motion";

type Props = {
  color?: string;
  size?: number;
  style?: React.CSSProperties;
};

const BOLT = "M10 0 L6 9 L9 9 L5 18 L12 6 L8 6 Z";

export default function LightningAccent({ color = "#FFD700", size = 18, style }: Props) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
      animate={{ opacity: [0, 0.85, 0.65, 0.85, 0], scale: [0.4, 1.1, 1, 1.05, 0.8] }}
      transition={{ duration: 0.72, ease: "easeOut" }}
      width={size}
      height={size * 1.4}
      viewBox="0 0 18 22"
      fill="none"
      style={{
        filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color}88)`,
        pointerEvents: "none",
        userSelect: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <path d={BOLT} fill={color} />
    </motion.svg>
  );
}
