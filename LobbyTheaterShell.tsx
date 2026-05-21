import React from 'react';
import { LobbyStageViewport } from './LobbyStageViewport';
import { LobbyReactionRail } from './LobbyReactionRail';
import { LobbyTipRail } from './LobbyTipRail';
import { LobbyQueueRail } from './LobbyQueueRail';
import { LobbySeatGrid } from './LobbySeatGrid';

export const LobbyTheaterShell = ({ roomName }: { roomName: string }) => {
  // Mock data injected from the AI Venue Pipeline
  const mockSmartSlots = [
    { id: 's1', type: 'SOFA_CURVED', occupied: true },
    { id: 's2', type: 'BAR_STOOL', occupied: false },
    { id: 's3', type: 'DANCE_NODE', occupied: true },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#06070d] text-white font-sans overflow-hidden">
      <header className="flex-none p-4 md:p-6 border-b border-white/5 bg-black/60 backdrop-blur-md z-20">
        <h1 className="text-lg md:text-2xl font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{roomName}</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Rail: Queue */}
        <aside className="w-64 border-r border-white/5 hidden md:flex flex-col bg-black/40 backdrop-blur-sm">
          <LobbyQueueRail />
        </aside>

        {/* Center: Stage & Audience */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-black/20">
          <div className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto">
            <LobbyStageViewport />
            <LobbySeatGrid smartSlots={mockSmartSlots} />
          </div>
          {/* Bottom Rail: Reactions */}
          <div className="flex-none border-t border-white/5 p-4 md:p-6 bg-black/80 backdrop-blur-md">
            <LobbyReactionRail />
          </div>
        </main>

        {/* Right Rail: Tips / Chat */}
        <aside className="w-72 border-l border-white/5 hidden lg:flex flex-col bg-black/40 backdrop-blur-sm">
          <LobbyTipRail />
        </aside>
      </div>
    </div>
  );
};