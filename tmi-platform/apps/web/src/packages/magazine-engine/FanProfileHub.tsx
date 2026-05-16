import React from 'react';
import TMIOverlaySystem from '../foundation-visual/TMIOverlaySystem';
import JuliusSmartPopIn from '../mascots/JuliusSmartPopIn';

interface FanProfileProps {
  fanName: string;
  tier: 'Free' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  points: number;
  favoriteArtists: string[];
}

/**
 * FanProfileHub: The central command for user loyalty, points, and event tracking.
 */
export default function FanProfileHub({ fanName, tier, points, favoriteArtists }: FanProfileProps) {
  const tierColors = {
    Free: 'text-zinc-400',
    Bronze: 'text-amber-600',
    Silver: 'text-zinc-300',
    Gold: 'text-yellow-400',
    Platinum: 'text-cyan-200',
    Diamond: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]'
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 p-8 font-sans">
      <TMIOverlaySystem shape="angled-cut" opacity={30} />
      
      {/* Smart Interaction Layer */}
      <JuliusSmartPopIn />
      
      <div className="relative z-10 max-w-5xl mx-auto bg-black border border-white/10 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-5xl font-black text-white italic">{fanName}</h1>
        <div className="flex gap-4 mt-4 items-center">
          <span className={`text-xl font-black uppercase tracking-widest ${tierColors[tier]}`}>{tier} TIER</span>
          <span className="text-zinc-500">•</span>
          <span className="text-fuchsia-400 font-bold">{points} TMI Points</span>
        </div>
        
        {/* Full Pipeline Eco-System Hub Connections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <a href="/tickets" className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:-translate-y-1">
            <span className="text-2xl">🎫</span>
            <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">My Tickets</span>
          </a>
          <a href="/booking" className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:-translate-y-1">
            <span className="text-2xl">📅</span>
            <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">Bookings</span>
          </a>
          <a href="/collectibles" className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:-translate-y-1">
            <span className="text-2xl">🖼️</span>
            <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">NFT Assets</span>
          </a>
          <a href="/beats" className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:-translate-y-1">
            <span className="text-2xl">🎛️</span>
            <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">Beat Creation</span>
          </a>
        </div>
      </div>
    </div>
  );
}