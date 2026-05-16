"use client";

import { useState } from "react";

type PlacementSlot = {
  id: string;
  name: string;
  type: "billboard" | "banner" | "venue-screen" | "app-feed" | "pre-roll";
  venue?: string;
  cpm: number;
  available: boolean;
  assignedTo?: string;
};

const SEED_SLOTS: PlacementSlot[] = [
  { id: "p1", name: "Crown Stage Main Billboard", type: "billboard",    venue: "crown-stage",  cpm: 18,  available: false, assignedTo: "soundbridge-pro" },
  { id: "p2", name: "Pulse Arena Side Screen",    type: "venue-screen", venue: "pulse-arena",  cpm: 12,  available: true  },
  { id: "p3", name: "Homepage Feed Slot A",       type: "app-feed",     venue: undefined,      cpm: 8,   available: false, assignedTo: "current-advertiser" },
  { id: "p4", name: "Pre-Roll Video Slot 1",      type: "pre-roll",     venue: undefined,      cpm: 22,  available: true  },
  { id: "p5", name: "Electric Blue Lobby Banner", type: "banner",       venue: "electric-blue",cpm: 7,   available: true  },
];

type PlacementRailProps = {
  advertiserSlug: string;
};

export default function PlacementRail({ advertiserSlug }: PlacementRailProps) {
  const [slots, setSlots] = useState<PlacementSlot[]>(SEED_SLOTS);

  function handleClaim(id: string) {
    setSlots((prev) => prev.map((s) => s.id === id ? { ...s, available: false, assignedTo: advertiserSlug } : s));
  }

  function handleRelease(id: string) {
    setSlots((prev) => prev.map((s) => s.id === id && s.assignedTo === advertiserSlug ? { ...s, available: true, assignedTo: undefined } : s));
  }

  const TYPE_COLOR: Record<string, string> = { billboard: "#fcd34d", banner: "#00FFFF", "venue-screen": "#c4b5fd", "app-feed": "#f97316", "pre-roll": "#22c55e" };

  return (
    <section style={{ display: "grid", gap: 10 }}>
      <strong style={{ color: "#00FFFF", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>PLACEMENT SLOTS</strong>
      {slots.map((slot) => {
        const accent = TYPE_COLOR[slot.type] ?? "#94a3b8";
        const mine = slot.assignedTo === advertiserSlug;
        return (
          <div key={slot.id} style={{ border: `1px solid ${accent}${slot.available ? "33" : "55"}`, borderRadius: 10, background: mine ? `${accent}0a` : "rgba(0,0,0,0.3)", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <strong style={{ color: "#f1f5f9", fontSize: 10 }}>{slot.name}</strong>
                <span style={{ fontSize: 8, fontWeight: 700, color: accent, border: `1px solid ${accent}44`, borderRadius: 3, padding: "1px 5px", textTransform: "uppercase" }}>{slot.type}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {slot.venue && <span style={{ fontSize: 9, color: "#64748b" }}>Venue: {slot.venue}</span>}
                <span style={{ fontSize: 9, color: "#94a3b8" }}>CPM: ${slot.cpm}</span>
                {!slot.available && slot.assignedTo && <span style={{ fontSize: 9, color: mine ? "#22c55e" : "#64748b" }}>{mine ? "YOUR SLOT" : `Taken`}</span>}
              </div>
            </div>
            {slot.available ? (
              <button type="button" onClick={() => handleClaim(slot.id)} style={{ borderRadius: 6, border: "1px solid rgba(34,197,94,0.5)", background: "rgba(5,46,22,0.4)", color: "#86efac", fontSize: 9, fontWeight: 700, padding: "5px 12px", cursor: "pointer" }}>CLAIM SLOT</button>
            ) : mine ? (
              <button type="button" onClick={() => handleRelease(slot.id)} style={{ borderRadius: 6, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(69,10,10,0.3)", color: "#fca5a5", fontSize: 9, fontWeight: 700, padding: "5px 12px", cursor: "pointer" }}>RELEASE</button>
            ) : (
              <span style={{ fontSize: 9, color: "#475569", letterSpacing: "0.08em" }}>UNAVAILABLE</span>
            )}
          </div>
        );
      })}
    </section>
  );
}
