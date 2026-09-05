"use client";

import React from "react";

export type ProfileRoleType =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "DJ"
  | "PRODUCER"
  | "COMEDIAN"
  | "DANCER"
  | "MAGICIAN";

export interface IdentityPlateProps {
  roleType: ProfileRoleType;
  tier: string;
  accentColor: string;
  isLive?: boolean;
  /** Compact mode for Explore cards and magazine links */
  compact?: boolean;
}

/** Return "#050510" or "#ffffff" — whichever is WCAG-readable against the bg. */
function contrastFg(hex: string): "#050510" | "#ffffff" {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  if (clean.length < 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#050510" : "#ffffff";
}

/**
 * Canonical role/type identity plate.
 * Appears at the top of every public profile, Explore result, and magazine
 * identity link. Plate background = owner's accent color; text auto-contrasts.
 */
export default function IdentityPlate({
  roleType,
  tier,
  accentColor,
  isLive = false,
  compact = false,
}: IdentityPlateProps) {
  const fg = contrastFg(accentColor);
  const plateFs = compact ? 7 : 8;
  const platePad = compact ? "2px 7px" : "3px 11px";
  const plateRad = compact ? 3 : 4;
  const tierFs = compact ? 7 : 9;

  return (
    <>
      {/* Pulse keyframe — inlined once; no-op if declared multiple times */}
      <style>{`@keyframes tmi-identity-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.25)}}`}</style>

      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: compact ? 3 : 5, lineHeight: 1 }}>
        {/* Role plate + optional live dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              background: accentColor,
              color: fg,
              fontSize: plateFs,
              fontWeight: 900,
              letterSpacing: "0.2em",
              padding: platePad,
              borderRadius: plateRad,
              fontFamily: "'Inter', sans-serif",
              userSelect: "none",
            }}
          >
            {roleType}
          </span>

          {isLive && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: compact ? 5 : 6,
                  height: compact ? 5 : 6,
                  borderRadius: "50%",
                  background: "#E63000",
                  boxShadow: "0 0 8px #E63000AA",
                  display: "inline-block",
                  animation: "tmi-identity-pulse 1.6s ease-in-out infinite",
                }}
              />
              {!compact && (
                <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.12em", color: "#E63000", fontFamily: "'Inter', sans-serif" }}>
                  LIVE
                </span>
              )}
            </span>
          )}
        </div>

        {/* Membership tier */}
        <span
          style={{
            fontSize: tierFs,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: accentColor,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {tier.toUpperCase()}
        </span>
      </div>
    </>
  );
}
