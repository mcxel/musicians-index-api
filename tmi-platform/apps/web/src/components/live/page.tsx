'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AudienceScene from '@/components/live/AudienceScene';
import { MaskedVideoTile } from '@/components/live/MaskedVideoTile';

export default function LiveRoomRoute({ params }: { params: { roomId: string } }) {
  const [curtainOpen, setCurtainOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCurtainOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden flex flex-col items-center justify-center">
      {/* Curtain Transition Overlay */}
      <div 
        className="absolute inset-0 z-50 bg-[#050510] flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out"
        style={{ transform: curtainOpen ? 'translateY(-100%)' : 'translateY(0)' }}
      >
        <div className="text-[#FF2DAA] text-5xl mb-6 animate-pulse drop-shadow-[0_0_15px_#FF2DAA]">🎭</div>
        <div className="text-[#FFD700] font-black tracking-[0.25em] text-xs uppercase" style={{ fontFamily: 'var(--font-orbitron, sans-serif)' }}>Loading Venue...</div>
      </div>

      {/* Top Navigation / Escape Hatch */}
      <div className="absolute top-6 left-6 z-40">
        <Link href="/arena" className="text-white/40 text-[10px] font-black tracking-widest uppercase hover:text-[#00FFFF] transition-colors decoration-none">
          ← LEAVE ROOM
        </Link>
      </div>

      {/* 3D Audience Background Generator */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        <AudienceScene view="fan" venue={1} />
      </div>

      {/* Main Stage Masked Video Focus */}
      <div className="relative z-10 w-full max-w-2xl aspect-video p-4 flex justify-center mt-[-10vh]">
        <MaskedVideoTile
          participantId="main-stage"
          performerName={`LIVE EVENT: ${params.roomId.toUpperCase()}`}
          isLive={true}
          isAudioActive={true}
          accentColor="#FFD700"
          shape="torn-edge"
          size={450}
          showActions={true}
        />
      </div>
    </div>
  );
}