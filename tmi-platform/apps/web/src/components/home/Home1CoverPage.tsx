import React from 'react';
import Link from 'next/link';
import { OmniDashboards } from '@/components/hud/OmniDashboards';

// Mocks for imports that exist elsewhere in Claude's architectural spec
// If these files exist in another directory, Copilot will fix the exact paths.
import { TmiMagazineOrbitalUnderlay } from '@/components/home/TmiMagazineOrbitalUnderlay';
import { OmniPresenceEngine } from '@/components/hud/OmniPresenceEngine';

/**
 * Home1CoverPage
 * Priority 1 Audit Foundation.
 * Directly maps the Claude-designed visual canon: Magazine -> Orbital Underlay -> Action CTAs.
 */
export const Home1CoverPage: React.FC = () => {
  return (
    <main className="relative w-full min-h-screen bg-[#050510] text-white overflow-hidden font-sans">
      
      {/* 
        LAYER 1: The Magazine Engine & Orbital Underlay 
        Proving the primary visual artifact is mounted and interactive.
      */}
      <div className="absolute inset-0 z-0">
        <TmiMagazineOrbitalUnderlay />
      </div>

      {/* 
        LAYER 2: The Hero Focus
        Ensures the user knows exactly what this page is for (The One Reason Rule).
      */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pointer-events-none">
        <div className="p-8 bg-black bg-opacity-70 border border-[#00FFFF] shadow-[0_0_40px_rgba(0,255,255,0.1)] rounded-2xl pointer-events-auto backdrop-blur-sm flex flex-col items-center text-center max-w-3xl">
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            <span className="text-white">THE MUSICIAN's </span>
            <span className="text-[#00FFFF]">INDEX</span>
          </h1>
          
          <div className="flex items-center gap-3 mb-8">
            <span className="px-3 py-1 bg-[#FF2DAA] text-white text-xs font-bold rounded-sm animate-pulse shadow-[0_0_10px_#FF2DAA]">VOTING LIVE</span>
            <span className="text-[#FFD700] text-sm font-mono tracking-widest">CROWN UPDATING</span>
          </div>

          <p className="text-gray-300 text-lg mb-8 max-w-xl">
            Join the network. Challenge the Crown. Enter the live arena.
          </p>

          <Link href="/live/lobby">
            <button className="px-10 py-4 bg-transparent border-2 border-[#00FFFF] text-[#00FFFF] font-bold tracking-widest uppercase hover:bg-[#00FFFF] hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]">
              Enter Live Arena
            </button>
          </Link>
        </div>
      </div>

      {/* 
        LAYER 3: The Engine & HUD Mounts
        Mounting the required observability and interactive logic layers.
      */}
      <div className="relative z-50">
        {/* Presence Engine: Tracks Who is Online / Where */}
        <OmniPresenceEngine />
        
        {/* Progressive Disclosure Dashboards (Collapsed by Default) */}
        <OmniDashboards />
      </div>
    </main>
  );
};