"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarLobbyCanvasProps {
  is3DReady?: boolean;
  roomName?: string;
}

/**
 * AvatarLobbyCanvas: The foundational shell for the 3D Avatar integration.
 * Handles compact, expanded, and fullscreen views.
 */
export default function AvatarLobbyCanvas({ is3DReady = false, roomName = "TMI Lobby" }: AvatarLobbyCanvasProps) {
  const [mode, setMode] = useState<"compact" | "expanded" | "fullscreen">("compact");

  return (
    <div 
      className={`relative w-full transition-all duration-500 ease-in-out border border-white/10 rounded-xl overflow-hidden bg-[#050510] ${
        mode === "compact" ? "h-64" : mode === "expanded" ? "h-96" : "fixed inset-0 z-50 h-screen rounded-none"
      }`}
    >
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-[10px] font-black tracking-widest text-[#00FFFF] uppercase">
          {roomName} {is3DReady && "· 3D MODE"}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMode(mode === "compact" ? "expanded" : "compact")}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-white/70 tracking-wider transition-colors"
          >
            {mode === "compact" ? "EXPAND" : "COMPACT"}
          </button>
          <button 
            onClick={() => setMode(mode === "fullscreen" ? "compact" : "fullscreen")}
            className="px-3 py-1 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 border border-[#00FFFF]/30 rounded text-[9px] font-bold text-[#00FFFF] tracking-wider transition-colors"
          >
            {mode === "fullscreen" ? "EXIT FULLSCREEN" : "FULLSCREEN"}
          </button>
        </div>
      </div>

      {/* Canvas Mount Point */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#050510] to-[#000]">
        {is3DReady ? (
          <div className="text-white/30 text-xs font-mono">Mount WebGL/Three.js Here</div>
        ) : (
          <div className="flex flex-col items-center">
            {/* 2D Placeholder / Bobblehead Scale Reference */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-white/5 border border-dashed border-white/20 rounded-full flex items-center justify-center text-4xl"
            >
              👤
            </motion.div>
            <div className="mt-4 text-[10px] text-white/40 font-mono tracking-widest uppercase">Awaiting 3D Assets</div>
          </div>
        )}
      </div>
    </div>
  );
}