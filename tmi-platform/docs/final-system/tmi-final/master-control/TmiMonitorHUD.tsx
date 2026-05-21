import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Flame, Award, Users } from 'lucide-react';

interface TmiMonitorHUDProps {
  viewers: number;
  totalPoints: number;
  rank: string;
  onVote: (direction: 'up' | 'down') => void;
}

export const TmiMonitorHUD: React.FC<TmiMonitorHUDProps> = ({ viewers, totalPoints, rank, onVote }) => {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div className="absolute right-4 top-1/4 bottom-1/4 w-20 flex flex-col justify-between items-center bg-black/40 backdrop-blur-lg border border-white/10 rounded-full py-6 z-20 shadow-2xl">
      
      {/* Top Stats */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center text-emerald-400">
          <Users size={18} />
          <span className="text-[10px] font-bold mt-1">{viewers}</span>
        </div>
        <div className="flex flex-col items-center text-yellow-400">
          <Award size={18} />
          <span className="text-[10px] font-bold mt-1">{rank}</span>
        </div>
      </div>

      {/* Interactive Vertical Slider (Crowd Energy / Volume) */}
      <div className="flex flex-col items-center h-32 w-full my-4 group">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-1 h-full appearance-none bg-zinc-700 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:bg-zinc-600 transition-all"
          style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
        />
      </div>

      {/* Interactive Voting Chevrons */}
      <div className="flex flex-col items-center gap-2">
        <button onClick={() => onVote('up')} className="p-2 bg-zinc-800 hover:bg-emerald-500 hover:text-black rounded-full text-white transition-all transform hover:scale-110 active:scale-95">
          <ChevronUp size={20} />
        </button>
        <div className="text-orange-500">
          <Flame size={20} className="animate-pulse" />
          <span className="text-[9px] font-black">{totalPoints}</span>
        </div>
        <button onClick={() => onVote('down')} className="p-2 bg-zinc-800 hover:bg-red-500 hover:text-black rounded-full text-white transition-all transform hover:scale-110 active:scale-95">
          <ChevronDown size={20} />
        </button>
      </div>

    </div>
  );
};