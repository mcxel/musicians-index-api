import React from 'react';
import VenueEnvironment from '../venue/VenueEnvironment';
import VenueSeatingGrid from '../venue/VenueSeatingGrid';

/**
 * MarcelStageArena: Apollo-style comedy & talent showcase room.
 * Features a focused stage, a host desk, and a dense, reactive seating grid.
 */
export default function MarcelStageArena({ hostName, performerName }: { hostName: string, performerName: string }) {
  return (
    <VenueEnvironment type="hole-in-the-wall" ambientColor="gold">
      {/* Stage Area */}
      <div className="relative w-full max-w-4xl mx-auto mt-10 h-72 bg-gradient-to-b from-amber-900/40 to-black border-t-4 border-yellow-500 rounded-t-full flex items-end justify-center shadow-[0_-20px_60px_rgba(234,179,8,0.15)]">
        <div className="absolute top-10 left-10 bg-zinc-950 border border-yellow-500/50 p-4 rounded-xl shadow-xl">
          <p className="text-[10px] text-yellow-500 font-black tracking-widest">HOST</p>
          <p className="text-white font-bold">{hostName}</p>
        </div>
        <div className="mb-10 w-48 h-64 border border-white/20 bg-black/60 rounded-lg flex items-center justify-center text-white/40 text-xs text-center">
          {performerName} <br/>(Avatar/Video Mount)
        </div>
      </div>

      {/* Seating Grid */}
      <VenueSeatingGrid seatStyle="stadium" seatColor="yellow-500" capacity={80} />
    </VenueEnvironment>
  );
}