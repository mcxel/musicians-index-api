"use client";

import React from "react";

import { useRoomPopulationEngine } from "@/engines/world/RoomPopulationEngine";
import { useCrowdIntentEngine } from "@/engines/world/CrowdIntentEngine";
import { useCameraFocusReactionEngine } from "@/engines/world/CameraFocusReactionEngine";
import { useBillboardPreviewHoverEngine } from "@/engines/world/BillboardPreviewHoverEngine";
import { useSponsorGiftCommerceEngine } from "@/engines/world/SponsorGiftCommerceEngine";

export default function AdminObservatoryChat() {
  const population = useRoomPopulationEngine();
  const intent = useCrowdIntentEngine();
  const camera = useCameraFocusReactionEngine();
  const billboard = useBillboardPreviewHoverEngine();
  const sponsor = useSponsorGiftCommerceEngine();

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-8 font-mono flex flex-col gap-8 overflow-y-auto">
      <header className="border-b-4 border-[#FF00FF] pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#FF00FF] drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            ADMIN OBSERVATORY
          </h1>
          <h2 className="text-2xl font-bold text-[#FF5E00] uppercase mt-2">Live Chat & Engine Monitor</h2>
        </div>
        <div className="text-right border-2 border-cyan-500 p-3 rounded-lg bg-cyan-950/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <div className="text-sm text-yellow-400 font-bold mb-1">SYSTEM STATUS: <span className="text-green-500 animate-pulse ml-2">ONLINE</span></div>
          <div className="text-xs text-gray-400">ENGINE_SYNC_RATE: REALTIME</div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <MonitorCard title="Room Heat Monitor" value={`${Math.floor(population?.heat ?? 0)}°C`} color="text-[#FF5E00]" border="border-[#FF5E00]" shadow="shadow-[#FF5E00]/20" />
        <MonitorCard title="Chat Flow Monitor" value={`${population?.chatFlowRate ?? 0} msg/s`} color="text-cyan-400" border="border-cyan-400" shadow="shadow-cyan-400/20" />
        <MonitorCard title="Camera Focus State" value={camera?.currentFocusState ?? "STAGE_WIDE"} color="text-yellow-400" border="border-yellow-400" shadow="shadow-yellow-400/20" />
        <MonitorCard title="Reaction Burst Stream" value={`${camera?.reactionBurstsCount ?? 0} bursts`} color="text-teal-400" border="border-teal-400" shadow="shadow-teal-400/20" />
        
        <div className="p-6 bg-zinc-950 border-2 border-[#FF00FF] rounded-xl shadow-[0_0_20px_var(--tw-shadow-color)] shadow-[#FF00FF]/20 flex flex-col gap-4 col-span-1 md:col-span-2">
          <h3 className="text-sm font-bold text-[#FF00FF] uppercase tracking-widest border-b border-[#FF00FF]/30 pb-2">Crowd Intent Distribution</h3>
          <div className="flex justify-between items-center mt-2 text-2xl font-black">
            <span className="text-green-400 drop-shadow-[0_0_8px_currentColor]">HYPE: {intent?.distribution?.hype ?? 0}%</span>
            <span className="text-cyan-400 drop-shadow-[0_0_8px_currentColor]">CHILL: {intent?.distribution?.chill ?? 0}%</span>
            <span className="text-[#FF5E00] drop-shadow-[0_0_8px_currentColor]">TOXIC: {intent?.distribution?.toxic ?? 0}%</span>
          </div>
        </div>

        <MonitorCard 
          title="Safety Events" 
          value={intent?.safetyEventsCount ?? 0} 
          color={(intent?.safetyEventsCount ?? 0) > 5 ? "text-red-500 animate-pulse" : "text-green-500"} 
          border={(intent?.safetyEventsCount ?? 0) > 5 ? "border-red-500" : "border-green-500"} 
          shadow={(intent?.safetyEventsCount ?? 0) > 5 ? "shadow-red-500/20" : "shadow-green-500/20"} 
        />
        <MonitorCard title="Sponsor Gift Events" value={sponsor?.giftEventsCount ?? 0} color="text-[#FF00FF]" border="border-[#FF00FF]" shadow="shadow-[#FF00FF]/20" />
        <MonitorCard title="Live Billboard Activity" value={`${billboard?.hoverActivityCount ?? 0} hovers`} color="text-yellow-400" border="border-yellow-400" shadow="shadow-yellow-400/20" />
      </main>
    </div>
  );
}

function MonitorCard({ title, value, color, border, shadow }: { title: string, value: string | number, color: string, border: string, shadow: string }) {
  return (
    <div className={`p-6 bg-zinc-950 border-2 ${border} rounded-xl shadow-[0_0_25px_var(--tw-shadow-color)] ${shadow} transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest border-b ${border.replace('border-', 'border-')}/30 pb-2 mb-4 text-gray-400`}>
        {title}
      </h3>
      <div className={`text-4xl font-black ${color} drop-shadow-[0_0_10px_currentColor] truncate`}>
        {value}
      </div>
    </div>
  );
}