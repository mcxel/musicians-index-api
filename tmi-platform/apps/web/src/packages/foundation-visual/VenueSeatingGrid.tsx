import React from 'react';

export type SeatStyle = 'stadium' | 'vip-booth' | 'couches' | 'festival-grass' | 'bar-stools';

type VenueSeatingGridProps = {
  seatStyle?: SeatStyle;
  seatColor?: string;
  capacity?: number;
};

/**
 * VenueSeatingGrid: Customizable seating arrangements for audiences.
 * Copilot: Wire seat items to audience avatars and scale based on room capacity.
 */
export default function VenueSeatingGrid({ seatStyle = 'stadium', seatColor = 'cyan-500', capacity = 50 }: VenueSeatingGridProps) {
  const styleMap: Record<SeatStyle, string> = {
    'stadium': 'grid-cols-10 gap-2 rounded-t-lg',
    'vip-booth': 'grid-cols-4 gap-8 rounded-2xl',
    'couches': 'grid-cols-3 gap-12 rounded-3xl',
    'festival-grass': 'flex flex-wrap gap-4 justify-center',
    'bar-stools': 'flex justify-center gap-6 border-t-4 border-amber-800 pt-4',
  };

  return (
    <div className={`w-full max-w-6xl mx-auto mt-12 p-8 bg-black/40 backdrop-blur-md rounded-3xl border-t border-white/10 ${seatStyle === 'festival-grass' ? 'flex' : 'grid'} ${styleMap[seatStyle]}`}>
      {Array.from({ length: Math.min(capacity, 100) }).map((_, i) => (
        <div key={i} className={`h-12 w-12 bg-${seatColor}/20 border border-${seatColor}/50 shadow-[0_0_15px_rgba(var(--tw-colors-${seatColor}),0.3)] flex items-center justify-center transition-all hover:scale-110 cursor-pointer`} style={{ borderRadius: seatStyle === 'vip-booth' ? '12px' : '4px' }}>
          <span className="text-[8px] opacity-30">SEAT</span>
        </div>
      ))}
    </div>
  );
}