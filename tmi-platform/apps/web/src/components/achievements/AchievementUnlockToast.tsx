"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface AchievementToastData {
  id: string;
  name: string;
  iconEmoji: string;
  xpReward: number;
  category: string;
}

interface Props {
  achievement: AchievementToastData | null;
  onDismiss: () => void;
}

export function AchievementUnlockToast({ achievement, onDismiss }: Props) {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9998,
            background: "linear-gradient(135deg, rgba(13,17,23,0.98), rgba(5,5,16,0.98))",
            border: "1px solid rgba(255,215,0,0.5)",
            borderRadius: 16,
            padding: "16px 20px",
            minWidth: 280,
            maxWidth: 340,
            boxShadow: "0 0 40px rgba(255,215,0,0.2), 0 8px 32px rgba(0,0,0,0.8)",
            cursor: "pointer",
          }}
          onClick={onDismiss}
        >
          {/* Glow bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #FFD700, #FF9500)", borderRadius: "16px 16px 0 0" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Icon */}
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "rgba(255,215,0,0.12)",
              border: "1px solid rgba(255,215,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              flexShrink: 0,
            }}>
              {achievement.iconEmoji}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 3 }}>
                ACHIEVEMENT UNLOCKED
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {achievement.name}
              </div>
              <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 700 }}>
                +{achievement.xpReward} XP
              </div>
            </div>
          </div>

          {/* Progress bar (4 second countdown) */}
          <motion.div
            style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: "#FFD700", borderRadius: "0 0 16px 16px" }}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementUnlockToast;
