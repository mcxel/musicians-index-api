/**
 * TmiVersusBattleArena — Standalone VS Battle Arena presenter.
 */

import React from "react";

export interface Performer {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  handle?: string;
  videoStream?: any;
  themeColor?: string;
  isLive?: boolean;
}

export interface TmiVersusBattleArenaProps {
  leftPerformer: Performer;
  rightPerformer: Performer;
  round?: string;
  onVote?: (performerId: string) => void;
}

export default function TmiVersusBattleArena({
  leftPerformer,
  rightPerformer,
  round = "Round 1",
  onVote,
}: TmiVersusBattleArenaProps) {
  return (
    <div className="w-full flex items-center justify-between p-6 bg-black/40 border border-amber-500/30 rounded-xl">
      <div className="flex flex-col items-center gap-2">
        <span className="text-lg font-bold text-amber-400">{leftPerformer.name}</span>
        <span className="text-2xl font-extrabold text-white">{leftPerformer.score} PTS</span>
        {onVote && (
          <button
            onClick={() => onVote(leftPerformer.id)}
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-xs"
          >
            VOTE LEFT
          </button>
        )}
      </div>
      <div className="text-xl font-black text-amber-500 tracking-widest">VS</div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-lg font-bold text-cyan-400">{rightPerformer.name}</span>
        <span className="text-2xl font-extrabold text-white">{rightPerformer.score} PTS</span>
        {onVote && (
          <button
            onClick={() => onVote(rightPerformer.id)}
            className="px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg text-xs"
          >
            VOTE RIGHT
          </button>
        )}
      </div>
    </div>
  );
}
