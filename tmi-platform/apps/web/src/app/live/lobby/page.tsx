'use client';

import React from 'react';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';

export default function LiveLobbyRoute() {
  return (
    <main className="min-h-screen bg-[#050510] text-white p-8">
      <BillboardLiveWall mode="home" maxTiles={18} title="TMI GLOBAL LIVE LOBBY" showActions />
    </main>
  );
}