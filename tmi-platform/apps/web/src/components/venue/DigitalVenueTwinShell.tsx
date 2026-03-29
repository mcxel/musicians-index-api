"use client";

import React from "react";
import { useDigitalVenueTwin } from "@/components/venue/DigitalVenueTwinProvider";

export default function DigitalVenueTwinShell() {
  const {
    venueId,
    venueName,
    venueType,
    city,
    region,
    environmentThemeKey,
    roomTemplateKey,
    eventId,
    sponsorSkin,
    liveStatus,
    attachedRoom,
  } = useDigitalVenueTwin();

  return (
    <aside className="pointer-events-auto fixed bottom-44 left-6 z-[73] w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-violet-400/40 bg-black/85 p-3 text-xs text-slate-200 shadow-[0_0_24px_rgba(167,139,250,0.2)] backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between border-b border-violet-400/30 pb-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-wide text-violet-200">Digital Venue Twin</p>
          <p className="truncate text-sm font-semibold text-white">{venueName}</p>
        </div>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase">scaffold</span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <p>Venue ID: <span className="font-semibold text-white">{venueId}</span></p>
        <p>Type: <span className="font-semibold uppercase text-white">{venueType}</span></p>
        <p>City: <span className="font-semibold text-white">{city}</span></p>
        <p>Region: <span className="font-semibold text-white">{region}</span></p>
        <p>Live: <span className="font-semibold uppercase text-white">{liveStatus}</span></p>
        <p>Room: <span className="font-semibold text-white">{attachedRoom.roomId}</span></p>
      </div>

      <div className="mt-3 rounded border border-white/10 bg-white/5 p-2 text-[11px] text-slate-300">
        <p>Environment Theme: {environmentThemeKey}</p>
        <p>Room Template: {roomTemplateKey}</p>
        <p>Event Link: {eventId ?? "(placeholder)"}</p>
        <p>Sponsor Skin: {sponsorSkin ?? "(placeholder)"}</p>
      </div>
    </aside>
  );
}
