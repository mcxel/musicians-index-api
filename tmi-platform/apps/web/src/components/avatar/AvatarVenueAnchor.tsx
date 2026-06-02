"use client";
/**
 * AvatarVenueAnchor — Pins hero characters to specific positions in a venue.
 * Overlay on top of AudienceScene canvas.
 *
 * P11A: emoji + CSS animation (no 3D asset yet)
 * P12: replace emoji rendering with Three.js hero rig
 */

import { useState, useEffect } from "react";
import { getHeroSeatOverlay } from "@/lib/avatar/HeroAudienceSpawner";
import type { SeatAssignment } from "@/lib/avatar/HeroAudienceSpawner";

interface Props {
  venueSlug:  string;
  venueIndex: 0 | 1 | 2 | 3 | 4;
  width?:     number;
  height?:    number;
}

function seatToPixel(seatIndex: number, venueIndex: number, w: number, h: number): { x: number; y: number } {
  const cols = venueIndex === 1 ? 8 : venueIndex === 2 ? 4 : 6;
  const row = Math.floor(seatIndex / cols);
  const col = seatIndex % cols;
  const xSpread = w * 0.7;
  const xStart  = (w - xSpread) / 2;
  return {
    x: xStart + (col / Math.max(cols - 1, 1)) * xSpread,
    y: h * 0.55 + row * (-h * 0.06),
  };
}

function HeroPin({ seat, venueIndex, cW, cH }: { seat: SeatAssignment; venueIndex: number; cW: number; cH: number }) {
  const [hovered, setHovered] = useState(false);
  const pos  = seatToPixel(seat.seatIndex, venueIndex, cW, cH);
  const size = seat.tier === "hero_icon" ? 32 : seat.tier === "hero_legend" ? 28 : 24;

  return (
    <div
      style={{ position: "absolute", left: pos.x - size / 2, top: pos.y - size / 2, width: size, height: size, cursor: "pointer", zIndex: seat.tier === "hero_icon" ? 20 : 16 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `2px solid ${seat.color}`, boxShadow: `0 0 ${hovered ? 16 : 8}px ${seat.color}88`, transition: "box-shadow 0.2s", animation: "heroGlow 3s ease-in-out infinite" }} />
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.7, background: `${seat.color}22`, borderRadius: "50%", animation: seat.animState === "celebrate" ? "heroBounce 0.4s ease-in-out infinite" : seat.animState === "dance" ? "heroDance 0.8s ease-in-out infinite" : "heroIdle 4s ease-in-out infinite" }}>
        {seat.emoji}
      </div>
      {hovered && seat.label && (
        <div style={{ position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)", background: "rgba(5,5,16,0.96)", border: `1px solid ${seat.color}55`, borderRadius: 6, padding: "3px 10px", whiteSpace: "nowrap", fontSize: 9, fontWeight: 800, color: seat.color, letterSpacing: "0.08em", pointerEvents: "none" }}>
          {seat.label} · HERO
        </div>
      )}
    </div>
  );
}

export default function AvatarVenueAnchor({ venueSlug, venueIndex, width = 400, height = 300 }: Props) {
  const [heroSeats, setHeroSeats] = useState<SeatAssignment[]>([]);

  useEffect(() => {
    setHeroSeats(getHeroSeatOverlay(venueSlug, venueIndex));
  }, [venueSlug, venueIndex]);

  if (heroSeats.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <style>{`
        @keyframes heroIdle    { 0%,100%{transform:scale(1)}     50%{transform:scale(1.05)} }
        @keyframes heroBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes heroDance   { 0%{transform:rotate(-6deg)}     50%{transform:rotate(6deg)} 100%{transform:rotate(-6deg)} }
        @keyframes heroGlow    { 0%,100%{opacity:0.6}            50%{opacity:1} }
      `}</style>
      {heroSeats.map(seat => (
        <div key={`${seat.heroId ?? "g"}-${seat.seatIndex}`} style={{ pointerEvents: "all" }}>
          <HeroPin seat={seat} venueIndex={venueIndex} cW={width} cH={height} />
        </div>
      ))}
    </div>
  );
}
