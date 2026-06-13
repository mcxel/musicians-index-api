"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ActivityTimelineCanister } from './ActivityTimelineCanister';
import { SponsorStampWallCanister } from './SponsorStampWallCanister';
import { SponsorBubbleOrbitCanister } from './SponsorBubbleOrbitCanister';

interface RoomHUDProps {
  venueId: string;
  venueClass: string;
}

export const RoomHUD: React.FC<RoomHUDProps> = ({ venueId, venueClass }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6"
    >
      {/* Top Bar: Venue Info & Sponsors */}
      <div className="flex justify-between items-start pointer-events-none">
        <div className="bg-black/70 backdrop-blur-lg border border-[#00FFFF]/20 rounded-lg px-6 py-3 pointer-events-auto shadow-[0_0_30px_rgba(0,255,255,0.1)]">
          <div className="text-white font-bold text-xl tracking-widest uppercase shadow-black drop-shadow-md">
            {venueClass}
          </div>
          <div className="text-xs text-[#00FFFF] font-mono mt-1">
            [{venueId.replace('-', ' ')}]
          </div>
        </div>
        <SponsorStampWallCanister />
      </div>

      {/* Center/Right 3D Orbit Overlay */}
      <SponsorBubbleOrbitCanister />

      {/* Bottom Bar: Activity Timeline & Controls */}
      <div className="flex justify-between items-end pointer-events-none">
        <ActivityTimelineCanister />
        
        <div className="flex gap-4 items-center pointer-events-auto">
          <button className="bg-gray-900/80 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-bold border border-gray-500 backdrop-blur-md transition-all uppercase text-xs tracking-widest shadow-lg">Share Stream</button>
          <button className="bg-gradient-to-r from-[#FF2DAA] to-[#AA2DFF] hover:scale-105 text-white px-8 py-3 rounded-full font-bold border border-[#FF2DAA]/50 backdrop-blur-md shadow-[0_0_20px_rgba(255,45,170,0.5)] transition-all uppercase text-xs tracking-widest">Tip / Support</button>
        </div>
      </div>
    </motion.div>
  );
};