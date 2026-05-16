'use client';
import React, { useEffect, useState } from 'react';
import { VenueSeatRenderer } from './VenueSeatRenderer';
import { StageQueueTerminal } from './StageQueueTerminal';
import { VenueHUDOverlay } from './VenueHUDOverlay';
import { lobbyStateEngine, LobbyState } from '@/lib/lobby/LobbyStateEngine';
import { SceneGraphNode } from '@/lib/lobby/lobbyMetadataLoader';
import { LobbyEnvironmentToys } from './LobbyEnvironmentToys';
import { LobbyInventoryTray } from './LobbyInventoryTray';
import { LobbyVideoFeedBubble } from './LobbyVideoFeedBubble';
import { LobbyMicroGoalsPanel } from './LobbyMicroGoalsPanel';

interface LobbyWorldRendererProps {
  roomName: string;
}

export const LobbyWorldRenderer: React.FC<LobbyWorldRendererProps> = ({ roomName }) => {
  const [lobbyState, setLobbyState] = useState<LobbyState>('FREE_ROAM');

  useEffect(() => {
    const unsubscribe = lobbyStateEngine.subscribe(setLobbyState);
    return () => { unsubscribe(); };
  }, []);

  const mockSeats: SceneGraphNode[] = [
    { id: 'seat-vip-1', type: 'VIP_SEAT', anchor: { x: -20, y: 0, z: 15 } },
    { id: 'seat-vip-2', type: 'VIP_SEAT', anchor: { x: 20, y: 0, z: 15 } },
    { id: 'seat-gen-1', type: 'LOW_SEAT', anchor: { x: -10, y: 0, z: 25 } },
    { id: 'seat-gen-2', type: 'LOW_SEAT', anchor: { x: 10, y: 0, z: 25 } },
    { id: 'seat-gen-3', type: 'LOW_SEAT', anchor: { x: 0, y: 0, z: 30 } },
  ];

  return (
    <div className="relative w-full h-screen bg-[#06070d] text-white font-sans overflow-hidden flex flex-col">
      <header className="flex-none p-4 md:p-6 border-b border-white/5 bg-black/60 backdrop-blur-md z-50 flex justify-between items-center">
        <h1 className="text-lg md:text-2xl font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{roomName}</h1>
        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 bg-zinc-900 border border-[#00FFFF]/30 rounded-full text-[10px] font-black tracking-widest uppercase text-zinc-300 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
            ENGINE STATE: <span className="text-[#00FFFF] ml-2 animate-pulse">{lobbyState}</span>
          </span>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden bg-gradient-to-b from-black/40 to-black/80">
        <StageQueueTerminal />
        <VenueSeatRenderer seats={mockSeats} onSeatClick={(seat) => console.log('Seat click:', seat.id)} />

        <LobbyEnvironmentToys state={lobbyState} />
        <LobbyVideoFeedBubble state={lobbyState} userId="" />
        <LobbyMicroGoalsPanel userId="" />
        <LobbyInventoryTray state={lobbyState} />

        <VenueHUDOverlay />
      </main>
    </div>
  );
};
