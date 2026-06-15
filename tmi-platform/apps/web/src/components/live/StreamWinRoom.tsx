import React, { useState, useEffect, useCallback } from 'react';
import { VibeState, RoomRole } from '../../types/vibe';
import { VibeControlPanel } from './VibeControlPanel';
import { MaskedVideoTile } from './MaskedVideoTile';

interface StreamWinRoomProps {
  currentUserRole: RoomRole;
  roomId: string;
}

const DEFAULT_VIBE: VibeState = {
  underlay: 'stellar-drift',
  overlay: 'none',
  strobeIntensity: 0.3,
  transitionMode: 'fade',
  spotlightMode: false,
  shaderQuality: 'medium'
};

// Simulated WebRTC/WebSocket LiveRegistry hook
const useLiveRegistry = (roomId: string) => {
  const broadcastVibeState = useCallback((vibeState: VibeState) => {
    console.log(`[LiveRegistry] Broadcasting vibe state for room ${roomId} to Billboard Wall:`, vibeState);
    // In production, this emits to the signaling server:
    // socket.emit('room:vibe:update', { roomId, vibeState });
  }, [roomId]);

  return { broadcastVibeState };
};

export const StreamWinRoom: React.FC<StreamWinRoomProps> = ({ currentUserRole, roomId }) => {
  // State synced via LiveRegistry/WebSockets to ensure persistence across all observers
  const [roomVibe, setRoomVibe] = useState<VibeState>(DEFAULT_VIBE);
  
  const { broadcastVibeState } = useLiveRegistry(roomId);

  // Dummy data representing active performers
  const [participants, setParticipants] = useState([
    { id: 'p1', name: 'Ray Journey', isAudioActive: true },
    { id: 'p2', name: 'Nova Cipher', isAudioActive: false },
    { id: 'p3', name: 'Verse.XL', isAudioActive: false },
    { id: 'p4', name: 'FlowState.J', isAudioActive: false },
  ]);

  const handleVibeChange = (updates: Partial<VibeState>) => {
    if (currentUserRole !== 'performer') return;
    
    const newVibe = { ...roomVibe, ...updates };
    setRoomVibe(newVibe);
    
    // Sync `newVibe` payload back to the LiveRegistry so the 
    // Billboard Wall previews pick up the atmospheric changes instantly.
    broadcastVibeState(newVibe);
  };

  // Dynamic Brady-Bunch scalable layout logic
  const getGridClass = () => {
    const count = participants.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 9) return 'grid-cols-3 grid-rows-3';
    return 'grid-cols-4 grid-rows-4';
  };

  return (
    <div className="stream-win-room flex h-screen w-full bg-black overflow-hidden relative font-sans selection:bg-cyan-500/30">
      
      {/* Global Arena Atmosphere Lighting */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(30,10,50,0.5)_0%,_rgba(0,0,0,1)_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-[url('/assets/fx/film-grain.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      {/* Core Room Area (The Stage) */}
      <div className="flex-1 flex flex-col p-6 z-10 relative">
        <header className="mb-6 flex justify-between items-center text-white">
          <div>
            <h1 className="text-3xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">ARENA <span className="bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">LOBBY</span></h1>
            <p className="text-cyan-400/60 text-xs font-bold tracking-[0.2em] mt-1 uppercase flex items-center gap-2"><span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></span> SIGNAL ACTIVE • STAGE ID: {roomId}</p>
          </div>
          <div className="flex space-x-3">
            <span className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full font-black text-[10px] tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> BROADCASTING</span>
            <span className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-gray-300 tracking-widest shadow-inner">{participants.length} PERFORMERS</span>
          </div>
        </header>

        {/* Brady-Bunch Live Performance Grid */}
        <div className={`flex-1 grid gap-6 ${getGridClass()} transition-all duration-700 ease-in-out pb-4`}>
          {participants.map(p => (
            <MaskedVideoTile
              key={p.id}
              performerName={p.name}
              isLive={p.isAudioActive}
              shape="octagon"
              avatarEmoji="🎤"
              accentColor="#00FFFF"
            />
          ))}
        </div>
      </div>

      {/* Performer Vibe Control Deck */}
      <div className="w-[340px] border-l border-white/10 bg-black/60 backdrop-blur-2xl p-6 z-20 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative">
        <h2 className="text-white text-sm font-black mb-6 uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center justify-between drop-shadow-md">
          Control Deck
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] animate-pulse"></span>
        </h2>
        <div className="flex-1 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 transition-colors">
          <VibeControlPanel 
            role={currentUserRole} 
            vibeState={roomVibe} 
            onVibeChange={handleVibeChange} 
          />
        </div>
        
        {/* Beta Supporter Badge & Investment Entry */}
        <div className="mt-6 p-5 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-xl text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
          <p className="text-[9px] text-cyan-400 font-bold mb-3 uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">🚧 Season Zero Beta</p>
          <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all tracking-widest border border-white/20 hover:scale-[1.02]">
            BECOME A FOUNDER
          </button>
        </div>
      </div>
    </div>
  );
};