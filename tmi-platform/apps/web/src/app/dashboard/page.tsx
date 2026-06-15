'use client';

import React from 'react';
import AudienceScene from '@/components/live/AudienceScene';
import { MaskedVideoTile } from '@/components/live/MaskedVideoTile';

export default function LiveRoomRoute({ params }: { params: { roomId: string } }) {
  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden flex flex-col items-center justify-center">
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