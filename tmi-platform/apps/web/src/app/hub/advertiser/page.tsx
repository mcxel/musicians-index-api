"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import RoomContainer from "@/components/room/RoomContainer";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import MediaMonitor from "@/components/video/MediaMonitor";

type HubMode = "ADVERTISER" | "SPONSOR";
type Tier = "GOLD" | "DIAMOND";

export default function AdvertiserSponsorHub() {
  const [mode, setMode] = useState<HubMode>("ADVERTISER");
  const [tier, setTier] = useState<Tier>("DIAMOND"); // The Light Frame Economy Driver

  const accentColor = mode === "ADVERTISER" ? "#FF8C00" : "#00FFFF";
  const frameGlow = tier === "DIAMOND" ? `0 0 40px ${accentColor}88, inset 0 0 20px ${accentColor}44` : `0 0 15px ${accentColor}44`;

  return (
    <RoomContainer roomId="hub-adv-sponsor" title="Command Center" accentColor={accentColor} bpm={95}>
      <ActionCanister actions={[
        { id: "messages", label: "Messages", icon: "💬" },
        { id: "revenue", label: "ROI", icon: "💰" },
        { id: "sponsors", label: "Marketplace", icon: "🤝" },
        { id: "notifications", label: "Alerts", icon: "🔔" },
      ]} />
      <WidgetDrawer />

      <div className="min-h-screen flex flex-col p-4 md:p-6 ml-[60px] md:ml-[80px] font-sans text-white bg-[url('/assets/_converted_webp/Tmi%20Homepage%201.webp')] bg-cover bg-center bg-blend-multiply bg-black/80">
        
        {/* ── HEADER: DUAL USE TOGGLE ── */}
        <header className="flex justify-between items-center bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-[0.2em] uppercase" style={{ color: accentColor }}>
              {mode} COMMAND HUB
            </h1>
            <p className="text-xs text-white/50 tracking-widest mt-1">LIVE ADVERTISING & SPONSORSHIP ECONOMY</p>
          </div>
          
          <div className="flex gap-2 p-1 bg-black/50 border border-white/10 rounded-lg">
            <button 
              onClick={() => setMode("ADVERTISER")}
              className={`px-6 py-2 text-xs font-bold tracking-widest rounded transition-all ${mode === "ADVERTISER" ? "bg-[#FF8C00] text-black" : "text-white/40 hover:text-white"}`}
            >
              ADVERTISER
            </button>
            <button 
              onClick={() => setMode("SPONSOR")}
              className={`px-6 py-2 text-xs font-bold tracking-widest rounded transition-all ${mode === "SPONSOR" ? "bg-[#00FFFF] text-black" : "text-white/40 hover:text-white"}`}
            >
              SPONSOR
            </button>
          </div>
        </header>

        {/* ── MAIN 3-COLUMN GRID ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 mb-6 min-h-0">
          
          {/* 📊 LEFT PANEL — CAMPAIGN CONTROL */}
          <aside className="bg-black/70 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col gap-6 overflow-y-auto tmi-scroll">
            <h2 className="text-xs font-black text-white/40 tracking-[0.15em] border-b border-white/10 pb-2">CAMPAIGN CONTROL</h2>
            
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-white">Nova Cipher Takeover</span>
                <span style={{ color: accentColor }} className="font-bold">$450 / $1000</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: "45%" }} 
                  className="h-full rounded-full" style={{ background: accentColor }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl font-black text-white">12</div>
                <div className="text-[9px] text-white/40 tracking-widest mt-1">ACTIVE SLOTS</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl font-black text-white">EDM</div>
                <div className="text-[9px] text-white/40 tracking-widest mt-1">TARGET GENRE</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <button className="w-full py-3 bg-white/5 border border-white/20 hover:border-white/50 rounded-lg text-xs font-bold tracking-widest transition-colors">
                + LAUNCH CAMPAIGN
              </button>
              <button className="w-full py-3 bg-white/5 border border-white/20 hover:border-white/50 rounded-lg text-xs font-bold tracking-widest transition-colors">
                ⎘ DUPLICATE CAMPAIGN
              </button>
            </div>
          </aside>

          {/* 🎥 CENTER — VIDEO COMMAND SCREEN */}
          <section className="flex flex-col">
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">LIVE PLACEMENT FEED</span>
              <span className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/50 rounded text-[9px] font-black tracking-widest animate-pulse">
                ● BROADCASTING
              </span>
            </div>
            
            <div 
              className="flex-1 bg-black rounded-xl overflow-hidden relative transition-all duration-500"
              style={{ border: `2px solid ${accentColor}`, boxShadow: frameGlow }}
            >
              <MediaMonitor mode="standby" isActive={false} />
              
              {/* Live Overlay Simulator */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div className="bg-black/80 border border-white/20 p-3 rounded-lg backdrop-blur-md">
                  <div className="text-xs font-bold text-white mb-1">Running in: Battle Arena</div>
                  <div className="text-[10px] text-white/60">Currently viewing: 14,200 fans</div>
                </div>
                
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-black/80 border border-white/20 rounded-md text-xs font-bold text-white">👍 8.4k</span>
                  <span className="px-3 py-1 bg-black/80 border border-white/20 rounded-md text-xs font-bold text-white">🔥 12k</span>
                </div>
              </div>
            </div>
          </section>

          {/* 📈 RIGHT PANEL — PERFORMANCE + BILLBOARD */}
          <aside className="bg-black/70 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col gap-6 overflow-y-auto tmi-scroll">
            <h2 className="text-xs font-black text-white/40 tracking-[0.15em] border-b border-white/10 pb-2">ROI & PERFORMANCE</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase tracking-wider">Conversion Rate</span>
                <span className="text-lg font-black text-[#00FF88]">4.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase tracking-wider">Total Clicks</span>
                <span className="text-lg font-black text-white">18,492</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase tracking-wider">Watch Time</span>
                <span className="text-lg font-black text-white">420 hrs</span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[10px] font-black tracking-widest text-white/40 mb-3">TOP SPONSORED ARTISTS</h3>
              {[
                { rank: 1, name: "Nova Cipher", impact: "High" },
                { rank: 2, name: "Zion Freq", impact: "High" },
                { rank: 3, name: "Ray Journey", impact: "Med" }
              ].map(artist => (
                <div key={artist.rank} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 mb-2">
                  <span className="text-sm font-black text-white/30">0{artist.rank}</span>
                  <span className="text-xs font-bold text-white flex-1">{artist.name}</span>
                  <span className="text-[9px] px-2 py-1 bg-white/10 rounded tracking-wider">{artist.impact}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* 🎛 BOTTOM ACTION BAR */}
        <div className="bg-black/80 border border-white/10 rounded-xl p-4 backdrop-blur-xl flex flex-wrap lg:flex-nowrap justify-between items-center gap-4">
          <div className="flex gap-4 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-6 py-3 rounded-lg text-xs font-black tracking-widest bg-white text-black hover:bg-gray-200 transition-colors">
              ▶ RUN AD
            </button>
            <button className="flex-1 lg:flex-none px-6 py-3 rounded-lg text-xs font-black tracking-widest border border-white/20 hover:bg-white/10 transition-colors">
              💰 BOOST BUDGET
            </button>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto tmi-scroll pb-2 lg:pb-0">
            {[
              { label: "TARGET AUDIENCE", icon: "🎯" },
              { label: "CHOOSE PLACEMENT", icon: "📍" },
              { label: "AUTO OPTIMIZE (AI)", icon: "🤖" },
              { label: "ANALYTICS", icon: "📊" },
            ].map(btn => (
              <button key={btn.label} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap transition-colors flex items-center gap-2">
                <span className="text-sm">{btn.icon}</span> {btn.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </RoomContainer>
  );
}