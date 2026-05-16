"use client";

// Canon source: Venue Skins Plus Seating/ + game show and venue skins/
// Billboard/screen slot: aspect-ratio preserved display with glow, skin-aware border
// Slots: content (slot), fallback venueName/placeholder

import React from "react";
import type { VenueSkin } from "@/components/venue/VenueShell";

interface VenueScreenSystemProps {
  skin?: VenueSkin;
  /** Slot: content to display on screen */
  children?: React.ReactNode;
  /** Fallback venue name when no children */
  venueName?: string;
  /** Screen aspect ratio — default "16/9" */
  aspectRatio?: string;
  /** Whether to show screen glow halo */
  showGlow?: boolean;
  style?: React.CSSProperties;
}

const SCREEN_ACCENT: Record<VenueSkin, string> = {
  "neon-club":    "#AA2DFF",
  "space-lounge": "#00FFFF",
  "auditorium":   "#FFD700",
  "outdoor":      "#00FF88",
  "game-show":    "#FF2DAA",
  "dark-space":   "#00FFFF",
};

export default function VenueScreenSystem({
  skin = "dark-space",
  children,
  venueName,
  aspectRatio = "16/9",
  showGlow = true,
  style,
}: VenueScreenSystemProps) {
  const accent = SCREEN_ACCENT[skin];

  return (
    <div
      data-venue-screen
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      {/* Outer glow halo */}
      {showGlow && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 14,
            background: `radial-gradient(ellipse at center, ${accent}15 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Screen body */}
      <div
        style={{
          position: "relative",
          background: "rgba(0,0,0,0.75)",
          border: `1px solid ${accent}35`,
          borderRadius: 10,
          aspectRatio,
          overflow: "hidden",
          boxShadow: showGlow ? `0 0 30px ${accent}20` : undefined,
        }}
      >
        {children ?? <ScreenPlaceholder venueName={venueName} accent={accent} />}

        {/* Corner scan lines (decorative) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Game-show marquee overlay frame */}
        {skin === "game-show" && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 4,
              border: `1px solid ${accent}20`,
              borderRadius: 7,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Screen stand/mount hint for auditorium */}
      {skin === "auditorium" && (
        <div
          aria-hidden="true"
          style={{
            margin: "0 auto",
            width: "4%",
            height: 12,
            background: `linear-gradient(to bottom, ${accent}30, transparent)`,
          }}
        />
      )}
    </div>
  );
}

function ScreenPlaceholder({ venueName, accent }: { venueName?: string; accent: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {venueName ? (
        <span style={{ fontSize: 18, fontWeight: 900, color: accent, letterSpacing: "0.1em" }}>
          {venueName}
        </span>
      ) : (
        <>
          <div style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, opacity: 0.4 }}>
            📺
          </div>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
            SCREEN SLOT
          </span>
        </>
      )}
    </div>
  );
}
