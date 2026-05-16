import React from 'react';
import { motion } from 'framer-motion';

interface JuliusPointsHUDProps {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  rewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
  currentStreak: number;
  dailyStreak: number;
  weeklyStreak: number;
  rankMovement: 'up' | 'down' | 'stable';
  nextUnlock: string;
}

export const JuliusPointsHUD: React.FC<JuliusPointsHUDProps> = ({
  level,
  currentXp,
  xpToNextLevel,
  rewardPoints,
  bonusPoints,
  seasonPoints,
  currentStreak,
  dailyStreak,
  weeklyStreak,
  rankMovement,
  nextUnlock,
}) => {
  const xpPercentage = Math.min(100, Math.max(0, (currentXp / xpToNextLevel) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm p-4 bg-zinc-950 border border-emerald-500/30 rounded-2xl shadow-2xl font-mono text-white"
    >
      {/* Header: Level & Rank */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-black font-black text-xl px-3 py-1 rounded-lg">
            LVL {level}
          </div>
          {rankMovement === 'up' && <span className="text-emerald-400 text-lg">▲</span>}
          {rankMovement === 'down' && <span className="text-red-500 text-lg">▼</span>}
          {rankMovement === 'stable' && <span className="text-gray-500 text-lg">—</span>}
        </div>
        <div className="text-xs text-emerald-400/70 text-right uppercase">
          Next Unlock:<br/>
          <span className="text-white font-bold">{nextUnlock}</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] uppercase text-gray-400 mb-1">
          <span>{currentXp.toLocaleString()} XP</span>
          <span>{xpToNextLevel.toLocaleString()} XP</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
          />
        </div>
      </div>

      {/* Points Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-zinc-900 p-2 rounded-xl text-center border border-white/5">
          <p className="text-[9px] text-gray-500 uppercase mb-1">Reward</p>
          <p className="text-sm font-black text-emerald-300">{rewardPoints.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-2 rounded-xl text-center border border-white/5">
          <p className="text-[9px] text-gray-500 uppercase mb-1">Bonus</p>
          <p className="text-sm font-black text-amber-400">{bonusPoints.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 p-2 rounded-xl text-center border border-white/5">
          <p className="text-[9px] text-gray-500 uppercase mb-1">Season</p>
          <p className="text-sm font-black text-blue-400">{seasonPoints.toLocaleString()}</p>
        </div>
      </div>

      {/* Streaks */}
      <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="text-center">
          <p className="text-[8px] text-gray-400 uppercase mb-1">Current</p>
          <p className="text-xs font-bold text-white">{currentStreak} <span className="text-orange-500">🔥</span></p>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <div className="text-center">
          <p className="text-[8px] text-gray-400 uppercase mb-1">Daily</p>
          <p className="text-xs font-bold text-white">{dailyStreak} Days</p>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <div className="text-center">
          <p className="text-[8px] text-gray-400 uppercase mb-1">Weekly</p>
          <p className="text-xs font-bold text-white">{weeklyStreak} Wks</p>
        </div>
      </div>
      
      {/* Julius Mascot / Interaction Anchor */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl animate-pulse -z-10"></div>
    </motion.div>
  );
};

export default JuliusPointsHUD;