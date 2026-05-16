'use client';
import React, { useState } from 'react';
import { SceneGraphNode } from '@/lib/lobby/lobbyMetadataLoader';
import { SeatContextMenu } from './SeatContextMenu';
import type { SeatIntelligenceState } from '@/lib/lobby/NextShowSeatReservationEngine';

type RuntimeSeatState = SeatIntelligenceState | 'OPEN';

type RuntimeSeatMeta = {
  state: RuntimeSeatState;
  timerRemainingMs?: number;
};

interface VenueSeatRendererProps {
  seats: SceneGraphNode[];
  onSeatClick: (seat: SceneGraphNode) => void;
  seatRuntime?: Record<string, RuntimeSeatMeta>;
}

const STATE_STYLE: Record<RuntimeSeatState, string> = {
  OPEN: 'bg-zinc-800/80 border-white/20',
  LATE_ENTRY: 'bg-cyan-500/25 border-cyan-400/80',
  NEXT_SHOW_RESERVED: 'bg-emerald-500/25 border-emerald-400/80',
  STANDBY_QUEUE: 'bg-amber-500/25 border-amber-400/80',
  PRE_RESET: 'bg-orange-500/25 border-orange-400/80',
  POST_RESET: 'bg-sky-500/25 border-sky-400/80',
  FORFEIT_WINDOW: 'bg-rose-500/25 border-rose-400/80',
};

function formatTimer(ms?: number): string | null {
  if (!ms || ms <= 0) return null;
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const VenueSeatRenderer: React.FC<VenueSeatRendererProps> = ({ seats, onSeatClick, seatRuntime }) => {
  const [activeSeat, setActiveSeat] = useState<SceneGraphNode | null>(null);

  const handleSeatClick = (seat: SceneGraphNode) => {
    setActiveSeat(seat);
    onSeatClick(seat);
  };

  return (
    <>
      {seats.map(seat => (
        (() => {
          const runtime = seatRuntime?.[seat.id];
          const state = runtime?.state ?? 'OPEN';
          const timer = formatTimer(runtime?.timerRemainingMs);
          return (
        <div
          key={seat.id}
          onClick={() => handleSeatClick(seat)}
          className={`absolute w-8 h-8 rounded-full border cursor-pointer hover:border-[#00FFFF] hover:bg-[#00FFFF]/20 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center group ${STATE_STYLE[state]}`}
          style={{
            left: `calc(50% + ${seat.anchor.x * 10}px)`,
            top: `calc(50% + ${seat.anchor.z * 10}px)`,
            transform: 'translate(-50%, -50%)'
          }}
          title={`${seat.id} · ${state}${timer ? ` · ${timer}` : ''}`}
        >
          <span className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">🪑</span>
          {timer && (
            <span className="absolute -top-4 px-1 py-0.5 text-[8px] rounded bg-black/80 border border-white/20 text-white/90 whitespace-nowrap">
              {timer}
            </span>
          )}
        </div>
          );
        })()
      ))}
      
      {activeSeat && <SeatContextMenu seat={activeSeat} onClose={() => setActiveSeat(null)} />}
    </>
  );
};