"use client";

// Canon source: game show and venue skins/ + Venue Skins Plus Seating/
// Lighting effects: spotlight cones from ceiling, LED ceiling ring (neon-club),
// galaxy star field (space-lounge), natural wash (outdoor), broadcast rig (game-show)

import React, { useEffect, useRef } from "react";
import type { VenueSkin } from "@/components/venue/VenueShell";

interface VenueLightingRigProps {
  skin?: VenueSkin;
  /** Beat-sync pulse: 0–1 intensity applied to glow brightness */
  beatIntensity?: number;
  style?: React.CSSProperties;
}

const SKIN_GLOW: Record<VenueSkin, string> = {
  "neon-club":    "#AA2DFF",
  "space-lounge": "#00FFFF",
  "auditorium":   "#FFD700",
  "outdoor":      "#00FF88",
  "game-show":    "#FF2DAA",
  "dark-space":   "#00FFFF",
};

const SPOTLIGHT_POSITIONS: Record<VenueSkin, number[]> = {
  "neon-club":    [20, 50, 80],
  "space-lounge": [33, 67],
  "auditorium":   [25, 50, 75],
  "outdoor":      [50],
  "game-show":    [25, 50, 75],
  "dark-space":   [50],
};

// ─── Spotlight cone ───────────────────────────────────────────────────────────

function SpotlightCone({ left, glow, height = "65%", width = 4, blur = 6 }: {
  left: number; glow: string; height?: string; width?: number; blur?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: `${left}%`,
        transform: "translateX(-50%)",
        width,
        height,
        background: `linear-gradient(to bottom, ${glow}90 0%, ${glow}20 60%, transparent 100%)`,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── LED ceiling ring (neon-club) ─────────────────────────────────────────────

function LedCeilingRing({ glow }: { glow: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "2%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "70%",
        height: 0,
        borderRadius: "50%",
        boxShadow: `0 0 0 2px ${glow}30, 0 0 20px ${glow}40, 0 0 60px ${glow}15`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Star field (space-lounge) ────────────────────────────────────────────────

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 23 + 7) % 50,
  size: (i % 3) + 1,
  opacity: 0.2 + (i % 5) * 0.08,
}));

function StarField() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {STARS.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

// ─── Natural wash (outdoor) ───────────────────────────────────────────────────

function NaturalWash({ glow }: { glow: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "30%",
        background: `linear-gradient(to bottom, ${glow}12, transparent)`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueLightingRig({
  skin = "dark-space",
  beatIntensity = 0,
  style,
}: VenueLightingRigProps) {
  const glow = SKIN_GLOW[skin];
  const spotPositions = SPOTLIGHT_POSITIONS[skin];
  const brightnessBoost = 1 + beatIntensity * 0.3;

  return (
    <div
      aria-hidden="true"
      data-venue-layer="lighting"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 8,
        pointerEvents: "none",
        filter: `brightness(${brightnessBoost})`,
        ...style,
      }}
    >
      {/* Skin-specific effects */}
      {skin === "neon-club" && <LedCeilingRing glow={glow} />}
      {skin === "space-lounge" && <StarField />}
      {skin === "outdoor" && <NaturalWash glow={glow} />}

      {/* Spotlight cones — all skins */}
      {spotPositions.map((pos) => (
        <SpotlightCone
          key={pos}
          left={pos}
          glow={glow}
          height={skin === "game-show" ? "75%" : "65%"}
          blur={skin === "auditorium" ? 10 : 5}
        />
      ))}

      {/* Game-show top bar glow */}
      {skin === "game-show" && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8%",
          background: `linear-gradient(to bottom, ${glow}25, transparent)`,
        }} />
      )}
    </div>
  );
}
