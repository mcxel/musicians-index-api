"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LobbyAvatar {
  id: string;
  name: string;
  emoji: string;
  color: string;
  role: "fan" | "vip" | "artist" | "performer" | "npc";
  seat?: string;
  isLive?: boolean;
  tier?: "DIAMOND" | "GOLD" | "SILVER" | "FREE";
}

interface AvatarLobbyCanvasProps {
  is3DReady?: boolean;
  roomName?: string;
  avatars?: LobbyAvatar[];
  accentColor?: string;
  bpm?: number;
}

const TIER_GLOW: Record<string, string> = {
  DIAMOND: "#00FFFF",
  GOLD:    "#FFD700",
  SILVER:  "#C0C0C0",
  FREE:    "#AA2DFF",
};

const ROLE_EMOJI: Record<string, string> = {
  fan:       "🎧",
  vip:       "💎",
  artist:    "🎨",
  performer: "🎤",
  npc:       "🎵",
};

const SEED_CROWD: LobbyAvatar[] = [
  { id: "s1",  name: "Skywave",  emoji: "🎧", color: "#00FFFF", role: "fan",       seat: "G-R12", tier: "SILVER"  },
  { id: "s2",  name: "VenusRhym",emoji: "💎", color: "#FFD700", role: "vip",       seat: "VIP-2",  tier: "DIAMOND" },
  { id: "s3",  name: "BeatLvr",  emoji: "🔥", color: "#FF2DAA", role: "fan",       seat: "G-R8",   tier: "FREE"   },
  { id: "s4",  name: "NovaMix",  emoji: "🎤", color: "#AA2DFF", role: "performer", seat: "F-R1",   tier: "GOLD"   },
  { id: "s5",  name: "EchoStar", emoji: "⚡", color: "#00FF88", role: "artist",    seat: "F-R3",   tier: "GOLD"   },
  { id: "s6",  name: "CrownKng", emoji: "👑", color: "#FFD700", role: "vip",       seat: "VIP-1",  tier: "DIAMOND" },
  { id: "s7",  name: "RhymeXL",  emoji: "🎵", color: "#FF6B35", role: "fan",       seat: "G-R20",  tier: "FREE"   },
  { id: "s8",  name: "ArcLight", emoji: "💫", color: "#00FFFF", role: "fan",       seat: "G-R15",  tier: "SILVER"  },
];

export default function AvatarLobbyCanvas({
  is3DReady: _is3DReady = false,
  roomName = "TMI Lobby",
  avatars,
  accentColor = "#00FFFF",
  bpm = 96,
}: AvatarLobbyCanvasProps) {
  const [mode, setMode] = useState<"compact" | "expanded" | "fullscreen">("expanded");
  const [beat, setBeat] = useState(false);
  const crowd = avatars ?? SEED_CROWD;
  const liveCount = crowd.filter(a => a.isLive).length;

  // BPM beat pulse
  useEffect(() => {
    const ms = (60 / bpm) * 1000;
    const id = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 120);
    }, ms);
    return () => clearInterval(id);
  }, [bpm]);

  return (
    <div
      className={`relative w-full transition-all duration-500 ease-in-out border overflow-hidden bg-[#050510] ${
        mode === "compact"
          ? "h-64 rounded-xl border-white/10"
          : mode === "expanded"
          ? "h-[500px] rounded-xl border-white/10"
          : "fixed inset-0 z-[60] h-screen rounded-none border-transparent"
      }`}
      style={{ borderColor: beat ? `${accentColor}55` : undefined }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF88]" style={{ boxShadow: "0 0 6px #00FF88" }} />
          <span className="text-[10px] font-black tracking-widest text-[#00FFFF] uppercase">
            {roomName} · {crowd.length} PRESENT
            {liveCount > 0 && <span className="ml-2 text-[#FF2DAA]">· {liveCount} LIVE</span>}
          </span>
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
            {mode === "fullscreen" ? "EXIT" : "FULLSCREEN"}
          </button>
        </div>
      </div>

      {/* Scene */}
      <div className="absolute inset-0 z-0 flex items-end justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#050510] to-[#000]">

        {/* Perspective floor grid */}
        <div
          className="absolute bottom-0 w-full h-[42%] border-t border-[#00FFFF]/20"
          style={{
            background: "linear-gradient(0deg, rgba(0,255,255,0.06) 0%, transparent 100%)",
            transform: "perspective(500px) rotateX(60deg)",
            transformOrigin: "bottom",
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(0,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.18) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Stage back wall glow */}
        <div
          className="absolute top-12 left-[10%] right-[10%] h-[30%] rounded-lg"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${accentColor}18 0%, transparent 70%)`,
            border: `1px solid ${accentColor}22`,
          }}
        />

        {/* Avatar crowd row */}
        <div className="relative z-10 flex gap-3 items-end pb-8 px-4 flex-wrap justify-center" style={{ maxWidth: "100%" }}>
          {crowd.map((av, i) => {
            const glowColor = TIER_GLOW[av.tier ?? "FREE"] ?? accentColor;
            const delay = i * 0.18;
            return (
              <motion.div
                key={av.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: beat ? -4 : 0, scale: av.isLive ? (beat ? 1.06 : 1) : 1 }}
                transition={{ duration: 0.35, delay: delay % 2 }}
                className="flex flex-col items-center cursor-pointer group"
                title={`${av.name}${av.seat ? ` · ${av.seat}` : ""}${av.isLive ? " · LIVE" : ""}`}
              >
                {/* Avatar bubble */}
                <div
                  className="rounded-full flex items-center justify-center relative"
                  style={{
                    width: av.role === "performer" || av.role === "artist" ? 56 : av.tier === "DIAMOND" || av.tier === "GOLD" ? 48 : 40,
                    height: av.role === "performer" || av.role === "artist" ? 56 : av.tier === "DIAMOND" || av.tier === "GOLD" ? 48 : 40,
                    background: `radial-gradient(circle, ${av.color}22 0%, ${av.color}08 100%)`,
                    border: `1.5px solid ${av.color}${av.isLive ? "CC" : "44"}`,
                    boxShadow: av.isLive || av.tier === "DIAMOND"
                      ? `0 0 14px ${glowColor}66, 0 0 28px ${glowColor}33`
                      : `0 0 6px ${av.color}33`,
                    fontSize: av.role === "performer" ? 26 : av.tier === "DIAMOND" ? 22 : 18,
                  }}
                >
                  {av.emoji}
                  {/* Live indicator */}
                  {av.isLive && (
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF2DAA]"
                      style={{ boxShadow: "0 0 6px #FF2DAA" }}
                    />
                  )}
                  {/* Diamond crown */}
                  {av.tier === "DIAMOND" && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">👑</div>
                  )}
                </div>

                {/* Name tag */}
                <div
                  className="mt-1 px-1.5 py-0.5 rounded text-center"
                  style={{
                    fontSize: 7,
                    fontWeight: 800,
                    color: av.color,
                    background: "rgba(0,0,0,0.7)",
                    border: `1px solid ${av.color}22`,
                    letterSpacing: "0.05em",
                    maxWidth: 52,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {av.name}
                </div>

                {/* Seat label */}
                {av.seat && mode !== "compact" && (
                  <div className="text-[6px] text-white/25 mt-0.5">{av.seat}</div>
                )}

                {/* Role badge */}
                <div className="text-[8px] mt-0.5">{ROLE_EMOJI[av.role]}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Spotlight beam (performer) */}
        {crowd.some(a => a.isLive) && (
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 60 / bpm, repeat: Infinity }}
            className="absolute inset-x-0 top-12 bottom-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 30% 50% at 50% 10%, ${accentColor}22 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* BPM beat flash */}
      <AnimatePresence>
        {beat && (
          <motion.div
            key="beat-flash"
            initial={{ opacity: 0.12 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor}22, transparent 60%)` }}
          />
        )}
      </AnimatePresence>

      {/* Footer stat bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-between items-center px-3 py-1.5"
        style={{ background: "rgba(5,5,16,0.85)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[8px] text-white/40 font-mono">{bpm} BPM · {crowd.length} AVATARS</span>
        <span className="text-[8px] font-bold" style={{ color: accentColor }}>LOBBY ACTIVE ●</span>
      </div>
    </div>
  );
}
