"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface InstantBattleLauncherPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchBattle: (battleConfig: {
    format: string;
    roundDurationSec: number;
    stakesCoins: number;
    opponentId?: string;
  }) => void;
}

const BATTLE_FORMATS = [
  { id: "1v1-cypher", label: "1v1 Freestyle Cypher", icon: "🎤" },
  { id: "verse-vs-verse", label: "Verse vs Verse Showcase", icon: "🔥" },
  { id: "beat-battle", label: "Beatmaker Producer Clash", icon: "🎹" },
  { id: "dance-off", label: "Bobblehead Dance-Off", icon: "🕺" },
];

export default function InstantBattleLauncherPanel({
  isOpen,
  onClose,
  onLaunchBattle,
}: InstantBattleLauncherPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState("1v1-cypher");
  const [roundDuration, setRoundDuration] = useState(60);
  const [stakes, setStakes] = useState(100);
  const [isLaunching, setIsLaunching] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    setIsLaunching(true);
    setTimeout(() => {
      onLaunchBattle({
        format: selectedFormat,
        roundDurationSec: roundDuration,
        stakesCoins: stakes,
      });
      setIsLaunching(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99950] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Video Game Pop-Up HUD Panel */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">⚔️</span>
              <div>
                <h3 className="text-base font-black tracking-widest text-amber-400">INSTANT BATTLE LAUNCHER</h3>
                <p className="text-[10px] text-white/50">ZERO-FRICTION VIDEO GAME HUD</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-xs font-bold text-white/70"
            >
              ✕
            </button>
          </div>

          {/* Format Selector */}
          <div className="my-5">
            <label className="text-[10px] font-black text-amber-400/80 tracking-widest block mb-2">
              SELECT BATTLE FORMAT
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BATTLE_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    selectedFormat === fmt.id
                      ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl">{fmt.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{fmt.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-2 gap-4 my-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div>
              <label className="text-[9px] font-bold text-white/60 block mb-1">ROUND TIME (SEC)</label>
              <select
                value={roundDuration}
                onChange={(e) => setRoundDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-amber-400"
              >
                <option value={30}>30 Seconds (Fast Cypher)</option>
                <option value={60}>60 Seconds (Standard Verse)</option>
                <option value={90}>90 Seconds (Full Showcase)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-white/60 block mb-1">STAKES (TMI COINS)</label>
              <select
                value={stakes}
                onChange={(e) => setStakes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-cyan-400"
              >
                <option value={50}>50 Coins (Friendly)</option>
                <option value={100}>100 Coins (Ranked)</option>
                <option value={500}>500 Coins (High Stakes)</option>
              </select>
            </div>
          </div>

          {/* Instant Launch Action Button */}
          <button
            onClick={handleStart}
            disabled={isLaunching}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm tracking-widest rounded-xl hover:from-amber-400 hover:to-amber-500 transition shadow-xl shadow-amber-500/30 active:scale-98 flex items-center justify-center gap-2"
          >
            {isLaunching ? (
              <span className="animate-spin text-lg">⚡</span>
            ) : (
              <>
                <span>🚀 INSTANT START BATTLE</span>
                <span className="text-xs opacity-75">(NO PAGE RELOAD)</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
