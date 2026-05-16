import React from 'react';
import { SceneGraphNode } from '@/lib/lobby/lobbyMetadataLoader';

interface SeatContextMenuProps {
  seat: SceneGraphNode;
  onClose: () => void;
}

export const SeatContextMenu: React.FC<SeatContextMenuProps> = ({ seat, onClose }) => {
  return (
    <div 
      className="absolute bg-black/90 backdrop-blur-md border border-[#00FFFF]/30 rounded-lg p-3 shadow-[0_0_20px_rgba(0,255,255,0.15)] z-50 flex flex-col gap-2 min-w-[120px]"
      style={{
        left: `calc(50% + ${seat.anchor.x * 10}px + 20px)`,
        top: `calc(50% + ${seat.anchor.z * 10}px - 20px)`,
      }}
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{seat.id}</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-xs">✕</button>
      </div>
      <button className="text-[10px] font-bold text-white bg-[#00FFFF]/10 hover:bg-[#00FFFF]/30 border border-[#00FFFF]/30 rounded py-1.5 transition-colors tracking-wide">
        CLAIM SEAT
      </button>
      <button className="text-[10px] font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded py-1.5 transition-colors tracking-wide">
        RELEASE
      </button>
    </div>
  );
};