"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StickyStageProps {
  children?: React.ReactNode;
  activePerformer?: string;
  isLive?: boolean;
  accentColor?: string;
}

/**
 * StickyStage: The master video/stage container.
 * Pins to the top of the viewport.
 * Includes CRT frame, VU meter, and fallback portrait.
 */
export default function StickyStage({ 
  children, 
  activePerformer, 
  isLive = true,
  accentColor = "#FF2DAA"
}: StickyStageProps) {
  const [eqLevels, setEqLevels] = useState([20, 60, 40, 80, 50, 90, 30, 70]);

  // Simulate VU meter activity
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setEqLevels(levels => levels.map(() => Math.floor(Math.random() * 80) + 20));
    }, 150);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="sticky top-0 z-50 w-full bg-[#050510]/95 border-b border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      {/* TMI Glass / CRT Frame Container */}
      <div className="relative aspect-video max-h-[40vh] w-full overflow-hidden bg-black/90 flex items-center justify-center border-b-2" style={{ borderBottomColor: accentColor }}>
        
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)" }} />

        {/* Video Surface / Children / Fallback */}
        <div className="absolute inset-0 z-0">
          {children || (
            <div className="flex flex-col h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black">
              {/* Fallback Motion Portrait */}
              <motion.div animate={{ scale: isLive ? [1, 1.05, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "4rem", filter: `drop-shadow(0 0 15px ${accentColor})` }}>
                👤
              </motion.div>
              <div className="mt-4 text-white/40 text-xs font-mono tracking-widest uppercase border border-dashed border-white/10 px-4 py-2">
                {isLive ? "LIVE BROADCAST ACTIVE" : "STAGE STANDBY"}
              </div>
            </div>
          )}
        </div>

        {/* Live Indicator Overlay */}
        {isLive && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-md border border-white/10 backdrop-blur-md shadow-lg">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2020", boxShadow: "0 0 10px #FF2020" }} />
            <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">LIVE</span>
          </div>
        )}

        {/* VU Meter Strip & Performer Plate */}
        {activePerformer && (
          <div className="absolute bottom-4 left-4 z-30 flex items-end gap-4">
            <div className="bg-black/70 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
              <h2 className="text-sm md:text-base font-black text-white drop-shadow-lg uppercase tracking-wider" style={{ color: accentColor }}>{activePerformer}</h2>
            </div>
            {/* VU Meter Strip */}
            <div className="hidden sm:flex items-end gap-[2px] h-8 bg-black/50 p-2 rounded-md backdrop-blur-sm border border-white/5">
              {eqLevels.map((level, idx) => (
                <div key={idx} style={{ width: 4, height: `${level}%`, backgroundColor: accentColor, transition: "height 0.15s ease", borderRadius: 1 }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}