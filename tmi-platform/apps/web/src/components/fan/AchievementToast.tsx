"use client";
import React, { useEffect, useState } from "react";
import type { AchievementUnlockEvent } from "@/lib/gamification/AchievementEngine";

const RARITY_COLORS = {
  common: "#94a3b8",
  uncommon: "#34d399",
  rare: "#60a5fa",
  epic: "#a78bfa",
  legendary: "#ffd700",
};

interface AchievementToastProps {
  event: AchievementUnlockEvent | null;
  onDismiss: () => void;
}

export function AchievementToast({ event, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      setExiting(false);

      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onDismiss();
        }, 400);
      }, 4000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [event, onDismiss]);

  if (!visible || !event) return null;

  const rarityColor = RARITY_COLORS[event.achievement.rarity];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9998,
        maxWidth: 340,
        fontFamily: "system-ui, sans-serif",
        animation: exiting
          ? "slideOutRight 0.4s ease forwards"
          : "slideInRight 0.35s ease forwards",
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(120%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(120%); }
        }
      `}</style>

      <div
        style={{
          background: "rgba(2,6,23,0.97)",
          border: `1px solid ${rarityColor}`,
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: `0 0 24px ${rarityColor}40`,
          cursor: "pointer",
        }}
        onClick={() => { setExiting(true); setTimeout(() => { setVisible(false); onDismiss(); }, 400); }}
      >
        <div style={{ fontSize: 36, lineHeight: 1 }}>{event.achievement.badgeIcon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: rarityColor, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 2 }}>
            Achievement Unlocked{event.tier !== null ? ` — Tier ${event.tier}` : ""}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>
            {event.achievement.title}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>
            {event.achievement.description}
          </div>
          {event.xpAwarded > 0 && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#ffd700", fontWeight: 700 }}>
              +{event.xpAwarded} XP
            </div>
          )}
        </div>

        <div
          style={{
            padding: "3px 8px",
            borderRadius: 12,
            background: `${rarityColor}20`,
            border: `1px solid ${rarityColor}40`,
            fontSize: 9,
            color: rarityColor,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {event.achievement.rarity}
        </div>
      </div>
    </div>
  );
}
