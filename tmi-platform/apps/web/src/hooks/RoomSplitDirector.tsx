"use client";

import React, { useState } from "react";
import { useWardenBot } from "@/hooks/useWardenBot";

// Adjusted to ensure type availability without breaking if types/battles isn't fully scaffolded
export interface BattleSessionState {
  leftFaction: string;
  rightFaction: string;
}

interface HardenedRoomDirectorProps {
  session: BattleSessionState;
  userId: string;
  onVoteSubmitted: (faction: "OLD_SCHOOL" | "NEW_SCHOOL") => void;
}

export default function HardenedRoomDirector({ session, userId, onVoteSubmitted }: HardenedRoomDirectorProps) {
  const [mixValue, setMixValue] = useState(50);
  const { registerUserAction, isQuarantined } = useWardenBot(userId, 8);

  const handleVoteClick = (faction: "OLD_SCHOOL" | "NEW_SCHOOL") => {
    // Pass validation through our automated security monitoring bot layer first
    const isActionValid = registerUserAction("FACTION_VOTE");
    if (!isActionValid) return;

    onVoteSubmitted(faction);
  };

  return (
    <div className="w-full h-screen bg-neutral-950 flex flex-col relative select-none font-sans text-white">
      
      {/* 1. REAL-TIME INTERACTIVE SLIDER MIXER HUD */}
      <div className="w-full bg-neutral-900 border-b border-neutral-800 p-4 z-40 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
          [ Canvas Density Balance Mixer ]
        </span>
        <input 
          type="range" 
          min="10" 
          max="90" 
          value={mixValue} 
          onChange={(e) => setMixValue(Number(e.target.value))}
          className="w-48 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <span className="text-xs font-mono text-indigo-400 font-bold">{mixValue}% / {100 - mixValue}%</span>
      </div>

      {/* 2. LIVE FACTION COMBAT INTERACTION SUITE */}
      <div className="flex-1 w-full relative flex items-center justify-center p-8">
        {isQuarantined ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 max-w-md text-center backdrop-blur-md">
            <h4 className="text-rose-400 font-mono text-xs font-bold uppercase tracking-widest mb-2">
              ⚠️ Security Containment Active
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Interaction capability restricted. Automated monitoring detected input velocity exceeding safety parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
            <button 
              onClick={() => handleVoteClick("OLD_SCHOOL")}
              className="py-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/50 transition-all font-mono text-xs tracking-wider uppercase"
            >
              Support {session.leftFaction}
            </button>
            <button 
              onClick={() => handleVoteClick("NEW_SCHOOL")}
              className="py-4 rounded-xl bg-rose-950/40 border border-rose-500/20 hover:border-rose-500/50 transition-all font-mono text-xs tracking-wider uppercase"
            >
              Support {session.rightFaction}
            </button>
          </div>
        )}
      </div>

      {/* 3. HARDLAUNCH RUNTIME PERSISTENCE DISPLAY */}
      <div className="absolute bottom-4 right-4 z-40 bg-neutral-900/90 border border-neutral-800 px-3 py-1 rounded text-[10px] font-mono text-neutral-400">
        LEDGER STATUS: <span className="text-emerald-400 font-bold">SYNCHRONIZED</span>
      </div>
    </div>
  );
}