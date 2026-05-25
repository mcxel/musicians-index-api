'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function HomeVisualTruth() {
  const [burstEvent, setBurstEvent] = useState(false);
  const [stickerIndex, setStickerIndex] = useState(0);
  const [orbitSnapIndex, setOrbitSnapIndex] = useState(0);

  // 1. First 3-Second Event Burst
  useEffect(() => {
    const timer = setTimeout(() => setBurstEvent(true), 3000);
    const hideTimer = setTimeout(() => setBurstEvent(false), 3800);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  // 2. Sticker Engine & Snap-Focus Orbit Simulation
  useEffect(() => {
    const stickerInterval = setInterval(() => {
      setStickerIndex(prev => (prev + 1) % 5);
    }, 4500);
    
    const orbitInterval = setInterval(() => {
      setOrbitSnapIndex(prev => (prev + 1) % 4);
    }, 3500);

    return () => { clearInterval(stickerInterval); clearInterval(orbitInterval); };
  }, []);

  const stickers = ["VOTING LIVE", "#1 TAKEN", "NEW CHALLENGER", "YOU'RE LATE", "CYPHER OPEN"];
  
  return (
    <div className="relative w-full min-h-screen bg-[#050510] overflow-hidden selection:bg-rose-500 selection:text-white text-white font-sans">
      
      {/* --- 7. BACKGROUND: ALIVE & EXPRESSIVE --- */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-rose-900/20 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('/noise-texture.png')] opacity-10 mix-blend-overlay"></div>
        {/* Drifting Memphis Shapes */}
        <div className="absolute top-[20%] left-[30%] w-32 h-32 border-4 border-rose-500/20 rounded-full animate-[ping_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[30%] right-[20%] w-40 h-40 border-4 border-cyan-500/20 rotate-45 animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>

      {/* --- 6. FIRST 3-SECOND EVENT BURST --- */}
      {burstEvent && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none mix-blend-screen">
          <div className="absolute inset-0 bg-rose-600/30 animate-[pulse_0.2s_ease-in-out_3]"></div>
          <div className="text-[20rem] animate-ping opacity-80 drop-shadow-[0_0_100px_rgba(225,29,72,1)]">👑</div>
        </div>
      )}

      {/* --- 4. DATA LAYER: FLOATING CHAOS NUMBERS --- */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden font-black text-white/5">
        <div className="absolute top-[5%] left-[10%] text-[15rem] -rotate-12 hover:rotate-0 hover:text-white/20 transition-all duration-700">1</div>
        <div className="absolute top-[40%] right-[15%] text-[20rem] rotate-12 hover:rotate-0 hover:text-white/20 transition-all duration-700">2</div>
        <div className="absolute bottom-[10%] left-[20%] text-[18rem] -rotate-6 hover:rotate-0 hover:text-white/20 transition-all duration-700">3</div>
        <div className="absolute top-[20%] right-[40%] text-[12rem] rotate-45 hover:rotate-0 hover:text-white/20 transition-all duration-700">4</div>
      </div>

      {/* --- 2. FOREGROUND: HUMAN ENERGY (FACE LAYER) --- */}
      {/* Broken Grid: Nothing is perfectly centered, overlapping z-indexes */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* Face 1 */}
        <div className="absolute top-[15%] left-[5%] w-48 h-64 rotate-[-8deg] hover:rotate-0 hover:scale-110 hover:z-50 transition-all duration-500 shadow-2xl shadow-black/80 grayscale hover:grayscale-0 border border-white/10 pointer-events-auto">
          <Image src="/tmi-source/Host , Julius , and extra/Host.png" alt="Face 1" fill className="object-cover" />
        </div>
        {/* Face 2 */}
        <div className="absolute top-[45%] right-[8%] w-56 h-72 rotate-[12deg] hover:rotate-0 hover:scale-110 hover:z-50 transition-all duration-500 shadow-2xl shadow-rose-900/50 grayscale hover:grayscale-0 border border-rose-500/30 pointer-events-auto">
          <Image src="/tmi-source/Host , Julius , and extra/Host 2.png" alt="Face 2" fill className="object-cover" />
        </div>
        {/* Face 3 */}
        <div className="absolute bottom-[5%] left-[25%] w-64 h-56 rotate-[-15deg] hover:rotate-0 hover:scale-110 hover:z-50 transition-all duration-500 shadow-2xl shadow-cyan-900/50 grayscale hover:grayscale-0 border border-cyan-500/30 pointer-events-auto">
          <Image src="/tmi-source/Host , Julius , and extra/Host 3.png" alt="Face 3" fill className="object-cover object-top" />
        </div>
        {/* Face 4 (Julius) */}
        <div className="absolute top-[5%] right-[35%] w-40 h-40 rotate-[5deg] rounded-full hover:rotate-0 hover:scale-110 hover:z-50 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)] grayscale hover:grayscale-0 pointer-events-auto overflow-hidden">
          <Image src="/tmi-source/Host , Julius , and extra/Julius.png" alt="Face 4" fill className="object-cover" />
        </div>
      </div>

      {/* --- 1. CORE CONTENT: BROKEN ALIGNMENT --- */}
      <div className="relative z-20 w-full min-h-screen flex flex-col justify-center px-6 md:px-20 pointer-events-none">
        <div className="max-w-4xl mix-blend-difference pointer-events-auto mt-20 relative">
          <h1 className="text-8xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] relative rotate-[-2deg]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">Live</span>
            <span className="block text-rose-500 ml-10 hover:scale-105 transition-transform cursor-pointer">Now.</span>
          </h1>
          <p className="mt-8 text-2xl md:text-4xl text-zinc-300 font-light max-w-xl rotate-[1deg] bg-black/40 backdrop-blur-sm p-4 border-l-4 border-rose-500 shadow-xl shadow-black/50">
            The grid is dead. The broadcast is alive. Join the cypher.
          </p>
        </div>
      </div>

      {/* --- 5. ORBIT SYSTEM: SNAP FOCUS ANIMATION --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-2xl h-[400px] pointer-events-none flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`absolute w-48 h-64 bg-zinc-900 border border-white/20 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
              orbitSnapIndex === i 
                ? 'scale-[1.15] z-50 rotate-0 translate-y-[-20px] shadow-[0_0_50px_rgba(255,255,255,0.3)] border-white/60 blur-0' 
                : 'scale-90 z-30 rotate-12 translate-x-32 blur-[2px] opacity-40'
            } ${i === (orbitSnapIndex + 1) % 4 ? 'translate-x-[-120px] -rotate-12 z-20 opacity-20' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
            {/* Abstract content for the card */}
            <div className="absolute bottom-4 left-4 z-20 font-mono text-xs font-bold text-rose-400">FEED_{i + 1}</div>
          </div>
        ))}
      </div>

      {/* --- 3. STICKER ENGINE --- */}
      <div className="absolute top-[30%] right-[20%] z-50 pointer-events-auto">
        {stickers.map((text, i) => (
          <div
            key={text}
            className={`absolute w-max px-6 py-2 bg-yellow-400 text-black font-black uppercase tracking-widest text-xl transition-all duration-500 rotate-[${(i * 15) - 20}deg] shadow-[8px_8px_0_rgba(0,0,0,1)] border-2 border-black ${
              stickerIndex === i ? 'opacity-100 scale-100 hover:scale-110 cursor-pointer' : 'opacity-0 scale-50 pointer-events-none'
            }`}
            style={{
              transform: `rotate(${(i * 12) - 24}deg) ${stickerIndex === i ? 'scale(1.1)' : 'scale(0.5)'}`
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* --- 6b. COMPACT HUD (TOP RIGHT) --- */}
      <div className="absolute top-6 right-6 z-[9999] flex flex-col items-end space-y-2 pointer-events-auto">
        <div className="flex items-center space-x-3 bg-black/80 backdrop-blur-xl px-5 py-2 border border-rose-500/50 skew-x-[-10deg] shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(225,29,72,1)]"></div>
          <span className="font-mono text-sm tracking-widest text-white font-bold">14,209 <span className="text-rose-500">LIVE</span></span>
        </div>
        <div className="bg-white text-black font-black uppercase text-xs px-4 py-1 skew-x-[-10deg] shadow-[4px_4px_0_rgba(225,29,72,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer transition-all">
          ENTER CYPHER
        </div>
      </div>

      {/* [ OVERLAY ] - Deeply Integrated Ticker (Rotated and Aggressive) */}
      <div className="fixed bottom-10 w-[110vw] left-[-5vw] z-50 bg-rose-600 border-y-4 border-black py-2 overflow-hidden flex whitespace-nowrap rotate-[-2deg] shadow-[0_0_40px_rgba(225,29,72,0.4)] pointer-events-none">
        <div className="animate-[marquee_20s_linear_infinite] inline-block font-black text-xl tracking-widest text-black uppercase space-x-10">
          <span>🔴 LIVE: RECORD RALPH CYPHER</span>
          <span>// TICKETING BOT: ONLINE //</span>
          <span>AURA REACTS DETECTED // </span>
          <span>🔴 LIVE: RECORD RALPH CYPHER</span>
          <span>// TICKETING BOT: ONLINE //</span>
        </div>
      </div>
    </div>
  );
}