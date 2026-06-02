"use client";

import React from "react";
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
 * Used by: ArenaEventShell.tsx, ProfileLobbyRuntime.tsx
 */
export default function StickyStage({ 
  children, 
  activePerformer, 
  isLive = true,
  accentColor = "#FF2DAA"
}: StickyStageProps) {
  return (
    <div className="sticky top-0 z-50 w-full bg-[#050510]/95 border-b border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="relative aspect-video max-h-[40vh] w-full overflow-hidden bg-black/90 flex items-center justify-center">
        
        {/* Video Surface / Children */}
        <div className="absolute inset-0 z-0">
          {children || (
            <div className="flex h-full w-full items-center justify-center text-white/30 text-xs font-mono tracking-widest border border-dashed border-white/10">
              {isLive ? "LIVE BROADCAST ACTIVE" : "STAGE STANDBY"}
            </div>
          )}
        </div>

        {/* Live Indicator Overlay */}
        {isLive && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-white/10 backdrop-blur-md">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2020", boxShadow: "0 0 10px #FF2020" }} />
            <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">LIVE</span>
          </div>
        )}

        {/* Performer Name Plate */}
        {activePerformer && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/70 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
            <h2 className="text-sm md:text-base font-black text-white drop-shadow-lg uppercase tracking-wider" style={{ color: accentColor }}>{activePerformer}</h2>
          </div>
        )}
      </div>
    </div>
  );
}