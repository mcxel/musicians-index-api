"use client";

// Canon source: Venue Skins Plus Seating/ — floor perspective gradient
// Visual floor: angled perspective gradient from bottom, layout-aware height,
// + optional grid/pattern overlay per skin

import React from "react";
import type { VenueSkin } from "@/components/venue/VenueShell";

type VenueLayoutHint = "standing" | "theater" | "arena" | "intimate" | "broadcast";

interface VenueFloorLayerProps {
  skin?: VenueSkin;
  layout?: VenueLayoutHint;
  floorColor?: string;
  style?: React.CSSProperties;
}

const FLOOR_DEFAULTS: Record<VenueSkin, { color: string; pattern: "grid" | "wood" | "none" }> = {
  "neon-club":    { color: "rgba(0,255,255,0.06)",   pattern: "grid" },
  "space-lounge": { color: "rgba(0,255,255,0.04)",   pattern: "none" },
  "auditorium":   { color: "rgba(100,70,30,0.10)",   pattern: "wood" },
  "outdoor":      { color: "rgba(50,80,30,0.12)",    pattern: "none" },
  "game-show":    { color: "rgba(170,45,255,0.08)",  pattern: "grid" },
  "dark-space":   { color: "rgba(255,255,255,0.02)", pattern: "none" },
};

function floorHeight(layout: VenueLayoutHint): string {
  if (layout === "theater" || layout === "arena") return "45%";
  if (layout === "broadcast") return "35%";
  return "30%";
}

export default function VenueFloorLayer({
  skin = "dark-space",
  layout = "standing",
  floorColor,
  style,
}: VenueFloorLayerProps) {
  const def = FLOOR_DEFAULTS[skin];
  const color = floorColor ?? def.color;

  return (
    <div
      aria-hidden="true"
      data-venue-layer="floor"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: floorHeight(layout),
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${color} 0%, transparent 100%)` }} />

      {def.pattern === "grid" && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="floor-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke={color} strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#floor-grid)" />
        </svg>
      )}

      {def.pattern === "wood" && (
        <div style={{ position: "absolute", inset: 0 }}>
          {[0, 16, 32, 48, 64, 80].map((top) => (
            <div key={top} style={{ position: "absolute", left: 0, right: 0, top: `${top}%`, height: 1, background: "rgba(139,90,43,0.15)" }} />
          ))}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 0, left: "5%", right: "5%", height: 2, background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
    </div>
  );
}
