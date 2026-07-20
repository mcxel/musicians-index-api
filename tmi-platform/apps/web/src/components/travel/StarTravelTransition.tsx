"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface StarTravelTransitionProps {
  isTraveling: boolean;
  destinationName: string;
  onTravelComplete: () => void;
}

export default function StarTravelTransition({
  isTraveling,
  destinationName,
  onTravelComplete,
}: StarTravelTransitionProps) {
  const [phase, setPhase] = useState<"SEATED" | "WARP" | "ARRIVING">("SEATED");

  useEffect(() => {
    if (!isTraveling) {
      setPhase("SEATED");
      return;
    }

    setPhase("SEATED");
    const t1 = setTimeout(() => setPhase("WARP"), 800);
    const t2 = setTimeout(() => setPhase("ARRIVING"), 2800);
    const t3 = setTimeout(() => {
      onTravelComplete();
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isTraveling, onTravelComplete]);

  if (!isTraveling) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          background: "#020208",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Starfield warp canvas simulation */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              phase === "WARP"
                ? "radial-gradient(circle at center, rgba(0,255,255,0.4) 0%, rgba(170,45,255,0.3) 40%, #020208 90%)"
                : "radial-gradient(circle at center, rgba(255,45,170,0.2) 0%, #020208 80%)",
            transition: "background 0.8s ease",
          }}
        />

        {/* Hyper-speed streak lines */}
        {phase === "WARP" && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 2.5, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeIn" }}
            style={{
              position: "absolute",
              width: 800,
              height: 800,
              borderRadius: "50%",
              border: "3px dashed rgba(0,255,255,0.8)",
              boxShadow: "0 0 50px rgba(0,255,255,0.6), inset 0 0 50px rgba(255,45,170,0.6)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Floating Travel Chair Graphic */}
        <motion.div
          animate={
            phase === "WARP"
              ? { scale: [1, 1.1, 0.9, 1.05], y: [-5, 5, -5] }
              : { scale: 1, y: 0 }
          }
          transition={{ repeat: Infinity, duration: 0.6 }}
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
              border: "2px solid #FFD700",
              boxShadow: "0 0 30px rgba(255,45,170,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
            }}
          >
            💺
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, textTransform: "uppercase" }}>
              {phase === "SEATED" ? "LOCKING AUDIENCE SEAT..." : phase === "WARP" ? "STAR-FIELD WARP ACTIVE" : "PRELOADING VENUE..."}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 4, textShadow: "0 0 16px rgba(0,255,255,0.8)" }}>
              {destinationName}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
