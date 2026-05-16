"use client";

// Canon source: Venue Skins Plus Seating/ — seating grid layouts, row configurations
// Visual seat zone map: zone bands (VIP/front/mid/rear) + seat grid
// Connects to tmiVenueSeatEngine for live seat status

import React, { useState } from "react";
import { buildVenueSeatingMap, type TmiSeatNode } from "@/lib/venue/tmiVenueSeatEngine";

interface VenueSeatZoneMapProps {
  venueId?: string;
  /** Max seats to render — default 120 */
  maxSeats?: number;
  onSeatSelect?: (seat: TmiSeatNode) => void;
  selectedSeatId?: string;
}

const ZONE_COLOR: Record<TmiSeatNode["zone"], { bg: string; border: string; label: string }> = {
  vip:   { bg: "rgba(255,215,0,0.18)",  border: "#FFD700", label: "VIP"   },
  front: { bg: "rgba(255,45,170,0.12)", border: "#FF2DAA", label: "FRONT" },
  mid:   { bg: "rgba(0,255,255,0.08)",  border: "#00FFFF", label: "MID"   },
  rear:  { bg: "rgba(170,45,255,0.06)", border: "#AA2DFF", label: "REAR"  },
};

const STATUS_STYLE: Record<TmiSeatNode["status"], React.CSSProperties> = {
  open:     { opacity: 1, cursor: "pointer" },
  reserved: { opacity: 0.4, cursor: "not-allowed" },
  blocked:  { opacity: 0.15, cursor: "not-allowed" },
};

export default function VenueSeatZoneMap({
  venueId = "neon-dome",
  maxSeats = 120,
  onSeatSelect,
  selectedSeatId,
}: VenueSeatZoneMapProps) {
  const map = buildVenueSeatingMap(venueId);
  const seats = map.seats.slice(0, maxSeats);

  // Group by zone for label rendering
  const zones = Array.from(new Set(seats.map((s) => s.zone))) as TmiSeatNode["zone"][];

  return (
    <div
      data-venue-seat-zone-map
      style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Zone legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {zones.map((zone) => {
          const z = ZONE_COLOR[zone];
          return (
            <div
              key={zone}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                background: z.bg,
                border: `1px solid ${z.border}40`,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: z.border }} />
              <span style={{ fontSize: 7, fontWeight: 900, color: z.border, letterSpacing: "0.15em" }}>{z.label}</span>
            </div>
          );
        })}
        <div style={{ marginLeft: "auto", fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", alignSelf: "center" }}>
          {seats.filter((s) => s.status === "open").length} OPEN · {map.seats.length} TOTAL
        </div>
      </div>

      {/* Seat grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${map.cols}, minmax(0, 1fr))`,
          gap: 3,
        }}
      >
        {seats.map((seat) => {
          const z = ZONE_COLOR[seat.zone];
          const isSelected = seat.id === selectedSeatId;
          return (
            <button
              key={seat.id}
              aria-label={`Seat ${seat.row}${seat.number} — ${seat.zone} — ${seat.status}`}
              disabled={seat.status !== "open"}
              onClick={() => seat.status === "open" && onSeatSelect?.(seat)}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 2,
                background: isSelected ? z.border : z.bg,
                border: `1px solid ${isSelected ? z.border : `${z.border}30`}`,
                boxShadow: isSelected ? `0 0 6px ${z.border}80` : "none",
                padding: 0,
                ...STATUS_STYLE[seat.status],
                transition: "background 0.15s, box-shadow 0.15s",
              }}
              title={`${seat.row}${seat.number}`}
            />
          );
        })}
      </div>

      {/* Stage indicator */}
      <div
        style={{
          height: 8,
          borderRadius: "50% 50% 0 0",
          background: "linear-gradient(to top, rgba(255,255,255,0.08), transparent)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          marginTop: 4,
        }}
      />
      <p style={{ textAlign: "center", fontSize: 7, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>
        STAGE
      </p>
    </div>
  );
}
