"use client";

// Canon source: Venue Skins Plus Seating/ + game show and venue skins/
// Visual wall skin: left/right atmospheric glow panels, top/bottom accent lines,
// game-show marquee frame when skin === "game-show"

import React from "react";
import type { VenueSkin } from "@/components/venue/VenueShell";

interface VenueWallLayerProps {
  skin?: VenueSkin;
  /** Override wall glow color — defaults to per-skin color */
  wallColor?: string;
  /** Override border/accent glow color */
  glowColor?: string;
  style?: React.CSSProperties;
}

const WALL_DEFAULTS: Record<VenueSkin, { wall: string; glow: string }> = {
  "neon-club":    { wall: "rgba(170,45,255,0.12)",  glow: "#AA2DFF" },
  "space-lounge": { wall: "rgba(0,78,146,0.20)",    glow: "#00FFFF" },
  "auditorium":   { wall: "rgba(139,90,43,0.15)",   glow: "#FFD700" },
  "outdoor":      { wall: "rgba(0,100,50,0.10)",    glow: "#00FF88" },
  "game-show":    { wall: "rgba(255,45,170,0.10)",  glow: "#FF2DAA" },
  "dark-space":   { wall: "rgba(255,255,255,0.04)", glow: "#00FFFF" },
};

export default function VenueWallLayer({
  skin = "dark-space",
  wallColor,
  glowColor,
  style,
}: VenueWallLayerProps) {
  const defaults = WALL_DEFAULTS[skin];
  const wall = wallColor ?? defaults.wall;
  const glow = glowColor ?? defaults.glow;

  return (
    <div
      aria-hidden="true"
      data-venue-layer="wall"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
        ...style,
      }}
    >
      {/* Left wall atmospheric glow */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "18%",
          background: `linear-gradient(to right, ${wall}, transparent)`,
        }}
      />

      {/* Right wall atmospheric glow */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "18%",
          background: `linear-gradient(to left, ${wall}, transparent)`,
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(to right, transparent, ${glow}, transparent)`,
        }}
      />

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(to right, transparent, ${glow}80, transparent)`,
        }}
      />

      {/* Left edge neon strip (neon-club + game-show) */}
      {(skin === "neon-club" || skin === "game-show") && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "10%",
            bottom: "10%",
            width: 2,
            background: `linear-gradient(to bottom, transparent, ${glow}, transparent)`,
            boxShadow: `0 0 8px ${glow}60`,
          }}
        />
      )}

      {/* Right edge neon strip */}
      {(skin === "neon-club" || skin === "game-show") && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "10%",
            bottom: "10%",
            width: 2,
            background: `linear-gradient(to bottom, transparent, ${glow}, transparent)`,
            boxShadow: `0 0 8px ${glow}60`,
          }}
        />
      )}

      {/* Game-show marquee frame */}
      {skin === "game-show" && (
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            right: "5%",
            bottom: "5%",
            border: `2px solid ${glow}30`,
            borderRadius: 16,
            boxShadow: `inset 0 0 60px ${glow}08, 0 0 60px ${glow}08`,
          }}
        />
      )}

      {/* Space-lounge curved screen arcs */}
      {skin === "space-lounge" && (
        <>
          <div style={{
            position: "absolute", top: 0, left: "5%", right: "5%", height: "35%",
            border: `1px solid ${glow}15`,
            borderRadius: "0 0 50% 50%",
            borderTop: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, left: "12%", right: "12%", height: "25%",
            border: `1px solid ${glow}10`,
            borderRadius: "0 0 50% 50%",
            borderTop: "none",
          }} />
        </>
      )}

      {/* Auditorium side curtain panels */}
      {skin === "auditorium" && (
        <>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "8%",
            background: `linear-gradient(to right, ${wall}cc, ${wall}40, transparent)`,
            borderRight: `1px solid ${glow}10`,
          }} />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: "8%",
            background: `linear-gradient(to left, ${wall}cc, ${wall}40, transparent)`,
            borderLeft: `1px solid ${glow}10`,
          }} />
        </>
      )}
    </div>
  );
}
