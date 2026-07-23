"use client";

/**
 * ⚠️ DEV REFERENCE ONLY - NOT MOUNTED ON ANY PRODUCTION ROUTE. ⚠️
 *
 * Every performer, chat message, viewer count, and queue/people list below
 * is hardcoded mock data (leftPerf/rightPerf default to "Young Ace"/
 * "Wavetek" with videoStream always null; "14,280 / 18,500 VIEWERS" is a
 * literal string). There is no getUserMedia/Daily.co call anywhere in this
 * file. It must never be mounted as a room's default render path - doing so
 * would replace real live video/audience with fake data (Rule 20).
 *
 * Its genuinely reusable presentation pieces (VS overlay, HUD, scoreboard,
 * timer, crowd meter, results treatment) were harvested into
 * components/competition/presentation/ and are mounted for real inside
 * components/live/ArenaEventShell.tsx as CompetitionPresentationLayer, a
 * props-driven overlay on top of the real venue/WebRTC runtime.
 *
 * This file is kept only as a design reference / prototype for future work
 * that gives it real participant, chat, and viewer-count data - not as a
 * component to import anywhere.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveBattleTheme, THEMES } from "@/lib/competition/ThemeRegistry";
import TmiVersusBattleArena, { type Performer } from "../battles/TmiVersusBattleArena";
import AudienceScene from "../live/AudienceScene";
import VenueSeatGrid from "./VenueSeatGrid";
import { playSound } from "@/lib/sound/playSound";

interface CompetitionAudienceViewportProps {
  format: "BATTLE" | "CHALLENGE" | "CYPHER";
  roomId: string;
  initialLeft?: Performer;
  initialRight?: Performer;
}

export default function CompetitionAudienceViewport({
  format = "BATTLE",
  roomId,
  initialLeft,
  initialRight,
}: CompetitionAudienceViewportProps) {
  const activeTheme = useActiveBattleTheme("cyber-neon");
  const [perspective, setPerspective] = useState<"broadcast" | "seat" | "venue" | "look">("broadcast");
  const [rightTab, setRightTab] = useState<"chat" | "room" | "people" | "queue">("chat");

  // Mock performers if not provided
  const [leftPerf, setLeftPerf] = useState<Performer>(
    initialLeft || {
      id: "left-perf",
      name: "Young Ace",
      handle: "@youngace",
      videoStream: null,
      score: 1840,
      themeColor: activeTheme.colors.leftFrame,
      isLive: true,
    }
  );

  const [rightPerf, setRightPerf] = useState<Performer>(
    initialRight || {
      id: "right-perf",
      name: "Wavetek",
      handle: "@wavetek",
      videoStream: null,
      score: 1950,
      themeColor: activeTheme.colors.rightFrame,
      isLive: true,
    }
  );

  // Chat message state
  const [messages, setMessages] = useState([
    { user: "Marie_D", text: "Yo, Young Ace is sliding on this round! 🔥" },
    { user: "Jay_Beats", text: "Wavetek's counter is going to be crazy tho" },
    { user: "SambaFlow", text: "TMI Arena looks gorgeous tonight!" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [crowdEnergy, setCrowdEnergy] = useState(65);
  const [activeEmote, setActiveEmote] = useState<string>("");

  // Emote reaction floaters
  const [reactions, setReactions] = useState<Array<{ id: number; char: string; left: number }>>([]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setMessages((prev) => [...prev, { user: "You", text: inputVal.trim() }]);
    setInputVal("");
    // Chatting increases energy
    setCrowdEnergy((energy) => Math.min(100, energy + 1));
  };

  const handleReaction = (char: string) => {
    const id = Date.now() + Math.random();
    setReactions((prev) => [...prev, { id, char, left: 10 + Math.random() * 80 }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);

    // Propagate wave and boost energy
    setActiveEmote(char);
    setCrowdEnergy((energy) => Math.min(100, energy + 4));
    setTimeout(() => {
      setActiveEmote("");
    }, 1000);

    playSound("ui-menu-pack.mp3");
  };
  // Energy decay over time
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setCrowdEnergy((e) => Math.max(30, e - 2));
    }, 4500);
    return () => clearInterval(decayInterval);
  }, []);
  return (
    <div
      style={{
        background: "#020208",
        fontFamily: activeTheme.typography.body,
      }}
      className="relative flex flex-col md:flex-row w-full h-[760px] rounded-3xl border border-white/10 overflow-hidden text-white"
    >
      
      {/* ─── LEFT PANEL: VENUE UTILITIES ─── */}
      <div className="w-full md:w-48 bg-black/60 backdrop-blur-md border-r border-white/10 flex flex-col p-4 gap-2.5 z-20">
        <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-2">
          VENUE UTILITIES
        </div>
        {[
          { label: "🎪 LOBBY", sub: "Lobby Hangout" },
          { label: "👥 FRIENDS", sub: "Manage Crew" },
          { label: "🎒 INVENTORY", sub: "Props & Customizations" },
          { label: "📷 CAMERA", sub: "Capture Moments" },
          { label: "⭐ MEMORIES", sub: "Memory Wall" },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleReaction("✨")}
            className="w-full text-left py-2.5 px-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-xs font-bold tracking-wide"
          >
            <div>{btn.label}</div>
            <div className="text-[8px] text-white/30 font-medium mt-0.5">{btn.sub}</div>
          </button>
        ))}

        {/* Perspective Toggles */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-[9px] font-bold tracking-widest text-white/40 uppercase mb-2">
            PERSPECTIVES
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { id: "broadcast", label: "📺 BROADCAST" },
              { id: "seat", label: "💺 MY SEAT" },
              { id: "venue", label: "🏛️ CINEMATIC" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPerspective(p.id as any);
                  playSound("ui-whoosh-bubbles.mp3");
                }}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] font-bold text-left transition-all ${
                  perspective === p.id
                    ? "bg-gradient-to-r from-[#FF2DAA] to-[#AA2DFF] text-white"
                    : "bg-white/5 hover:bg-white/10 text-white/60"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CENTER VIEWPORT: THE ARENA / BACKDROP ─── */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden justify-between p-4">
        
        {/* Render 3D Audience Seating Backdrop (Level 1 Seat Simulation) */}
        {perspective !== "broadcast" && (
          <div className="absolute inset-0 z-0">
            <AudienceScene
              venue={format === "CYPHER" ? 0 : format === "CHALLENGE" ? 3 : 1}
              view={perspective === "venue" ? "performer" : "fan"}
            />
            {/* Dark wash for legibility */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
          </div>
        )}

        {/* Dynamic Event Masthead */}
        <div className="z-10 flex justify-between items-center bg-black/45 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
          <div className="text-[10px] font-black tracking-widest text-white/70">
            FORMAT: <span style={{ color: activeTheme.colors.leftFrame }}>{format}</span>
          </div>
          <div className="text-[10px] font-bold tracking-wider font-mono text-white/50">
            ROOM_ID: {roomId}
          </div>
        </div>

        {/* Main stage display area */}
        <div className="z-10 my-auto w-full flex items-center justify-center relative">
          
          {/* 1. BROADCAST VIEW: Show Battle HUD or Challenge layout */}
          {perspective === "broadcast" && (
            <div className="w-full flex items-center justify-center">
              {format === "BATTLE" && (
                <div className="w-full max-w-4xl">
                  <TmiVersusBattleArena
                    leftPerformer={leftPerf}
                    rightPerformer={rightPerf}
                    round="Round 2 of 3"
                    onVote={(pid) => {
                      if (pid === leftPerf.id) {
                        setLeftPerf((p) => ({ ...p, score: p.score + 50 }));
                      } else {
                        setRightPerf((p) => ({ ...p, score: p.score + 50 }));
                      }
                      handleReaction("🔥");
                    }}
                  />
                </div>
              )}

              {format === "CHALLENGE" && (
                <div
                  style={{
                    borderColor: activeTheme.colors.leftFrame,
                    background: "rgba(0,0,0,0.8)",
                    boxShadow: `0 0 35px ${activeTheme.colors.glowLeft}`,
                  }}
                  className="w-full max-w-2xl border-2 rounded-3xl p-6 flex flex-col items-center gap-4 text-center backdrop-blur-xl"
                >
                  <div className="text-xs font-black tracking-widest text-yellow-400">
                    ⭐ ACTIVE CHALLENGE OBJECTIVE ⭐
                  </div>
                  <h2 className="text-2xl font-extrabold italic tracking-wide">
                    CYBER-PUNK GUITAR CIPHER
                  </h2>
                  <p className="text-xs text-white/60 max-w-md leading-relaxed">
                    Lay down a 90-second electric guitar solo over the fuchsia retro-wave synth loop. Audience votes on composition difficulty and speed.
                  </p>
                  
                  {/* Progress and timer */}
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 w-72 mx-auto">
                    <div className="flex justify-between text-[10px] font-bold text-white/40">
                      <span>TIME REMAINING</span>
                      <span>PROGRESS</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black font-mono text-cyan-400">0:47</span>
                      <span className="text-sm font-bold text-white/80">65% COMPLETE</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 w-[65%]" />
                    </div>
                  </div>

                  <button
                    onClick={() => handleReaction("🔥")}
                    className="px-8 py-3 bg-white text-black font-extrabold rounded-lg hover:bg-neutral-100 active:scale-95 transition-all text-xs tracking-wider"
                  >
                    SUBMIT ATTEMPT
                  </button>
                </div>
              )}

              {format === "CYPHER" && (
                <div
                  style={{
                    borderColor: activeTheme.colors.rightFrame,
                    background: "rgba(0,0,0,0.8)",
                    boxShadow: `0 0 35px ${activeTheme.colors.glowRight}`,
                  }}
                  className="w-full max-w-xl border-2 rounded-3xl p-6 flex flex-col items-center text-center backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-black tracking-widest text-green-400">ON THE MIC</span>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-fuchsia-500 shadow-[0_0_20px_rgba(255,45,170,0.4)] flex items-center justify-center text-3xl mb-3 bg-black">
                    🎙️
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Bar God @bargod</h3>
                  <p className="text-xs text-white/50 mb-4">Turn Timer: <span className="font-mono text-fuchsia-400 font-extrabold">1:12</span></p>
                  
                  {/* Rotation Queue list */}
                  <div className="w-full border-t border-white/10 pt-4">
                    <div className="text-[10px] font-bold text-left text-white/40 tracking-wider mb-2">UP NEXT IN ROTATION</div>
                    <div className="flex flex-col gap-2">
                      {[
                        { name: "Marie_D", pos: "#1 in Queue" },
                        { name: "Jay_Beats", pos: "#2 in Queue" },
                        { name: "Young Ace", pos: "#3 in Queue" }
                      ].map((q) => (
                        <div key={q.name} className="flex justify-between items-center bg-white/5 rounded-lg px-3.5 py-2 text-xs">
                          <span className="font-bold">{q.name}</span>
                          <span className="text-[9px] text-white/40 uppercase font-mono">{q.pos}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. MY SEAT VIEW: Render Seating Grid and PiP Stage Monitor */}
          {perspective === "seat" && (
            <div className="w-full flex flex-col items-center gap-4 relative">
              <VenueSeatGrid
                roomId={roomId}
                crowdEnergy={crowdEnergy}
                activeEmote={activeEmote}
              />
              
              {/* Picture-in-Picture float screen */}
              <div className="absolute right-4 bottom-4 w-44 bg-black/90 border border-white/15 rounded-xl p-2 shadow-2xl backdrop-blur-md z-30">
                <div className="text-[8px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-1 tracking-widest uppercase">
                  📺 STAGE PIP SCREEN
                </div>
                <div className="aspect-video bg-zinc-950 rounded border border-white/5 overflow-hidden flex flex-col items-center justify-center text-[7px] text-white/45">
                  <span className="animate-pulse">🔴 WEBRTC TUNNEL</span>
                  <span className="font-bold font-mono mt-0.5">
                    {format === "BATTLE" ? "ACE VS WAVETEK" : "PERFORMANCE"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. VENUE VIEW: Cinematic Stage View */}
          {perspective === "venue" && (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-[360px] aspect-video bg-black/95 border-2 border-cyan-400/80 rounded-2xl p-2 shadow-[0_0_35px_rgba(0,240,255,0.25)] backdrop-blur relative">
                <div className="w-full h-full bg-zinc-950 rounded-lg flex flex-col items-center justify-center text-xs text-white/50 border border-white/5">
                  <span className="text-xl mb-1">🎮</span>
                  <span className="text-[8px] font-bold tracking-widest text-[#00F0FF]">
                    {format === "BATTLE" ? "DUAL FEED CLASH" : "CIPHER STAGE"}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-1 items-center bg-black/80 px-2 py-0.5 rounded border border-white/10 text-[6.5px] font-black text-green-400">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> LIVE STREAM
                </div>
              </div>
              <span className="text-[9px] font-black tracking-widest text-white/40 uppercase font-mono mt-3">
                CINEMATIC AMPLITHEATER PERSPECTIVE
              </span>
            </div>
          )}
        </div>

        {/* Reaction Floaters Container */}
        <div className="absolute inset-x-0 bottom-16 h-48 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {reactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ y: 200, opacity: 0, scale: 0.6 }}
                animate={{ y: 0, opacity: [0, 1, 1, 0], scale: [0.6, 1.2, 1, 0.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                style={{ left: `${r.left}%` }}
                className="absolute text-2xl"
              >
                {r.char}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ─── BOTTOM DECK: REACTIONS & EMOTES ─── */}
        <div className="z-10 w-full flex items-center justify-between gap-3 bg-black/60 backdrop-blur px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex gap-2">
            <button
              onClick={() => handleReaction("💎")}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl text-black font-extrabold text-[11px] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              💸 TIP
            </button>
            <button
              onClick={() => handleReaction("❤️")}
              className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
            >
              ❤️
            </button>
            <button
              onClick={() => handleReaction("👏")}
              className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
            >
              👏
            </button>
            <button
              onClick={() => handleReaction("🔥")}
              className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
            >
              🔥
            </button>
          </div>

          <div className="flex gap-1.5">
            {["🌹", "😂", "🎸", "🕺", "📣", "🎁"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs active:scale-95 transition-all cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ─── RIGHT PANEL: CHAT & Rotations ─── */}
      <div className="w-full md:w-72 bg-black/60 backdrop-blur-md border-l border-white/10 flex flex-col z-20">
        
        {/* Right Panel Tabs */}
        <div className="grid grid-cols-4 border-b border-white/10">
          {(["chat", "room", "people", "queue"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              className={`py-3 text-[10px] font-black uppercase tracking-wider text-center transition-all ${
                rightTab === tab
                  ? "border-b-2 border-fuchsia-500 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
          
          {rightTab === "chat" && (
            <>
              <div className="flex flex-col gap-3.5 flex-1 justify-end pb-4">
                {messages.map((m, i) => (
                  <div key={i} className="text-xs leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="font-extrabold text-cyan-400 block mb-0.5">{m.user}:</span>
                    <span className="text-white/80">{m.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Chat with crowd..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-fuchsia-600 rounded-xl text-xs font-bold hover:bg-fuchsia-500"
                >
                  Send
                </button>
              </form>
            </>
          )}

          {rightTab === "room" && (
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-white/30 block mb-1">STADIUM OCCUPANCY</span>
                <span className="font-bold text-green-400">14,280 / 18,500 VIEWERS</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/30 block mb-1">HOST</span>
                <span className="font-bold text-white">TMI System Bot</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/30 block mb-1">STABILITY FACTOR</span>
                <span className="font-bold text-cyan-400">99.8% ONLINE</span>
              </div>
            </div>
          )}

          {rightTab === "people" && (
            <div className="flex flex-col gap-2.5">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">
                ONLINE PARTICIPANTS
              </div>
              {["Marie_D", "SambaFlow", "Jay_Beats", "Lofi_Girl", "Spectator_01"].map((u) => (
                <div key={u} className="flex items-center gap-2 text-xs bg-white/5 px-3 py-2 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="font-bold">{u}</span>
                </div>
              ))}
            </div>
          )}

          {rightTab === "queue" && (
            <div className="flex flex-col gap-2.5">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">
                CHALLENGER QUEUE
              </div>
              {[
                { name: "Marie_D", status: "Ready" },
                { name: "Jay_Beats", status: "Position 2" },
                { name: "Lofi_Girl", status: "Position 3" },
              ].map((q) => (
                <div key={q.name} className="flex justify-between items-center text-xs bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/5">
                  <span className="font-bold">{q.name}</span>
                  <span className="text-[9px] font-bold font-mono text-fuchsia-400">{q.status}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
