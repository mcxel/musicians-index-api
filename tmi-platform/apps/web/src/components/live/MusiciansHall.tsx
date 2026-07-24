"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/lib/sound/playSound";
import Link from "next/link";

interface FloatingEmote {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

interface ChatMessage {
  id: string;
  name: string;
  text: string;
}

export default function MusiciansHall() {
  // Reaction particle emitter states
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const [tickerMsg, setTickerMsg] = useState("@DJBlend just unlocked the 3x Scratch Champion badge!");

  // Stage light / camera portal mode
  const [activePortal, setActivePortal] = useState<string>("WINNER'S HALL");

  // Dynamic Scene Runtime State
  const [scene, setScene] = useState<any>(null);

  useEffect(() => {
    const fetchScene = () => {
      fetch("/api/competition/scene?roomId=world-dance-party")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.scene) {
            setScene(d.scene);
          }
        })
        .catch(() => {});
    };

    fetchScene();
    const interval = setInterval(fetchScene, 3000);
    return () => clearInterval(interval);
  }, []);

  // Chat stream states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "msg-1", name: "AnonMan", text: "YES! :D" },
    { id: "msg-2", name: "Brandy21", text: "This is so much fun!" },
    { id: "msg-3", name: "GrooveKing", text: "Let's gooo!" },
    { id: "msg-4", name: "MusiQ_Love", text: "Amazing performance 🔥🔥🔥" },
    { id: "msg-5", name: "Beatz4Dayz", text: "Who taking the belt tonight?" },
  ]);

  // Rotates bottom announcement messages
  useEffect(() => {
    const messages = [
      "@DJBlend just unlocked the 3x Scratch Champion badge!",
      "@MiaJay is heating up the stage!",
      "Next Show: DJ Scratch Battle in 06:32",
      "@CharroAce just achieved All-Time Legend status! 👑",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setTickerMsg(messages[idx] || "");
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const triggerReaction = (emoji: string) => {
    playSound("ui-whoosh-bubbles.mp3");
    const id = `emote-${Date.now()}-${Math.random()}`;
    // Random horizontal position near center
    const x = 30 + Math.random() * 40;
    const newEmote: FloatingEmote = { id, emoji, x, y: 70 };
    setFloatingEmotes((prev) => [...prev, newEmote]);

    // Prune particle after 2 seconds
    setTimeout(() => {
      setFloatingEmotes((prev) => prev.filter((e) => e.id !== id));
    }, 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    playSound("ui-whoosh-bubbles.mp3");
    setChatMessages((prev) => [
      ...prev,
      { id: `chat-${Date.now()}`, name: "TMI_FAN#9000", text: chatInput },
    ]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* 1. Live Navigation & Header System */}
      <header className="bg-black/90 border-b border-cyan-500/20 backdrop-blur-md px-6 py-3 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black italic tracking-wider text-cyan-400 font-mono">
            TMI <span className="text-xs font-normal not-italic text-white/50 block tracking-widest text-[9px] uppercase font-sans">MUSICIANS UNIVERSE</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-6 text-[10px] font-bold tracking-widest uppercase text-white/60 font-mono">
            <Link href="/" className="hover:text-cyan-400 transition-colors">HOME</Link>
            <Link href="/rooms/world-dance-party" className="hover:text-cyan-400 transition-colors">BATTLE ARENA</Link>
            <Link href="/rooms/world-dance-party" className="hover:text-cyan-400 transition-colors">WORLD DANCE PARTY</Link>
            <Link href="/rooms/winner-hall" className="text-cyan-400 border-b border-cyan-400 pb-0.5 font-black">WINNER'S HALL</Link>
            <Link href="/magazine" className="hover:text-cyan-400 transition-colors">MAGAZINE</Link>
            <Link href="/shop" className="hover:text-cyan-400 transition-colors">SHOP</Link>
            <Link href="/rooms/vip-lounge" className="hover:text-cyan-400 transition-colors">LOUNGE</Link>
          </nav>
        </div>

        {/* User Status Bar */}
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/80 font-mono">TMI_FAN#9000</span>
            <span className="text-[7.5px] font-black bg-cyan-400 text-black px-1.5 py-0.5 rounded uppercase tracking-wider">VIP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-400 font-mono text-xs">🪙 120,450</span>
          </div>
          <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 relative">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full absolute top-1.5 right-1.5 animate-pulse" />
            🔔
          </button>
          <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5">
            ⚙️
          </button>
        </div>
      </header>

      {/* 2. Main Dashboard Grid Layout */}
      <div className="flex-1 max-w-[1500px] mx-auto w-full p-6 grid grid-cols-12 gap-5 z-20">
        
        {/* LEFT COLUMN: LIVE EVENT HUB */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          
          {/* Live Now Card */}
          <div className="bg-gradient-to-b from-[#14122d] to-[#080816] border border-cyan-500/25 p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden shadow-2xl">
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              <span className="text-[7px] font-black uppercase text-red-500 tracking-widest font-mono">● LIVE</span>
            </div>
            <span className="text-[8px] font-black text-cyan-400 tracking-widest block uppercase font-mono">LIVE NOW</span>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">VOCAL SHOWDOWN</h2>
              <span className="text-[9px] font-bold text-amber-400 tracking-widest block uppercase font-mono">FINALS</span>
            </div>
            <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-2 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-base">
                👨‍🚀
              </div>
              <div>
                <span className="text-[7.5px] text-white/40 block font-mono">HOST</span>
                <span className="text-[9px] font-bold text-white block">DJ Record Ralph</span>
              </div>
              <div className="ml-auto text-right">
                <span className="text-[8px] text-white/40 block font-mono">TIME LEFT</span>
                <span className="text-xs font-black text-cyan-400 font-mono">06:32</span>
              </div>
            </div>
            {/* Equalizer lines visualizer */}
            <div className="flex gap-0.5 items-end justify-center h-8 bg-black/20 border border-white/5 rounded-lg py-1.5">
              {[4, 18, 12, 22, 10, 28, 14, 20, 8, 16, 24, 12, 18, 6, 14].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, h, 4] }}
                  transition={{ repeat: Infinity, duration: 0.6 + i * 0.05, ease: "easeInOut" }}
                  className="w-[3px] bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
                  style={{ height: 4 }}
                />
              ))}
            </div>
          </div>

          {/* Up Next Card */}
          <div className="bg-black/80 border border-white/10 p-4 rounded-2xl flex flex-col gap-3">
            <span className="text-[8px] font-black text-white/40 tracking-widest block uppercase font-mono">UP NEXT</span>
            <div className="space-y-2">
              {[
                { title: "DJ SCRATCH BATTLE", time: "07:15 PM" },
                { title: "BAND CHAMPIONSHIP", time: "08:00 PM" },
                { title: "BEAT FLIP CHALLENGE", time: "08:45 PM" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 p-2 rounded-xl transition-all">
                  <span className="text-[9px] font-bold tracking-wide uppercase">{item.title}</span>
                  <span className="text-[8.5px] font-black text-cyan-400 font-mono bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-400/10">{item.time}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => playSound("ui-whoosh-bubbles.mp3")}
              className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[8.5px] font-black tracking-widest uppercase hover:bg-white/10 transition-colors font-mono"
            >
              VIEW FULL SCHEDULE
            </button>
          </div>

          {/* Top Champions Leaderboard */}
          <div className="bg-black/80 border border-white/10 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-black text-white/40 tracking-widest block uppercase font-mono">TOP CHAMPIONS</span>
              <button className="text-[8px] font-bold text-cyan-400 font-mono tracking-widest hover:underline uppercase">VIEW ALL</button>
            </div>
            <div className="space-y-2">
              {[
                { name: "CHARRO ACE", wins: "4x", emoji: "🤠" },
                { name: "MIA JAY", wins: "3x", emoji: "👩‍🎤" },
                { name: "DJ BLEND", wins: "3x", emoji: "🎧" },
                { name: "LANI FLAME", wins: "2x", emoji: "🔥" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-xl">
                  <span className="text-xs font-black text-white/40 font-mono w-4">{i + 1}</span>
                  <span className="text-base">{c.emoji}</span>
                  <span className="text-[9px] font-bold tracking-wide text-white/90">{c.name}</span>
                  <span className="ml-auto text-[9px] font-black text-amber-400 font-mono flex items-center gap-0.5">👑 {c.wins}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: 3D VENUE VIEW & SPOTLIGHTS */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
          
          {/* 3D Stage Visualizer View */}
          <div 
            className={`relative h-[320px] bg-gradient-to-b from-purple-950/20 via-black/95 to-[#070716] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 transition-all duration-500 ${
              scene?.lightingConfig?.strobe ? "animate-[pulse_0.4s_infinite]" : ""
            }`}
          >
            {/* Camera angle indicator */}
            <div className="absolute top-2 left-2 text-[7px] font-black bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/20 uppercase font-mono tracking-wider z-20">
              🎥 {scene?.cameraPreset || "STAGE-WIDE"}
            </div>

            {/* Spotlights and glow layers driven by SceneRuntime config */}
            <div 
              className="absolute top-0 left-1/4 w-[1px] h-[300px] rotate-[25deg] blur-[3px] pointer-events-none transition-all duration-1000"
              style={{
                background: `linear-gradient(to bottom, ${scene?.lightingConfig?.primaryColorHex || "#00FFFF"}dd, transparent)`,
                opacity: scene?.lightingConfig?.intensity ?? 0.8
              }}
            />
            <div 
              className="absolute top-0 right-1/4 w-[1px] h-[300px] rotate-[-25deg] blur-[3px] pointer-events-none transition-all duration-1000"
              style={{
                background: `linear-gradient(to bottom, ${scene?.lightingConfig?.secondaryColorHex || "#AA2DFF"}dd, transparent)`,
                opacity: scene?.lightingConfig?.intensity ?? 0.8
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-1000" 
              style={{
                background: `radial-gradient(circle at center, ${scene?.lightingConfig?.primaryColorHex || "#00ffff"}0a 0%, transparent 70%)`
              }}
            />

            <div className="text-center z-10">
              <h1 className="text-xs font-black text-white tracking-widest uppercase font-mono">
                {scene?.onscreenText?.title || "MUSICIANS HALL"}
              </h1>
              <span className="text-[7.5px] font-bold text-cyan-300 tracking-wider block uppercase font-mono mt-0.5">
                {scene?.onscreenText?.subtitle || "WHERE LEGENDS PERFORM & CHAMPIONS RISE"}
              </span>
            </div>

            {/* Central Champion Trophy Showcase */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="text-6xl filter drop-shadow-[0_0_20px_rgba(255,215,0,0.55)] cursor-pointer"
                onClick={() => playSound("battle_vs_gong.mp3")}
              >
                🏆
              </motion.span>
              <div className="w-24 h-1.5 bg-cyan-400/30 blur-[2px] rounded-full mt-2" />

              {/* Reactive particle emitter elements */}
              <AnimatePresence>
                {floatingEmotes.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, scale: 0.5, x: `${e.x}%`, y: "70%" }}
                    animate={{ opacity: [0, 1, 1, 0], scale: 1.4, y: "15%" }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="absolute text-3xl pointer-events-none z-30 filter drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]"
                  >
                    {e.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Holographic room link badges */}
              <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1.5 flex-wrap z-30">
                {[
                  { name: "BATTLE ARENA", href: "/rooms/world-dance-party" },
                  { name: "WORLD DANCE PARTY", href: "/rooms/world-dance-party" },
                  { name: "GAME SHOW LOUNGE", href: "/rooms/deal-vs-feud" },
                  { name: "AUDIENCE ROOM", href: "/rooms/winner-hall" },
                ].map((portal) => (
                  <button
                    key={portal.name}
                    onClick={() => {
                      setActivePortal(portal.name);
                      playSound("ui-whoosh-bubbles.mp3");
                    }}
                    className={`text-[6.5px] font-black px-2 py-1 rounded border transition-all font-mono tracking-widest ${
                      activePortal === portal.name
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                        : "bg-black/60 border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    {portal.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience Reaction array */}
            <div className="bg-black/95 border border-cyan-500/25 p-2 rounded-xl flex items-center justify-around z-20 shadow-xl">
              {[
                { label: "👏 CHEER", emoji: "👏" },
                { label: "👋 WAVE", emoji: "👋" },
                { label: "💃 DANCE", emoji: "💃" },
                { label: "❤️ HEART", emoji: "❤️" },
                { label: "🔥 FIRE", emoji: "🔥" },
              ].map((react) => (
                <button
                  key={react.label}
                  onClick={() => triggerReaction(react.emoji)}
                  className="text-[8px] font-black px-3 py-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 text-cyan-300 transition-all font-mono"
                >
                  {react.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action cards row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "LIVE PERFORMANCE", desc: "CATCH THE ACTION", btn: "WATCH", bg: "from-purple-950 to-black border-purple-500/30", color: "bg-fuchsia-600 text-white" },
              { label: "HIGHLIGHTS", desc: "BEST MOMENTS", btn: "PLAY", bg: "from-amber-950/40 to-black border-amber-500/25", color: "bg-amber-500 text-black" },
              { label: "SEND GIFT", desc: "SUPPORT ARTISTS", btn: "SEND", bg: "from-emerald-950/40 to-black border-emerald-500/25", color: "bg-emerald-500 text-black" },
              { label: "SPONSOR", desc: "NEXT SHOW", btn: "SUPPORT", bg: "from-blue-950/40 to-black border-blue-500/25", color: "bg-blue-500 text-white" },
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-b ${item.bg} border p-3 rounded-2xl flex flex-col justify-between h-24 shadow-lg`}>
                <div>
                  <span className="text-[6.5px] font-black text-cyan-400 block tracking-widest uppercase font-mono">{item.label}</span>
                  <span className="text-[8px] font-bold text-white/50 block tracking-wide uppercase mt-0.5">{item.desc}</span>
                </div>
                <button 
                  onClick={() => playSound("ui-whoosh-bubbles.mp3")}
                  className={`w-full py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase ${item.color} font-mono`}
                >
                  {item.btn}
                </button>
              </div>
            ))}
          </div>

          {/* Winner's Hall Spotlight Card & Latest Grid */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Spotlight Card */}
            <div className="col-span-12 md:col-span-5 bg-gradient-to-b from-[#1a1205] to-[#000000] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden h-[180px]">
              <div className="absolute top-2 right-2 text-2xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">🎸</div>
              <div>
                <span className="text-[7.5px] font-black text-amber-500 tracking-widest uppercase block font-mono">SPOTLIGHT CHAMPION</span>
                <h3 className="text-base font-black tracking-wide text-white mt-1 uppercase">CHARRO ACE</h3>
                <span className="text-[8.5px] font-black text-amber-400 block font-mono uppercase mt-0.5">👑 4X CHAMPION</span>
                <p className="text-[8px] text-white/40 mt-1 uppercase font-mono">ROCK GUITAR LEGEND</p>
              </div>
              <button 
                onClick={() => playSound("ui-whoosh-bubbles.mp3")}
                className="py-2 bg-amber-500 hover:bg-amber-400 text-black text-[8.5px] font-black tracking-widest uppercase rounded-xl transition-all font-mono"
              >
                READ FEATURE
              </button>
            </div>

            {/* Latest Champions Grid */}
            <div className="col-span-12 md:col-span-7 bg-black/80 border border-white/10 p-4 rounded-2xl flex flex-col justify-between shadow-2xl h-[180px]">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-white/40 tracking-widest block uppercase font-mono">LATEST CHAMPIONS</span>
                <button className="text-[7.5px] font-bold text-cyan-400 font-mono tracking-widest hover:underline uppercase">VIEW ALL</button>
              </div>
              <div className="grid grid-cols-3 gap-2 flex-1 items-center mt-2">
                {[
                  { name: "MIA JAY", title: "VOCAL QUEEN", wins: "3x", emoji: "👩‍🎤", color: "from-purple-950 to-black border-purple-500/20" },
                  { name: "DJ BLEND", title: "SCRATCH MASTER", wins: "3x", emoji: "🎧", color: "from-cyan-950 to-black border-cyan-500/20" },
                  { name: "LANI FLAME", title: "BEAT PRODUCER", wins: "2x", emoji: "🔥", color: "from-emerald-950 to-black border-emerald-500/20" },
                ].map((item, i) => (
                  <div key={i} className={`bg-gradient-to-b ${item.color} border p-2 rounded-xl text-center flex flex-col items-center gap-1 shadow-md hover:scale-105 transition-transform`}>
                    <span className="text-xl filter drop-shadow">{item.emoji}</span>
                    <span className="text-[7.5px] font-black block tracking-wide truncate w-full text-white">{item.name}</span>
                    <span className="text-[5.5px] text-white/40 block tracking-widest uppercase font-mono truncate w-full">{item.title}</span>
                    <span className="text-[7px] font-black text-amber-400 font-mono">👑 {item.wins}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: CHATS, SPONSOR, PROGRESS */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          
          {/* Audience chat Room panel */}
          <div className="bg-black/80 border border-white/10 p-4 rounded-2xl flex flex-col justify-between h-[210px] shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[8px] font-black text-cyan-400 tracking-widest block uppercase font-mono">AUDIENCE ROOM</span>
              <span className="text-[8.5px] font-bold text-cyan-400 font-mono tracking-wider uppercase">
                ● 852 ONLINE ({scene?.audienceReactionMode || "DANCING"})
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-2">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-[9px]">
                  <span className="font-bold text-cyan-300 font-mono mr-1">{msg.name}:</span>
                  <span className="text-white/80">{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[8.5px] text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button type="submit" className="p-1 px-3 bg-cyan-500 text-black text-[8px] font-black rounded-lg font-mono">
                SEND
              </button>
            </form>
          </div>

          {/* Sponsored By panel */}
          <div className="bg-gradient-to-r from-zinc-950 via-black to-zinc-900 border border-white/5 p-4 rounded-2xl shadow-xl flex flex-col justify-between h-[120px] relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[7px] font-black bg-white/10 text-white/60 px-1 py-0.5 rounded font-mono">SPONSOR</div>
            <div>
              <span className="text-[7.5px] text-white/40 block font-mono">SPONSORED BY</span>
              <div className="text-lg font-black text-white italic mt-1 font-mono tracking-widest">NIKE</div>
              <span className="text-[9px] text-white/60 mt-0.5 block">Just Do It.</span>
            </div>
            <button 
              onClick={() => playSound("ui-whoosh-bubbles.mp3")}
              className="w-full py-1.5 bg-white text-black hover:bg-white/90 text-[8px] font-black tracking-widest uppercase rounded-lg transition-colors font-mono"
            >
              LEARN MORE
            </button>
          </div>

          {/* Your Stats */}
          <div className="bg-black/80 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 shadow-xl">
            <span className="text-[8px] font-black text-white/40 tracking-widest block uppercase font-mono">YOUR STATS</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[7px] text-white/40 block font-mono">WINS</span>
                <span className="text-xs font-black text-cyan-400 font-mono">12</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[7px] text-white/40 block font-mono">TOP 5</span>
                <span className="text-xs font-black text-cyan-400 font-mono">45</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[7px] text-white/40 block font-mono">STREAK</span>
                <span className="text-xs font-black text-amber-400 font-mono">120</span>
              </div>
            </div>
            <button 
              onClick={() => playSound("ui-whoosh-bubbles.mp3")}
              className="w-full py-2 bg-cyan-500 text-black text-[8px] font-black tracking-widest uppercase rounded-xl transition-all font-mono"
            >
              VIEW PROFILE
            </button>
          </div>

          {/* TMI Level */}
          <div className="bg-black/80 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 shadow-xl">
            <span className="text-[8px] font-black text-white/40 tracking-widest block uppercase font-mono">TMI LEVEL</span>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>LEVEL 28</span>
              <span className="font-mono text-cyan-400">8,450 / 10,000 XP</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: "84.5%" }} />
            </div>
          </div>

        </div>

      </div>

      {/* 3. TMI Broadcast Announcement ticker */}
      <footer className="bg-black border-t border-cyan-500/20 px-6 py-2.5 flex justify-between items-center z-40 relative">
        <div className="flex items-center gap-3 w-full">
          <span className="text-[7px] font-black bg-purple-600 text-white px-2 py-0.5 rounded uppercase tracking-wider font-mono">ANNOUNCEMENT</span>
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerMsg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-[9px] font-medium tracking-wide text-cyan-300 block font-mono"
              >
                {tickerMsg}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[8.5px] font-bold text-white/30 tracking-widest uppercase font-mono">POWERED BY THE MUSICIANS INDEX</span>
        </div>
      </footer>

    </div>
  );
}
