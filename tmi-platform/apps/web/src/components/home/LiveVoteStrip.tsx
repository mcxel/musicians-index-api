"use client";

// LiveVoteStrip
// Compact animated strip: Voting Live + Crown Updating badges
// Positioned below the masthead in Home 1 top-left safe zone

import { motion } from "framer-motion";

type Props = {
  voteLabel?: string;
  crownLabel?: string;
};

export default function LiveVoteStrip({
  voteLabel = "Voting Live",
  crownLabel = "Crown Updating",
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        pointerEvents: "none",
      }}
    >
      {/* Voting Live */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.38 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,45,170,0.5)",
          background: "rgba(255,45,170,0.10)",
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#FF2DAA",
            boxShadow: "0 0 6px #FF2DAA",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: "#FF2DAA",
            textTransform: "uppercase",
          }}
        >
          {voteLabel}
        </span>
      </motion.div>

      {/* Crown Updating */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.38 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,215,0,0.4)",
          background: "rgba(255,215,0,0.07)",
        }}
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: 8, lineHeight: 1 }}
        >
          👑
        </motion.span>
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#FFD700",
            textTransform: "uppercase",
          }}
        >
          {crownLabel}
        </span>
      </motion.div>
    </div>
  );
}
