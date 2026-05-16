import React from 'react';
import { LobbyState } from '@/lib/lobby/LobbyStateEngine';
import { LobbyEnvironmentInteractionEngine } from '@/lib/lobby/LobbyEnvironmentInteractionEngine';

export const LobbyEnvironmentToys = ({ state }: { state: LobbyState }) => {
  if (!LobbyEnvironmentInteractionEngine.canInteract(state)) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
       {/* Disco Ball Anchor */}
       <button 
         className="pointer-events-auto absolute top-8 left-1/2 -translate-x-1/2 text-4xl hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-[pulse_4s_ease-in-out_infinite]"
         onClick={() => LobbyEnvironmentInteractionEngine.interactWith('disco_ball', state)}
         title="Change Light Pattern"
       >🪩</button>
       {/* Jukebox / Beat Pad Anchor */}
       <button 
         className="pointer-events-auto absolute bottom-36 left-12 text-4xl hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
         onClick={() => LobbyEnvironmentInteractionEngine.interactWith('jukebox', state)}
         title="Preview Beat"
       >📻</button>
    </div>
  );
};