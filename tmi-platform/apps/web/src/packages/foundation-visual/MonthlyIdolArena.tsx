import React from 'react';
import VenueEnvironment from '../venue/VenueEnvironment';
import VenueSeatingGrid from '../venue/VenueSeatingGrid';

/**
 * MonthlyIdolArena: Massive, premium stadium environment.
 * Features a sprawling stage, judges' panel, and huge amphitheater seating.
 */
export default function MonthlyIdolArena() {
  return (
    <VenueEnvironment type="amphitheater" ambientColor="fuchsia" isOutdoor={true}>
      {/* Massive LED Stage */}
      <div className="relative w-full max-w-5xl mx-auto h-80 bg-zinc-950 border-b-4 border-fuchsia-600 rounded-b-[100px] shadow-[0_30px_100px_rgba(217,70,239,0.2)] flex flex-col items-center">
        <div className="w-full h-1/2 bg-[url('/effects/starburst.gif')] opacity-40 mix-blend-screen rounded-t-3xl" />
        <div className="flex-1 w-full flex items-center justify-center">
          <span className="text-fuchsia-400 font-black tracking-[0.3em] uppercase opacity-50">PERFORMANCE ZONE</span>
        </div>
      </div>

      {/* Judges Panel */}
      <div className="w-full max-w-2xl mx-auto h-20 -mt-10 bg-zinc-900 border-2 border-fuchsia-500 rounded-2xl z-20 relative flex items-center justify-around shadow-2xl">
        <span className="text-zinc-500 text-xs font-bold">JUDGE 1</span>
        <span className="text-zinc-500 text-xs font-bold">JUDGE 2</span>
        <span className="text-zinc-500 text-xs font-bold">JUDGE 3</span>
      </div>

      <VenueSeatingGrid seatStyle="stadium" seatColor="fuchsia-500" capacity={100} />
    </VenueEnvironment>
  );
}