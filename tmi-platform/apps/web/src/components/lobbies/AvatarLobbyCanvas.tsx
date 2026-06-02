"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarLobbyCanvasProps {
  is3DReady?: boolean;
  roomName?: string;
}

/**
 * AvatarLobbyCanvas: The foundational shell for the 3D Avatar integration.
 * Handles compact, expanded, and fullscreen views. Designed for large bobbleheads.
 */
export default function AvatarLobbyCanvas({ is3DReady = false, roomName = "TMI Lobby" }: AvatarLobbyCanvasProps) {
  const [mode, setMode] = useState<"compact" | "expanded" | "fullscreen">("expanded");

  return (
    <div 
      className={`relative w-full transition-all duration-500 ease-in-out border border-white/10 overflow-hidden bg-[#050510] ${
        mode === "compact" ? "h-64 rounded-xl" : mode === "expanded" ? "h-[500px] rounded-xl" : "fixed inset-0 z-[60] h-screen rounded-none"
      }`}
    >
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 bg-gradient-to-b from-black/90 to-transparent">
        <div className="text-[10px] font-black tracking-widest text-[#00FFFF] uppercase drop-shadow-md">
          {roomName} {is3DReady && "· 3D ENGINE ACTIVE"}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMode(mode === "compact" ? "expanded" : "compact")}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-white/70 tracking-wider transition-colors"
          >
            {mode === "compact" ? "EXPAND" : "COMPACT"}
          </button>
          <button 
            onClick={() => setMode(mode === "fullscreen" ? "expanded" : "fullscreen")}
            className="px-3 py-1 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 border border-[#00FFFF]/30 rounded text-[9px] font-bold text-[#00FFFF] tracking-wider transition-colors"
          >
            {mode === "fullscreen" ? "EXIT FULLSCREEN" : "FULLSCREEN"}
          </button>
        </div>
      </div>

      {/* Canvas Mount Point */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#050510] to-[#000]">
        
        {/* Floor Grid (Standing Zones / Seats) */}
        <div className="absolute bottom-0 w-full h-[40%] bg-[linear-gradient(0deg,rgba(0,255,255,0.05)_0%,transparent_100%)] border-t border-[#00FFFF]/20" style={{ transform: "perspective(500px) rotateX(60deg)", transformOrigin: "bottom" }}>
          <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(rgba(0,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.2) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        {is3DReady ? (
          <div className="text-white/30 text-xs font-mono relative z-10">
            {/* HOOK: Mount WebGL/Three.js Here for GLB Avatar Rendering */}
            {/* HOOK: Insert Face Scan geometry loader here */}
            {/* HOOK: Trigger emote/dancing animations */}
            [WebGL Rendering Context]
          </div>
        ) : (
          <div className="relative z-10 flex w-full h-full items-end justify-center pb-12">
            {/* 2D Placeholder Fan Clusters (Larger Avatars) */}
            <div className="flex gap-4 items-end">
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white/5 border border-dashed border-white/20 rounded-full flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(255,45,170,0.2)]">👤</div>
                <span className="text-[9px] mt-2 text-white/50 bg-black/50 px-2 py-1 rounded">STANDING</span>
              </motion.div>
              
              <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity }} className="flex flex-col items-center z-10">
                <div className="w-40 h-40 bg-white/10 border border-[#00FFFF]/30 rounded-full flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(0,255,255,0.2)]">😎</div>
                <span className="text-[10px] mt-2 text-[#00FFFF] font-bold bg-black/80 border border-[#00FFFF]/30 px-3 py-1 rounded">VIP SEAT (YOU)</span>
              </motion.div>

              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white/5 border border-dashed border-white/20 rounded-full flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(255,215,0,0.2)]">👤</div>
                <span className="text-[9px] mt-2 text-white/50 bg-black/50 px-2 py-1 rounded">STANDING</span>
              </motion.div>
            </div>
          </div>
        )}

        {/* Overlay Instructions for Pipeline */}
        {!is3DReady && (
          <div className="absolute top-[20%] text-center px-4 w-full">
            <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase bg-black/50 inline-block px-3 py-2 rounded-md backdrop-blur-md">
              Awaiting Ultra-Realistic 3D Asset Injection
            </div>
          </div>
        )}
      </div>
    </div>
  );
}