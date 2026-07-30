/**
 * VenueSeatGrid — Audience seating grid renderer.
 */

import React from "react";

export interface VenueSeatGridProps {
  roomId?: string;
  crowdEnergy?: number;
  activeEmote?: string;
  totalSeats?: number;
  occupiedSeats?: number;
}

export default function VenueSeatGrid({
  totalSeats = 24,
  occupiedSeats = 12,
}: VenueSeatGridProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-4 bg-black/30 rounded-lg border border-white/10">
      {Array.from({ length: totalSeats }).map((_, i) => (
        <div
          key={`seat-${i}`}
          className={`h-8 rounded flex items-center justify-center text-xs font-mono ${
            i < occupiedSeats ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-white/5 text-white/30"
          }`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}
