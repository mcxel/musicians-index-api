"use client";

import { motion } from "framer-motion";

const NUMBERS = [1, 2, 3, 4, 5];

export default function IssueNumberOverlay({ accentColor = "#AA2DFF" }: { accentColor?: string }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {NUMBERS.map((n, i) => {
        const pos = [
          { top: "8%",  left: "4%"  },
          { top: "28%", right: "3%" },
          { top: "52%", left: "5%"  },
          { top: "72%", right: "5%" },
          { top: "88%", left: "45%" },
        ][i]!;

        return (
          <motion.div
            key={n}
            animate={{
              y: [0, -4, 0],
              opacity: [0.05, 0.12, 0.05],
            }}
            transition={{ duration: 5.5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.9 }}
            style={{
              position: "absolute",
              ...pos,
              fontSize: 52,
              fontWeight: 900,
              color: accentColor,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
          >
            {n}
          </motion.div>
        );
      })}
    </div>
  );
}
