'use client';

import React from 'react';
import { Calendar, MapPin, DollarSign, Target } from 'lucide-react'; // Removing emojis completely

interface VenueBookingCanvasProps {
  artistName: string;
  baseRate: number;
}

export default function VenueBookingCanvas({ artistName, baseRate }: VenueBookingCanvasProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a0f18] border border-[#00FFFF]/20 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Canvas */}
      <div className="h-32 w-full bg-gradient-to-r from-[#AA2DFF] to-[#FF2DAA] flex items-end px-8 pb-6">
        <h2 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-md">
          BOOK // {artistName}
        </h2>
      </div>

      {/* Interactive Booking Module */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-white">
            <Calendar className="text-[#00FFFF]" />
            <span className="font-semibold tracking-wider">SELECT AVAILABLE DATE</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <MapPin className="text-[#00FFFF]" />
            <span className="font-semibold tracking-wider">SELECT VENUE KIOSK</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <Target className="text-[#00FFFF]" />
            <span className="font-semibold tracking-wider">PERFORMANCE TARGET (CYPHER/CONCERT)</span>
          </div>
        </div>
        <div className="bg-black/50 p-6 rounded-xl border border-white/5 flex flex-col justify-center items-center">
          <DollarSign size={48} className="text-[#FFD700] mb-4" />
          <p className="text-2xl font-bold text-white mb-6">BASE RATE: ${baseRate.toLocaleString()}</p>
          <button className="w-full py-4 bg-[#00FFFF] text-black font-black uppercase tracking-widest hover:bg-white transition-colors rounded">Initiate Smart Contract</button>
        </div>
      </div>
    </div>
  );
}