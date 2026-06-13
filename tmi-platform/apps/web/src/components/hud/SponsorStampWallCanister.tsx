"use client";

import React from 'react';

export const SponsorStampWallCanister: React.FC = () => {
  // Mock connections to SponsorSlotRegistry
  const sponsors = [
    { id: '1', name: 'ENERGY', level: 'diamond', color: '#00FFFF' },
    { id: '2', name: 'GEAR', level: 'gold', color: '#FFD700' },
    { id: '3', name: 'SOUND', level: 'silver', color: '#C0C0C0' }
  ];

  return (
    <div className="bg-black/60 backdrop-blur-md border border-[#FF2DAA]/30 rounded-lg p-3 flex flex-col items-center pointer-events-auto">
      <h3 className="text-[#FF2DAA] text-xs font-bold tracking-widest uppercase mb-3">Sponsors</h3>
      <div className="flex justify-center gap-3">
        {sponsors.map(s => (
          <div 
            key={s.id} 
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-bold bg-black transition-transform hover:scale-110 cursor-pointer"
            style={{ borderColor: s.color, color: s.color, boxShadow: `0 0 10px ${s.color}40` }}
            title={s.level}
          >
            {s.name.substring(0, 3)}
          </div>
        ))}
      </div>
    </div>
  );
};