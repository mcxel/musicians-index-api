"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LiveVibeMeterProps {
  completionRate: number; // 0 to 100
  isNewFanSpawned: boolean;
}

export function LiveVibeMeter({ completionRate, isNewFanSpawned }: LiveVibeMeterProps) {
  const isOnFire = completionRate >= 80;

  return (
    <div className="absolute left-6 top-1/4 w-12 h-96 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex flex-col justify-end p-1 overflow-hidden z-50 shadow-2xl">
      
      {/* The Vibe Fill */}
      <motion.div
        initial={{ height: "0%" }}
        animate={{ height: `${completionRate}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`w-full rounded-full relative ${
          isOnFire 
            ? "bg-gradient-to-t from-orange-500 via-red-500 to-yellow-400 shadow-[0_0_30px_rgba(239,68,68,0.8)]" 
            : "bg-gradient-to-t from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        }`}
      >
        {/* Fire Particle Overlay when heat is high */}
        {isOnFire && (
          <motion.div
            animate={{ y: [0, -20], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 blur-[10px] rounded-full"
          />
        )}
      </motion.div>

      {/* Kinetic Fan Pop Animation (Starburst) */}
      {isNewFanSpawned && (
        <motion.div
          initial={{ scale: 0, opacity: 1, rotate: -45 }}
          animate={{ scale: [0, 1.5, 1], opacity: [1, 1, 0], rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            👑
          </div>
        </motion.div>
      )}

      {/* Metric Label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-mono text-[10px] font-black z-10 drop-shadow-md">
        {Math.round(completionRate)}%
      </div>
      
    </div>
  );
}