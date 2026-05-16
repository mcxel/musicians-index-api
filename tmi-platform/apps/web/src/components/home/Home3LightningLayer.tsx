"use client";

import { motion } from "framer-motion";

const BOLTS = [
  { id: 0, top: "28%", left: "22%", rotate: 12,  color: "#FFD700", delay: 0 },
  { id: 1, top: "52%", left: "61%", rotate: -8,  color: "#00FFFF", delay: 0.9 },
  { id: 2, top: "18%", left: "78%", rotate: 20,  color: "#FF2DAA", delay: 1.7 },
  { id: 3, top: "70%", left: "38%", rotate: -15, color: "#AA2DFF", delay: 2.4 },
];

const BOLT_PATH = "M6 0 L0 12 L5 12 L-1 24 L7 10 L3 10 Z";

export default function Home3LightningLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", overflow: "hidden" }}>
      {BOLTS.map((b) => (
        <motion.svg
          key={b.id}
          viewBox="-2 -2 12 28"
          style={{
            position: "absolute",
            top: b.top, left: b.left,
            width: 10, height: 22,
            transform: `rotate(${b.rotate}deg)`,
            overflow: "visible",
          }}
          animate={{ opacity: [0, 0.85, 0.2, 0.85, 0], filter: [`drop-shadow(0 0 3px ${b.color})`, `drop-shadow(0 0 8px ${b.color})`, `drop-shadow(0 0 3px ${b.color})`, `drop-shadow(0 0 8px ${b.color})`, `drop-shadow(0 0 0px transparent)`] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3.8 + b.delay * 1.2, ease: "easeOut" }}
        >
          <path d={BOLT_PATH} fill={b.color} />
        </motion.svg>
      ))}
    </div>
  );
}
