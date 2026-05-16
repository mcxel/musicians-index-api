"use client";

// VotePulseButton
// Per-card vote button with pulse animation and optimistic count display
// Used on Home 1-2 rank cards for per-artist voting

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  artistId: string;
  initialVotes?: number;
  accentColor?: string;
  onVote?: (artistId: string) => void;
  glow?: boolean;
};

export default function VotePulseButton({
  artistId,
  initialVotes = 0,
  accentColor = "#FF2DAA",
  onVote,
  glow = false,
}: Props) {
  const [count, setCount] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [burst, setBurst] = useState(false);

  function handleVote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (voted) return;
    setVoted(true);
    setCount((c) => c + 1);
    setBurst(true);
    setTimeout(() => setBurst(false), 600);
    onVote?.(artistId);
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Burst ring */}
      <AnimatePresence>
        {burst && (
          <motion.div
            key="burst"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.52, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.5px solid ${accentColor}`,
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={glow ? { y: -1, boxShadow: `0 0 14px ${accentColor}66` } : undefined}
        whileTap={{ scale: 0.88 }}
        animate={voted ? {
          background: [`${accentColor}1a`, `${accentColor}30`, `${accentColor}1a`],
          transition: { duration: 0.5, ease: "easeOut" },
        } : {}}
        onClick={handleVote}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 9px",
          borderRadius: 999,
          border: `1px solid ${voted ? accentColor + "88" : accentColor + "44"}`,
          background: voted ? `${accentColor}1a` : "rgba(255,255,255,0.04)",
          cursor: voted ? "default" : "pointer",
          color: voted ? accentColor : "rgba(255,255,255,0.5)",
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          outline: "none",
        }}
      >
        <motion.span
          animate={voted ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.35 }}
          style={{ fontSize: 9, lineHeight: 1 }}
        >
          {voted ? "👍" : "👆"}
        </motion.span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {count > 0 ? count.toLocaleString() : "Vote"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
