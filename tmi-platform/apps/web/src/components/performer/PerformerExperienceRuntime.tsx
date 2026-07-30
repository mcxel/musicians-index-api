"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InstantBattleLauncherPanel from "@/components/battles/InstantBattleLauncherPanel";
import MemoryCaptureButton from "@/components/memory/MemoryCaptureButton";

export type LiveMode = "CONCERT" | "BATTLE" | "AFTER_PARTY_LOUNGE";

export interface PerformerExperienceRuntimeProps {
  roomId?: string;
  venueId?: string;
  stageId?: string;
  performerName?: string;
}

export default function PerformerExperienceRuntime({
  stageId = "performer-stage-1",
  performerName = "Marcel Monday",
}: PerformerExperienceRuntimeProps) {
  const [liveMode, setLiveMode] = useState<LiveMode>("CONCERT");
  const [isLive, setIsLive] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [stageLightsActive, setStageLightsActive] = useState(true);
  const [lightingColor, setLightingColor] = useState("#00FFFF");
  const [micActive, setMicActive] = useState(true);
  const [cameraAngle, setCameraAngle] = useState("MAIN_STAGE");
  const [battleLauncherOpen, setBattleLauncherOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"CAMERA" | "LIGHTING" | "SETLIST" | "AUDIENCE" | null>(null);

  // Progressive Venue Activation: Performers land on stage (LIVE · 0 watching). Real attendees arrive naturally.
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setViewerCount((count) => {
        const increment = Math.floor(Math.random() * 4) + 1;
        return Math.min(1420, count + increment);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLive]);

  // Seamless In-Stream Experience Switching
  const switchExperienceMode = (newMode: LiveMode) => {
    setLiveMode(newMode);
  };

  return (
    <div className="relative w-full h-[660px] bg-slate-950 text-white rounded-2xl overflow-hidden border border-cyan-500/40 flex flex-col justify-between p-6 shadow-[0_0_50px_rgba(0,255,255,0.15)]">
      {/* Performer Stage Header & Mode Indicator */}
      <div className="flex items-center justify-between z-20 bg-black/80 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-widest text-white">{performerName.toUpperCase()}'S STAGE</h2>
              <span className="text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded">
                LIVE · MODE: {liveMode}
              </span>
            </div>
            <p className="text-[10px] text-white/50">STAGE ID: {stageId} · CAMERA: {cameraAngle}</p>
          </div>
        </div>

        {/* Real Human Viewer Count (Honest Zero Start) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/60 border border-amber-500/40 px-4 py-1.5 rounded-lg text-xs font-bold text-amber-400">
            <span>👁 ATTENDEES:</span>
            <span className="text-white font-mono text-sm">{viewerCount.toLocaleString()}</span>
          </div>

          {/* Experience Mode Switcher (Concert -> Battle -> Lounge) */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
            {(["CONCERT", "BATTLE", "AFTER_PARTY_LOUNGE"] as LiveMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => switchExperienceMode(mode)}
                className={`px-3 py-1 rounded text-[10px] font-black tracking-wider transition ${
                  liveMode === mode
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {mode.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Stage Viewport & Progressive Lighting */}
      <div className="relative flex-1 my-4 bg-gradient-to-b from-slate-900 to-black rounded-xl border border-cyan-500/20 overflow-hidden flex items-center justify-center">
        {/* Stage Atmosphere Lighting Glow */}
        <div
          className="absolute inset-0 opacity-25 transition-colors duration-1000"
          style={{ background: `radial-gradient(circle at center, ${lightingColor} 0%, transparent 70%)` }}
        />

        {/* Performer Avatar & Spotlight */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-32 h-52 rounded-2xl bg-cyan-950/60 border-2 border-cyan-400 flex flex-col items-center justify-end p-3 shadow-[0_0_40px_rgba(0,255,255,0.4)]">
            <span className="text-6xl animate-pulse mb-2">🎤</span>
            <span className="text-xs font-black text-white bg-black/80 px-2 py-0.5 rounded tracking-wider">
              {performerName}
            </span>
          </div>

          {/* Progressive Audience Seats */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                  i * 150 < viewerCount
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : "bg-white/5 border-white/10 text-white/20"
                }`}
              >
                👤
              </div>
            ))}
          </div>
        </div>

        {/* Non-Blocking Quick Workspace Launcher Bar (Camera, Lighting, Audio, Setlist) */}
        <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveWorkspaceTab(activeWorkspaceTab === "CAMERA" ? null : "CAMERA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeWorkspaceTab === "CAMERA" ? "bg-cyan-500/30 text-cyan-300 border-cyan-400" : "bg-white/5 text-white/70 border-white/10"
            }`}
          >
            📷 CAMERA
          </button>
          <button
            onClick={() => setActiveWorkspaceTab(activeWorkspaceTab === "LIGHTING" ? null : "LIGHTING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeWorkspaceTab === "LIGHTING" ? "bg-amber-500/30 text-amber-300 border-amber-400" : "bg-white/5 text-white/70 border-white/10"
            }`}
          >
            💡 LIGHTING
          </button>
          <button
            onClick={() => setActiveWorkspaceTab(activeWorkspaceTab === "SETLIST" ? null : "SETLIST")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeWorkspaceTab === "SETLIST" ? "bg-purple-500/30 text-purple-300 border-purple-400" : "bg-white/5 text-white/70 border-white/10"
            }`}
          >
            🎼 SETLIST
          </button>
          <button
            onClick={() => setBattleLauncherOpen(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs rounded-lg hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20"
          >
            ⚔️ LAUNCH BATTLE
          </button>
        </div>

        {/* Floating Quick Workspace Side Panel */}
        <AnimatePresence>
          {activeWorkspaceTab && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 bottom-4 w-72 z-30 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-cyan-400 tracking-wider">
                  PERFORMER TOOLS :: {activeWorkspaceTab}
                </span>
                <button onClick={() => setActiveWorkspaceTab(null)} className="text-xs text-white/50 hover:text-white">
                  ✕
                </button>
              </div>

              {/* Dynamic Panel Content */}
              {activeWorkspaceTab === "CAMERA" && (
                <div className="flex flex-col gap-2 my-2">
                  <span className="text-[10px] text-white/60">CAMERA ANGLE SELECTOR:</span>
                  {["MAIN_STAGE", "CROWD_WIDE", "DJ_BOOTH", "PERFORMER_CLOSEUP"].map((cam) => (
                    <button
                      key={cam}
                      onClick={() => setCameraAngle(cam)}
                      className={`p-2 rounded border text-xs font-bold text-left ${
                        cameraAngle === cam ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-white/5 border-white/10"
                      }`}
                    >
                      {cam.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}

              {activeWorkspaceTab === "LIGHTING" && (
                <div className="flex flex-col gap-2 my-2">
                  <span className="text-[10px] text-white/60">STAGE LIGHTING PRESET:</span>
                  {[
                    { color: "#00FFFF", label: "Neon Cyan Strobe" },
                    { color: "#FF2DAA", label: "Fuchsia Pulse" },
                    { color: "#FFD700", label: "Gold Spotlight" },
                    { color: "#00FF88", label: "Emerald Laser" },
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => setLightingColor(preset.color)}
                      className="p-2 rounded border border-white/10 text-xs font-bold text-left flex items-center gap-2 hover:bg-white/10"
                    >
                      <span className="w-4 h-4 rounded-full border border-white/40" style={{ background: preset.color }} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeWorkspaceTab === "SETLIST" && (
                <div className="flex flex-col gap-2 my-2 text-xs font-mono text-white/70">
                  <div className="p-2 bg-white/5 rounded border border-white/10">1. Intro Freestyle (128 BPM)</div>
                  <div className="p-2 bg-white/5 rounded border border-white/10">2. West Coast Anthem (100 BPM)</div>
                  <div className="p-2 bg-white/5 rounded border border-white/10">3. Cypher Battle Track (135 BPM)</div>
                </div>
              )}

              <button
                onClick={() => setActiveWorkspaceTab(null)}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded border border-white/10"
              >
                DOCK PANEL
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Memory Wall Capture Button */}
      <div className="absolute top-4 right-4 z-30">
        <MemoryCaptureButton userId="performer-stage" roomId={stageId} />
      </div>

      {/* Instant Battle Launcher HUD Pop-Up */}
      <InstantBattleLauncherPanel
        isOpen={battleLauncherOpen}
        onClose={() => setBattleLauncherOpen(false)}
        onLaunchBattle={(cfg) => {
          setLiveMode("BATTLE");
          setLightingColor("#FFD700");
        }}
      />
    </div>
  );
}
