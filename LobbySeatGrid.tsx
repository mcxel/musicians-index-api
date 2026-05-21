import React from 'react';

export interface SmartSlot {
  id: string;
  type: string;
  occupied: boolean;
}

export const LobbySeatGrid = ({ smartSlots = [] }: { smartSlots?: SmartSlot[] }) => {
  // Use AI-generated smart slots, or fallback to mock grid
  const slots = smartSlots.length > 0 ? smartSlots : Array.from({ length: 12 }).map((_, i) => ({
    id: `fallback-slot-${i}`,
    type: 'SEAT',
    occupied: false
  }));
  
  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-end mb-4 relative z-10">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Smart Anchors</h3>
        <span className="text-[8px] text-[#FF2DAA] tracking-widest border border-[#FF2DAA]/30 px-2 py-0.5 rounded-full animate-pulse">NAVMESH READY</span>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
        {slots.map((slot) => (
          <div key={slot.id} className={`aspect-square rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] ${slot.occupied ? 'bg-[#FF2DAA]/20 border-[#FF2DAA] opacity-100' : 'bg-zinc-900 border-white/10 opacity-50 hover:opacity-100 hover:border-[#00FFFF]'}`}>
            <span className="text-xs">{slot.occupied ? '👤' : '🪑'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};