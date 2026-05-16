"use client";

import React from "react";
import StageFrame from "@/packages/foundation-visual/StageFrame";
import BillboardFrame from "@/packages/foundation-visual/BillboardFrame";
import NameThatTuneBoard from "@/packages/foundation-visual/NameThatTuneBoard";
import HexCluster from "@/packages/foundation-effects/HexCluster";
import LiveVideoShell from "@/packages/foundation-visual/LiveVideoShell";

export function FeaturedGameZone() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">Featured: Name That Tune</h2>
        <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold animate-pulse tracking-widest">LIVE NOW</span>
      </div>
      <StageFrame theme="royal-arena" className="flex-1 p-4">
        <NameThatTuneBoard slots={[
          { id: "1", content: "GUESS 1", revealed: false },
          { id: "2", content: "WINNER", revealed: true },
          { id: "3", content: "GUESS 3", revealed: false },
          { id: "4", content: "GUESS 4", revealed: false }
        ]} />
      </StageFrame>
    </div>
  );
}

export function GameSelectorZone() {
  const games = ["Cypher Arena", "Name That Tune", "Deal or Feud", "Stream & Win", "Dance Party"];
  return (
    <div className="w-full h-full">
      <h2 className="text-xl font-bold text-fuchsia-400 mb-4 tracking-widest uppercase">Game Modes</h2>
      <HexCluster items={games} />
    </div>
  );
}

export function WeeklyEventTrackerZone() {
  return (
    <div className="w-full h-full bg-zinc-950 border border-white/10 p-6 rounded-xl">
      <h3 className="text-zinc-400 text-xs font-black tracking-[0.2em] mb-4">WEEKLY LEADERBOARD</h3>
      <div className="flex justify-between border-b border-white/5 pb-2 mb-2"><span className="text-white font-bold">1. Ray Journey</span><span className="text-yellow-500">14,200 pts</span></div>
      <div className="flex justify-between border-b border-white/5 pb-2 mb-2"><span className="text-white font-bold">2. Nova Pulse</span><span className="text-cyan-500">12,100 pts</span></div>
    </div>
  );
}

export function PrizePoolZone() {
  return (
    <BillboardFrame sponsorTag="SOUNDWAVE AUDIO" className="h-full flex flex-col justify-center items-center text-center p-8">
      <h2 className="text-4xl font-black text-cyan-300 italic mb-2">$50,000</h2>
      <p className="text-zinc-300 text-sm tracking-widest uppercase font-bold">Current Weekly Prize Pool</p>
      <button className="mt-6 bg-cyan-500 text-black px-8 py-3 rounded-full font-black hover:scale-105 transition-transform">ENTER TO WIN</button>
    </BillboardFrame>
  );
}