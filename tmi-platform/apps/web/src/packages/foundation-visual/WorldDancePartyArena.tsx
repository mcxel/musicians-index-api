import React from 'react';
import VenueEnvironment from '../venue/VenueEnvironment';

/**
 * WorldDancePartyArena: Standing-room-only festival/club environment.
 * Features a DJ Booth, visualizer walls, and open dance floor zones instead of seating.
 */
export default function WorldDancePartyArena({ djName, activeVisualizer = 'laser-grid' }: { djName: string, activeVisualizer?: string }) {
  return (
    <VenueEnvironment type="festival" ambientColor="cyan" isOutdoor={true}>
      {/* DJ Booth */}
      <div className="relative w-full max-w-3xl mx-auto h-40 bg-zinc-900 border-b-8 border-cyan-500 rounded-t-3xl flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.2)] z-20">
        <div className="absolute top-4 bg-black text-cyan-400 px-6 py-1 text-sm font-black tracking-widest uppercase border border-cyan-500/50 rounded-full">
          DJ {djName}
        </div>
        {/* Copilot: Mount DJ Record Ralph Avatar here */}
      </div>

      {/* Visualizer Wall */}
      <div className="absolute inset-0 -z-10 bg-[url('/effects/laser-grid.gif')] opacity-30 mix-blend-screen" />

      {/* Open Dance Floor */}
      <div className="flex-1 w-full flex items-end justify-center pb-20 perspective-1000">
        <div className="w-3/4 h-64 border-2 border-dashed border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-500/40 text-sm tracking-widest transform rotate-x-60">DANCE FLOOR ZONE</div>
      </div>
    </VenueEnvironment>
  );
}