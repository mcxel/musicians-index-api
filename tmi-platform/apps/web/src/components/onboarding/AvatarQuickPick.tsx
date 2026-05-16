"use client";

// Canon source: Fan Sign up.png — Avatar Quick Pick row beneath the form
// 4 avatar bubbles: FREE / BRONZE / SILVER / HOST
// Tap to select — selected bubble gets glow ring

import React, { useState } from "react";

export type AvatarTier = "FREE" | "BRONZE" | "SILVER" | "HOST";

interface AvatarOption {
  tier: AvatarTier;
  label: string;
  color: string;        // ring + glow color
  bg: string;           // bubble background
  icon: string;         // emoji placeholder until real avatar assets mount
  locked?: boolean;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  { tier: "FREE",   label: "FREE",   color: "#00FFFF", bg: "rgba(0,255,255,0.08)",    icon: "🎵" },
  { tier: "BRONZE", label: "BRONZE", color: "#CD7F32", bg: "rgba(205,127,50,0.12)",   icon: "🎤" },
  { tier: "SILVER", label: "SILVER", color: "#C0C0C0", bg: "rgba(192,192,192,0.12)",  icon: "⭐" },
  { tier: "HOST",   label: "HOST",   color: "#FF2DAA", bg: "rgba(255,45,170,0.12)",   icon: "👑", locked: true },
];

interface AvatarQuickPickProps {
  value?: AvatarTier;
  onChange?: (tier: AvatarTier) => void;
  /** Label above the row — default "QUICK PICK AVATAR" */
  label?: string;
}

export default function AvatarQuickPick({
  value,
  onChange,
  label = "QUICK PICK AVATAR",
}: AvatarQuickPickProps) {
  const [internal, setInternal] = useState<AvatarTier>("FREE");
  const selected = value ?? internal;

  function handleSelect(tier: AvatarTier, locked?: boolean) {
    if (locked) return;
    setInternal(tier);
    onChange?.(tier);
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Row label */}
      <p
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 10,
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>

      {/* Bubble row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {AVATAR_OPTIONS.map((opt) => {
          const isSelected = selected === opt.tier;
          return (
            <button
              key={opt.tier}
              onClick={() => handleSelect(opt.tier, opt.locked)}
              aria-label={`Select ${opt.label} avatar`}
              aria-pressed={isSelected}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: opt.locked ? "not-allowed" : "pointer",
                padding: 0,
                opacity: opt.locked ? 0.45 : 1,
              }}
            >
              {/* Avatar bubble */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: opt.bg,
                  border: `2px solid ${isSelected ? opt.color : `${opt.color}40`}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow: isSelected
                    ? `0 0 12px ${opt.color}80, 0 0 24px ${opt.color}30`
                    : "none",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  position: "relative",
                }}
              >
                {opt.icon}
                {/* Lock badge */}
                {opt.locked && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      fontSize: 12,
                      background: "rgba(5,5,16,0.85)",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    🔒
                  </span>
                )}
              </div>

              {/* Tier label */}
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  color: isSelected ? opt.color : "rgba(255,255,255,0.4)",
                  transition: "color 0.2s",
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
