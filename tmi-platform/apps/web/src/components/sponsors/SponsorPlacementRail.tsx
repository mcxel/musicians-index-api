"use client";

import { useState } from "react";

type PlacementSlot = {
  id: string;
  zone: "stage-banner" | "lobby-billboard" | "ticket-footer" | "digital-overlay" | "venue-wrap";
  venue: string;
  cpm: number;
  status: "available" | "taken";
  takenBy: string | null;
  capacity: number;
  format: "banner" | "video" | "static" | "interactive";
};

const SEED_SLOTS: PlacementSlot[] = [
  { id: "sp-001", zone: "stage-banner", venue: "Crown Stage", cpm: 18.50, status: "available", takenBy: null, capacity: 1, format: "banner" },
  { id: "sp-002", zone: "lobby-billboard", venue: "Crown Stage", cpm: 12.00, status: "taken", takenBy: "wave-energy", capacity: 1, format: "static" },
  { id: "sp-003", zone: "ticket-footer", venue: "Electric Blue", cpm: 6.75, status: "available", takenBy: null, capacity: 3, format: "static" },
  { id: "sp-004", zone: "digital-overlay", venue: "Pulse Arena", cpm: 22.00, status: "available", takenBy: null, capacity: 1, format: "video" },
  { id: "sp-005", zone: "venue-wrap", venue: "Velvet Lounge", cpm: 35.00, status: "available", takenBy: null, capacity: 1, format: "interactive" },
  { id: "sp-006", zone: "lobby-billboard", venue: "Pulse Arena", cpm: 14.00, status: "taken", takenBy: "apex-drinks", capacity: 1, format: "static" },
];

const ZONE_COLORS: Record<PlacementSlot["zone"], string> = {
  "stage-banner": "#FF2DAA",
  "lobby-billboard": "#00FFFF",
  "ticket-footer": "#fcd34d",
  "digital-overlay": "#AA2DFF",
  "venue-wrap": "#f97316",
};

const ZONE_LABELS: Record<PlacementSlot["zone"], string> = {
  "stage-banner": "STAGE BANNER",
  "lobby-billboard": "LOBBY BILLBOARD",
  "ticket-footer": "TICKET FOOTER",
  "digital-overlay": "DIGITAL OVERLAY",
  "venue-wrap": "VENUE WRAP",
};

export default function SponsorPlacementRail({ sponsorSlug }: { sponsorSlug: string }) {
  const [slots, setSlots] = useState<PlacementSlot[]>(SEED_SLOTS);

  const mySlots = slots.filter(s => s.takenBy === sponsorSlug);
  const available = slots.filter(s => s.status === "available");

  function attachSponsorToTicket(slotId: string) {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, status: "taken", takenBy: sponsorSlug } : s
    ));
  }

  function releaseSlot(slotId: string) {
    setSlots(prev => prev.map(s =>
      s.id === slotId && s.takenBy === sponsorSlug ? { ...s, status: "available", takenBy: null } : s
    ));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "MY PLACEMENTS", value: mySlots.length, color: "#00FFFF" },
          { label: "AVAILABLE SLOTS", value: available.length, color: "#22c55e" },
          { label: "AVG CPM", value: `$${(slots.reduce((s, sl) => s + sl.cpm, 0) / slots.length).toFixed(2)}`, color: "#fcd34d" },
        ].map(m => (
          <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${m.color}33`, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: "0.14em", marginBottom: 4 }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {mySlots.length > 0 && (
        <div>
          <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>MY ACTIVE PLACEMENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mySlots.map(slot => (
              <div key={slot.id} style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#00FFFF", fontSize: 11, fontWeight: 700 }}>{ZONE_LABELS[slot.zone]}</div>
                  <div style={{ color: "#64748b", fontSize: 10 }}>{slot.venue} · {slot.format.toUpperCase()} · ${slot.cpm}/CPM</div>
                </div>
                <button onClick={() => releaseSlot(slot.id)} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 5, color: "#f87171", fontSize: 9, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>
                  RELEASE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>ALL PLACEMENT SLOTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {slots.map(slot => {
            const color = ZONE_COLORS[slot.zone];
            const isOwn = slot.takenBy === sponsorSlug;
            return (
              <div key={slot.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color, fontSize: 11, fontWeight: 700 }}>{ZONE_LABELS[slot.zone]}</div>
                  <div style={{ color: "#64748b", fontSize: 10 }}>{slot.venue} · {slot.format.toUpperCase()} · ${slot.cpm}/CPM</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {slot.status === "taken" && !isOwn && (
                    <span style={{ color: "#ef4444", fontSize: 9, fontWeight: 700 }}>TAKEN</span>
                  )}
                  {slot.status === "available" && (
                    <button onClick={() => attachSponsorToTicket(slot.id)} style={{ background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 5, color, fontSize: 9, padding: "4px 12px", cursor: "pointer", fontWeight: 700 }}>
                      CLAIM SLOT
                    </button>
                  )}
                  {isOwn && (
                    <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 700 }}>✓ YOURS</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
