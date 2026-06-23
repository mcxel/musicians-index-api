"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import RoomContainer from "@/components/room/RoomContainer";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import MediaMonitor from "@/components/video/MediaMonitor";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import Link from "next/link";
import { useTmiSession } from "@/hooks/SessionContext";

type HubMode = "ADVERTISER" | "SPONSOR";

export default function AdvertiserSponsorHub() {
  const [mode, setMode] = useState<HubMode>("ADVERTISER");
  const { userId } = useTmiSession();

  const accentColor = mode === "ADVERTISER" ? "#FF8C00" : "#00FFFF";

  return (
    <RoomContainer roomId="hub-adv-sponsor" title="Command Center" accentColor={accentColor} bpm={95}>
      <ActionCanister actions={[
        { id: "messages", label: "Messages", icon: "💬" },
        { id: "revenue", label: "ROI", icon: "💰" },
        { id: "sponsors", label: "Marketplace", icon: "🤝" },
        { id: "notifications", label: "Alerts", icon: "🔔" },
      ]} />
      <WidgetDrawer />

      <div className="min-h-screen flex flex-col p-4 md:p-6 ml-[60px] md:ml-[80px] font-sans text-white bg-[#050510]">

        {/* ── HEADER ── */}
        <header className="flex justify-between items-center bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-[0.2em] uppercase" style={{ color: accentColor }}>
              {mode} COMMAND HUB
            </h1>
            <p className="text-xs text-white/50 tracking-widest mt-1">LIVE ADVERTISING &amp; SPONSORSHIP ECONOMY</p>
          </div>

          <div className="flex gap-3 items-center">
            <PersonaSwitcher currentRole="advertiser" compact />
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
          </div>
        </header>

        {/* ── MAIN 3-COLUMN GRID ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 mb-6 min-h-0">

          {/* LEFT PANEL — CAMPAIGN CONTROL */}
          <aside className="bg-black/70 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col gap-6 overflow-y-auto">
            <h2 className="text-xs font-black text-white/40 tracking-[0.15em] border-b border-white/10 pb-2">CAMPAIGN CONTROL</h2>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-white/50">No active campaign</span>
                <span style={{ color: accentColor }} className="font-bold text-white/30">$0 spent</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: "0%" }}
                  className="h-full rounded-full" style={{ background: accentColor }}
                />
              </div>
              <div className="text-[10px] text-white/30 mt-2">Launch a campaign to see budget progress here.</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl font-black text-white">0</div>
                <div className="text-[9px] text-white/40 tracking-widest mt-1">ACTIVE SLOTS</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl font-black text-white/40">—</div>
                <div className="text-[9px] text-white/40 tracking-widest mt-1">TARGET GENRE</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <Link
                href="/sponsor/campaigns/new"
                className="w-full py-3 bg-white/5 border border-white/20 hover:border-white/50 rounded-lg text-xs font-bold tracking-widest transition-colors text-center text-white no-underline block"
              >
                + LAUNCH CAMPAIGN
              </Link>
              <Link
                href="/sponsor/campaigns"
                className="w-full py-3 bg-white/5 border border-white/20 hover:border-white/50 rounded-lg text-xs font-bold tracking-widest transition-colors text-center text-white no-underline block"
              >
                VIEW ALL CAMPAIGNS
              </Link>
            </div>
          </aside>

          {/* CENTER — VIDEO COMMAND SCREEN */}
          <section className="flex flex-col">
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">LIVE PLACEMENT FEED</span>
              <span className="px-3 py-1 bg-white/5 text-white/30 border border-white/10 rounded text-[9px] font-black tracking-widest">
                ● STANDBY — No active ad running
              </span>
            </div>

            <div
              className="flex-1 bg-black rounded-xl overflow-hidden relative transition-all duration-500"
              style={{ border: `2px solid ${accentColor}44` }}
            >
              <MediaMonitor mode="standby" isActive={false} />

              {/* Honest status overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div className="bg-black/80 border border-white/10 p-3 rounded-lg backdrop-blur-md">
                  <div className="text-xs font-bold text-white/50 mb-1">No ad placement active</div>
                  <div className="text-[10px] text-white/30">Launch a campaign to begin serving ads.</div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL — PERFORMANCE */}
          <aside className="bg-black/70 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col gap-6 overflow-y-auto">
            <h2 className="text-xs font-black text-white/40 tracking-[0.15em] border-b border-white/10 pb-2">ROI &amp; PERFORMANCE</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase tracking-wider">Conversion Rate</span>
                <span className="text-lg font-black text-white/30">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase tracking-wider">Total Clicks</span>
                <span className="text-lg font-black text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase tracking-wider">Watch Time</span>
                <span className="text-lg font-black text-white/30">—</span>
              </div>
              <div className="text-[10px] text-white/25 pt-2 border-t border-white/10">
                Stats will appear once your first campaign is live.
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[10px] font-black tracking-widest text-white/40 mb-3">TOP SPONSORED ARTISTS</h3>
              <div className="text-[10px] text-white/30 text-center py-4">No sponsored artists yet — launch a campaign to begin</div>
              <Link href="/artists" className="block text-center text-[10px] font-bold no-underline mt-2" style={{ color: accentColor }}>
                Browse Artists →
              </Link>
            </div>

            <div>
              <h3 className="text-[10px] font-black tracking-widest text-white/40 mb-3">QUICK LINKS</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Analytics", href: "/sponsor/analytics" },
                  { label: "Placements", href: "/sponsor/placements" },
                  { label: "Contracts", href: "/sponsor/contracts" },
                  { label: "Payments", href: "/sponsor/payments" },
                  { label: "Settings", href: "/settings" },
                ].map(link => (
                  <Link key={link.href} href={link.href} className="text-[11px] font-bold no-underline py-2 px-3 rounded-lg border border-white/10 bg-white/3 hover:bg-white/8 transition-colors" style={{ color: accentColor }}>
                    {link.label} →
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="bg-black/80 border border-white/10 rounded-xl p-4 backdrop-blur-xl flex flex-wrap lg:flex-nowrap justify-between items-center gap-4">
          <div className="flex gap-4 w-full lg:w-auto">
            <Link
              href="/sponsor/placements"
              className="flex-1 lg:flex-none px-6 py-3 rounded-lg text-xs font-black tracking-widest bg-white text-black hover:bg-gray-200 transition-colors text-center no-underline"
            >
              ▶ RUN AD
            </Link>
            <Link
              href="/sponsor/payments"
              className="flex-1 lg:flex-none px-6 py-3 rounded-lg text-xs font-black tracking-widest border border-white/20 hover:bg-white/10 transition-colors text-center no-underline text-white"
            >
              💰 BOOST BUDGET
            </Link>
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            {[
              { label: "TARGET AUDIENCE", icon: "🎯", href: "/sponsor/campaigns" },
              { label: "CHOOSE PLACEMENT", icon: "📍", href: "/sponsor/placements" },
              { label: "ANALYTICS", icon: "📊", href: "/sponsor/analytics" },
              { label: "CONTRACTS", icon: "📋", href: "/sponsor/contracts" },
            ].map(btn => (
              <Link
                key={btn.label}
                href={btn.href}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap transition-colors flex items-center gap-2 no-underline"
              >
                <span className="text-sm">{btn.icon}</span> {btn.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </RoomContainer>
  );
}
