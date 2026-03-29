"use client";

import React from "react";
import { useRoomInfrastructure } from "@/components/room/RoomInfrastructureProvider";

export default function RoomInfrastructureShell() {
  const {
    roomId,
    roomType,
    roomStatus,
    roomTitle,
    roomMode,
    participantCount,
    mountRegions,
  } = useRoomInfrastructure();

  return (
    <aside className="pointer-events-auto fixed bottom-6 left-6 z-[74] w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-cyan-400/40 bg-black/85 p-3 text-xs text-slate-200 shadow-[0_0_24px_rgba(34,211,238,0.2)] backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between border-b border-cyan-400/30 pb-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-wide text-cyan-200">Room Infrastructure</p>
          <p className="truncate text-sm font-semibold text-white">{roomTitle}</p>
        </div>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase">scaffold</span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <p>Room ID: <span className="font-semibold text-white">{roomId}</span></p>
        <p>Type: <span className="font-semibold uppercase text-white">{roomType}</span></p>
        <p>Status: <span className="font-semibold uppercase text-white">{roomStatus}</span></p>
        <p>Mode: <span className="font-semibold uppercase text-white">{roomMode}</span></p>
        <p>Participants: <span className="font-semibold text-white">{participantCount}</span></p>
      </div>

      <div className="mt-3 rounded border border-white/10 bg-white/5 p-2">
        <p className="mb-1 text-[10px] uppercase tracking-wide text-cyan-200">Mount Regions</p>
        <ul className="space-y-1 text-[11px] text-slate-300">
          <li>Preview Window: {mountRegions.previewWindow}</li>
          <li>Turn/Queue Dock: {mountRegions.turnQueueDock}</li>
          <li>Live Control Panel: {mountRegions.liveControlPanel}</li>
          <li>Watchdog: {mountRegions.watchdog}</li>
          <li>Recovery: {mountRegions.recovery}</li>
        </ul>
      </div>
    </aside>
  );
}
