'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface PremiumBeatSliderProps {
  minPrice?: number;
  maxPrice?: number;
  orientation?: 'horizontal' | 'vertical';
  onBidChange?: (value: number) => void;
  assetName?: string;
}

/**
 * TMI Premium Economy Slider
 * HD Interactive slider for NFT bidding and Beat Purchasing.
 */
export default function PremiumBeatSlider({
  minPrice = 50,
  maxPrice = 5000,
  orientation = 'horizontal',
  onBidChange,
  assetName = 'Exclusive License'
}: PremiumBeatSliderProps) {
  const [value, setValue] = useState<number>(minPrice);
  const isHorizontal = orientation === 'horizontal';

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setValue(val);
    if (onBidChange) onBidChange(val);
  };

  // Calculate gradient fill percentage
  const percentage = ((value - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} items-center gap-4 w-full max-w-md bg-black/40 p-6 rounded-xl border border-white/10`}>
      <div className="flex justify-between w-full text-xs font-bold tracking-widest text-[#00FFFF] uppercase mb-2">
        <span>{assetName}</span>
        <span className="text-[#FFD700]">${value.toLocaleString()}</span>
      </div>
      
      <div className="relative flex items-center justify-center w-full group">
        {/* Hardware-styled Chevrons */}
        {isHorizontal ? <ChevronLeft size={16} className="absolute left-0 text-white/30" /> : <ChevronDown size={16} className="absolute bottom-0 text-white/30" />}
        
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={10}
          value={value}
          onChange={handleScrub}
          className={`w-full appearance-none bg-transparent cursor-pointer z-10 ${isHorizontal ? 'h-2' : 'w-2 h-48'}`}
          style={{
            background: isHorizontal ? `linear-gradient(90deg, #FF2DAA ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)` : `linear-gradient(0deg, #FF2DAA ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
            borderRadius: '99px',
            writingMode: isHorizontal ? undefined : 'vertical-lr',
            direction: isHorizontal ? undefined : 'rtl',
          }}
        />
        {isHorizontal ? <ChevronRight size={16} className="absolute right-0 text-white/30" /> : <ChevronUp size={16} className="absolute top-0 text-white/30" />}
      </div>
    </div>
  );
}