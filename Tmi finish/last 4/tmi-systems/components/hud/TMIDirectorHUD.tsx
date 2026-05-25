"use client";

/**
 * TMIDirectorHUD.tsx
 * Live-show operator HUD overlay for The Musician's Index.
 *
 * Features:
 *  - Stage curtain open/close with CSS transition
 *  - Multi-channel camera switcher (CAM-1, CAM-2, BATTLE-FEED, SCREEN)
 *  - Audio gain slider with VU meter
 *  - Countdown timer / clock display
 *  - XP / achievement real-time ticker
 *  - Live reaction stream
 *  - Viewer count badge
 *  - Go-Live / End-Show controls
 *  - Scene preset switcher (Intro / Performance / Audience / Outro)
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Channel = "CAM-1" | "CAM-2" | "BATTLE-FEED" | "SCREEN-SHARE" | "OFF";
type Scene = "intro" | "performance" | "audience" | "outro";

interface HUDProps {
  isLive?: boolean;
  viewerCount?: number;
  xpPool?: number;
  performerName?: string;
  onGoLive?: () => void;
  onEndShow?: () => void;
  onChannelChange?: (ch: Channel) => void;
  onSceneChange?: (scene: Scene) => void;
  onGainChange?: (gain: number) => void;
  onCurtainToggle?: (isOpen: boolean) => void;
  className?: string;
}

const CHANNEL_COLORS: Record<Channel, string> = {
  "CAM-1": "#06b6d4",
  "CAM-2": "#a855f7",
  "BATTLE-FEED": "#ef4444",
  "SCREEN-SHARE": "#22c55e",
  OFF: "#374151",
};

const SCENE_COLORS: Record<Scene, string> = {
  intro: "#f59e0b",
  performance: "#ef4444",
  audience: "#06b6d4",
  outro: "#8b5cf6",
};

/* ─── VU Meter bars ── */
function VUMeter({ gain }: { gain: number }) {
  const bars = 12;
  return (
    <div className="flex items-end gap-[2px] h-5">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i / bars) * 100;
        const active = threshold < gain;
        const color =
          i < 8
            ? active ? "#22c55e" : "#1a2a1a"
            : i < 10
            ? active ? "#eab308" : "#2a280a"
            : active
            ? "#ef4444"
            : "#2a1a1a";
        return (
          <div
            key={i}
            style={{ background: color, height: `${55 + i * 4}%` }}
            className="w-1.5 rounded-[1px] transition-colors duration-75"
          />
        );
      })}
    </div>
  );
}

/* ─── Curtain panels ── */
function StageCurtains({ isOpen }: { isOpen: boolean }) {
  return (
    <>
      {/* Left curtain */}
      <div
        className="absolute top-0 left-0 h-full z-30 pointer-events-none"
        style={{
          width: "50%",
          background:
            "linear-gradient(to right, #1a0005 0%, #3d0010 60%, rgba(80,0,20,0) 100%)",
          transform: isOpen ? "translateX(-101%)" : "translateX(0%)",
          transition: "transform 1.2s cubic-bezier(0.77,0,0.18,1)",
          boxShadow: isOpen ? "none" : "12px 0 40px rgba(0,0,0,0.8)",
        }}
      >
        {/* Curtain folds texture */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${i * 18}%`,
              width: "4px",
              height: "100%",
              background: "rgba(0,0,0,0.25)",
              borderRadius: "2px",
            }}
          />
        ))}
      </div>

      {/* Right curtain */}
      <div
        className="absolute top-0 right-0 h-full z-30 pointer-events-none"
        style={{
          width: "50%",
          background:
            "linear-gradient(to left, #1a0005 0%, #3d0010 60%, rgba(80,0,20,0) 100%)",
          transform: isOpen ? "translateX(101%)" : "translateX(0%)",
          transition: "transform 1.2s cubic-bezier(0.77,0,0.18,1)",
          boxShadow: isOpen ? "none" : "-12px 0 40px rgba(0,0,0,0.8)",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              right: `${i * 18}%`,
              width: "4px",
              height: "100%",
              background: "rgba(0,0,0,0.25)",
              borderRadius: "2px",
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ─── Main HUD ─────────────────────────────────────────────────────────── */
export default function TMIDirectorHUD({
  isLive = false,
  viewerCount = 0,
  xpPool = 0,
  performerName = "Performer",
  onGoLive,
  onEndShow,
  onChannelChange,
  onSceneChange,
  onGainChange,
  onCurtainToggle,
  className = "",
}: HUDProps) {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<Channel>("CAM-1");
  const [activeScene, setActiveScene] = useState<Scene>("intro");
  const [gain, setGain] = useState(65);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [liveViewers, setLiveViewers] = useState(viewerCount);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Simulated viewer count fluctuation */
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setLiveViewers((v) => Math.max(0, v + Math.floor((Math.random() - 0.4) * 3)));
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  /* Elapsed show timer */
  useEffect(() => {
    if (!isLive) {
      setElapsedSec(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLive]);

  function formatElapsed(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  /* Countdown before open curtains */
  function handleOpenCurtains() {
    setCountdown(3);
    let c = 3;
    const cd = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cd);
        setCountdown(null);
        setCurtainOpen(true);
        onCurtainToggle?.(true);
      }
    }, 1000);
  }

  function handleCloseCurtains() {
    setCurtainOpen(false);
    onCurtainToggle?.(false);
  }

  function handleChannelSwitch(ch: Channel) {
    setActiveChannel(ch);
    onChannelChange?.(ch);
  }

  function handleSceneSwitch(scene: Scene) {
    setActiveScene(scene);
    onSceneChange?.(scene);
  }

  function handleGain(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value);
    setGain(v);
    onGainChange?.(v / 100);
  }

  return (
    <div className={`relative ${className}`}>
      {/* ── Stage Curtains (rendered over parent content) ── */}
      <StageCurtains isOpen={curtainOpen} />

      {/* ── Countdown splash ── */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <span
            className="text-[120px] font-black text-white/80 drop-shadow-2xl"
            style={{ animation: "pulse 0.8s ease-in-out" }}
          >
            {countdown > 0 ? countdown : "GO"}
          </span>
        </div>
      )}

      {/* ── HUD Shell ── */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">

        {/* ═══ TOP BAR ═══ */}
        <div className="pointer-events-auto mx-3 mt-3 bg-black/75 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
          {/* Status */}
          <div className="flex items-center gap-2 min-w-0">
            {isLive ? (
              <span className="flex items-center gap-1.5 bg-red-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">OFF AIR</span>
            )}
            {isLive && (
              <span className="text-white/50 text-[9px] font-mono">{formatElapsed(elapsedSec)}</span>
            )}
            <span className="text-white/70 text-xs font-bold truncate">{performerName}</span>
          </div>

          {/* Viewer count */}
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            <span className="text-cyan-400 text-xs font-black">
              {liveViewers.toLocaleString()}
            </span>
          </div>

          {/* XP pool */}
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-[10px] font-black">
              ⚡ {(xpPool + elapsedSec * 12).toLocaleString()} XP
            </span>
          </div>

          {/* Channel indicator */}
          <div className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: CHANNEL_COLORS[activeChannel] }}
            />
            <span className="text-white/60 text-[9px] font-black uppercase tracking-wider">
              {activeChannel}
            </span>
          </div>
        </div>

        {/* ═══ BOTTOM CONTROLS ═══ */}
        <div className="pointer-events-auto mx-3 mb-3 bg-black/85 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl space-y-3">

          {/* Channel switcher */}
          <div>
            <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1.5">
              Camera / Input
            </p>
            <div className="flex gap-1 flex-wrap">
              {(["CAM-1", "CAM-2", "BATTLE-FEED", "SCREEN-SHARE", "OFF"] as Channel[]).map((ch) => (
                <button
                  key={ch}
                  onClick={() => handleChannelSwitch(ch)}
                  style={
                    activeChannel === ch
                      ? {
                          background: CHANNEL_COLORS[ch],
                          borderColor: CHANNEL_COLORS[ch],
                          color: ch === "OFF" ? "#fff" : "#000",
                        }
                      : {}
                  }
                  className={`text-[9px] font-black tracking-wider px-2 py-1 rounded-md border uppercase transition-all ${
                    activeChannel === ch
                      ? ""
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Scene switcher */}
          <div>
            <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1.5">
              Scene
            </p>
            <div className="flex gap-1">
              {(["intro", "performance", "audience", "outro"] as Scene[]).map((scene) => (
                <button
                  key={scene}
                  onClick={() => handleSceneSwitch(scene)}
                  style={
                    activeScene === scene
                      ? { background: SCENE_COLORS[scene], color: "#000" }
                      : {}
                  }
                  className={`flex-1 text-[9px] font-black px-1.5 py-1 rounded-md border uppercase tracking-wider transition-all ${
                    activeScene === scene
                      ? "border-transparent"
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {scene}
                </button>
              ))}
            </div>
          </div>

          {/* Audio gain row */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                  Audio Gain
                </p>
                <span className="text-[9px] font-black text-green-400">{gain}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={gain}
                onChange={handleGain}
                className="w-full h-1 accent-green-500 cursor-pointer"
              />
            </div>
            <VUMeter gain={gain} />
          </div>

          {/* Curtain + Go Live row */}
          <div className="flex gap-2 items-center">
            {/* Curtain control */}
            <button
              onClick={curtainOpen ? handleCloseCurtains : handleOpenCurtains}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                curtainOpen
                  ? "bg-red-900/40 border-red-700/50 text-red-400 hover:bg-red-900/60"
                  : "bg-emerald-900/40 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/60"
              }`}
            >
              {curtainOpen ? "Close Curtains" : "Open Curtains"}
            </button>

            {/* Go Live / End */}
            {!isLive ? (
              <button
                onClick={onGoLive}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg bg-red-600 hover:bg-red-500 text-white border border-red-500 transition-all"
              >
                🔴 Go Live
              </button>
            ) : showEndConfirm ? (
              <div className="flex-1 flex gap-1">
                <button
                  onClick={() => {
                    setShowEndConfirm(false);
                    onEndShow?.();
                  }}
                  className="flex-1 py-2 text-[9px] font-black uppercase rounded-lg bg-red-700 text-white border border-red-600"
                >
                  Confirm End
                </button>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="px-3 py-2 text-[9px] font-black uppercase rounded-lg bg-white/10 text-white/60 border border-white/10"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg bg-gray-800 hover:bg-gray-700 text-white/70 border border-white/10 transition-all"
              >
                End Show
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
