import React from 'react';
import { LobbyState } from '@/lib/lobby/LobbyStateEngine';
import { LobbyPropInteractionEngine, PropAction } from '@/lib/lobby/LobbyPropInteractionEngine';

export const LobbyPropUseButton = ({ propId, icon, action, state }: { propId: string, icon: string, action: PropAction, state: LobbyState }) => {
  return (
    <button 
      onClick={() => LobbyPropInteractionEngine.triggerAction(action, propId, state)}
      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#FF2DAA]/20 border border-transparent hover:border-[#FF2DAA] flex items-center justify-center text-lg transition-all active:scale-95 shadow-sm"
      title={`Use ${propId}`}
    >
      <span className="drop-shadow-md">{icon}</span>
    </button>
  );
};