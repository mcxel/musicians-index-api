"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TransitionType } from "@/lib/radio/BPMMatchEngine";

interface NowMixingBannerProps {
  visible: boolean;
  label: string;
  djName?: string;
  transitionType: TransitionType;
  onDone: () => void;
}

const TYPE_COLORS: Record<TransitionType, string> = {
  "fade":          "#00C8FF",
  "slow-blend":    "#AA2DFF",
  "genre-bridge":  "#FFD700",
  "quick-cut":     "#FF2DAA",
  "hype-drop":     "#FF2020",
};

export default function NowMixingBanner({ visible, label, djName = "DJ NOVA", transitionType, onDone }: NowMixingBannerProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  const color = TYPE_COLORS[transitionType];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mixing-banner"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: 170,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 8200,
            background: "rgba(5,5,16,0.97)",
            border: `1px solid ${color}55`,
            backdropFilter: "blur(12px)",
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: `0 0 20px ${color}20, 0 8px 32px rgba(0,0,0,0.6)`,
            fontFamily: "'Inter',sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 14 }}>🎛️</span>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color }}>
            {djName}
          </span>
          <span style={{ width: 1, height: 12, background: `${color}40` }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            {label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
