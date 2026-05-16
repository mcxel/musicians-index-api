"use client";

// MastheadReveal
// Magazine masthead entrance: rises (0-0.5s) → holds (0.5-1.3s) → fades into orbit content (1.9s+)

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onHoldComplete?: () => void;
};

export default function MastheadReveal({ onHoldComplete }: Props) {
  const [phase, setPhase] = useState<"rise" | "hold" | "fade">("rise");

  useEffect(() => {
    // Timing lock (A2):
    // Reveal: 320ms
    // Hold:   480ms
    // Fade:   360ms (exit transition)
    // Steady-state visible by ~0.8s, then fades out ~1.16s total.
    const REVEAL_MS = 320;
    const HOLD_MS = 480;

    const t1 = setTimeout(() => setPhase("hold"), REVEAL_MS);
    const t2 = setTimeout(() => {
      setPhase("fade");
      onHoldComplete?.();
    }, REVEAL_MS + HOLD_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onHoldComplete]);

  return (
    <AnimatePresence>
      {phase !== "fade" && (
        <motion.div
          key="masthead-reveal"
          initial={{ y: 60, opacity: 0, scale: 0.88 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.36, ease: "easeIn" } }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          {/* Glow burst behind text */}
          <motion.div
            animate={{ opacity: [0.18, 0.42, 0.18], scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 420,
              height: 240,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse 70% 50%, rgba(0,255,255,0.22), transparent 75%)",
              pointerEvents: "none",
            }}
          />

          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: "easeOut" }}
            style={{
              fontSize: "clamp(28px, 8vw, 52px)",
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fff",
              lineHeight: 0.9,
              textShadow: "0 0 40px rgba(0,255,255,0.35), 0 2px 20px rgba(0,0,0,0.9)",
            }}
          >
            THE MUSICIAN&apos;S INDEX
          </motion.div>

          {/* Subtitle glow line */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.42, duration: 0.38, ease: "easeOut" }}
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, #00FFFF, #FF2DAA, #AA2DFF, transparent)",
              borderRadius: 1,
              maxWidth: 320,
            }}
          />

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.54, duration: 0.34 }}
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Crown Duel · Weekly Rankings · Live Battles
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
