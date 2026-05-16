"use client";

import { useState } from "react";
import {
  buildVenueSeatingMap,
  claimSeat,
  releaseSeat,
  getSeatClaim,
  type TmiSeatNode,
} from "@/lib/venue/tmiVenueSeatEngine";

const ZONE_COLOR: Record<string, string> = {
  vip:   "#fcd34d",
  front: "#00FFFF",
  mid:   "#c4b5fd",
  rear:  "#94a3b8",
};

const ZONE_PRICE: Record<string, number> = {
  vip:   250,
  front: 120,
  mid:   75,
  rear:  40,
};

type SeatMapEngineProps = {
  venueId: string;
  userId: string;
  rows?: number;
  cols?: number;
  onSeatClaimed?: (seatId: string, ticketId?: string) => void;
  onSeatReleased?: (seatId: string) => void;
};

export default function SeatMapEngine({
  venueId,
  userId,
  rows = 8,
  cols = 12,
  onSeatClaimed,
  onSeatReleased,
}: SeatMapEngineProps) {
  const seatingMap = buildVenueSeatingMap(venueId, rows, cols);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  function handleSeatClick(seat: TmiSeatNode) {
    if (seat.status === "blocked") return;

    if (claimed.has(seat.id)) {
      releaseSeat(seat.id);
      setClaimed((prev) => { const s = new Set(prev); s.delete(seat.id); return s; });
      onSeatReleased?.(seat.id);
      if (selected === seat.id) setSelected(null);
      return;
    }

    if (seat.status === "reserved") return;

    claimSeat(seat.id, userId);
    setClaimed((prev) => new Set([...prev, seat.id]));
    setSelected(seat.id);
    onSeatClaimed?.(seat.id, getSeatClaim(seat.id)?.ticketId);
  }

  const seatsByRow = seatingMap.seats.reduce<Record<string, TmiSeatNode[]>>((acc, seat) => {
    (acc[seat.row] ??= []).push(seat);
    return acc;
  }, {});

  const totalPrice = [...claimed].reduce((sum, id) => {
    const seat = seatingMap.seats.find((s) => s.id === id);
    return sum + (seat ? ZONE_PRICE[seat.zone] ?? 0 : 0);
  }, 0);

  return (
    <section
      data-seat-map={venueId}
      style={{
        border: "1px solid rgba(251,191,36,0.35)",
        borderRadius: 14,
        background: "linear-gradient(180deg, rgba(20,10,5,0.85), rgba(5,3,12,0.92))",
        padding: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <strong style={{ color: "#fcd34d", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", flex: 1 }}>
          SEAT MAP — {venueId.toUpperCase()}
        </strong>
        {claimed.size > 0 && (
          <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 700 }}>
            {claimed.size} selected · ${totalPrice}
          </span>
        )}
      </div>

      {/* Zone legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        {(["vip", "front", "mid", "rear"] as const).map((zone) => (
          <div key={zone} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: ZONE_COLOR[zone], display: "inline-block" }} />
            <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {zone} ${ZONE_PRICE[zone]}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#374151", display: "inline-block" }} />
          <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase" }}>blocked</span>
        </div>
      </div>

      {/* Stage indicator */}
      <div style={{
        width: "70%", margin: "0 auto 14px",
        background: "rgba(251,191,36,0.12)",
        border: "1px solid rgba(251,191,36,0.3)",
        borderRadius: 6, padding: "4px 0",
        textAlign: "center", fontSize: 9,
        color: "#fcd34d", letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}>
        STAGE
      </div>

      {/* Seat grid */}
      <div style={{ display: "grid", gap: 6 }}>
        {Object.entries(seatsByRow).map(([row, seats]) => (
          <div key={row} style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ width: 14, fontSize: 9, color: "#475569", textAlign: "center", flexShrink: 0 }}>{row}</span>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {seats.map((seat) => {
                const isClaimed = claimed.has(seat.id);
                const isSelected = selected === seat.id;
                const isBlocked = seat.status === "blocked";
                const isReserved = seat.status === "reserved" && !isClaimed;
                const zoneColor = ZONE_COLOR[seat.zone] ?? "#94a3b8";
                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat)}
                    title={`${row}${seat.number} · ${seat.zone} · $${ZONE_PRICE[seat.zone] ?? 0}`}
                    style={{
                      width: 22,
                      height: 18,
                      borderRadius: 3,
                      border: isSelected ? `1px solid ${zoneColor}` : isClaimed ? `1px solid ${zoneColor}88` : `1px solid ${isBlocked ? "#1f2937" : zoneColor + "44"}`,
                      background: isClaimed ? `${zoneColor}33` : isBlocked ? "#111827" : isReserved ? "#1e293b" : "rgba(0,0,0,0.5)",
                      cursor: isBlocked || isReserved ? "not-allowed" : "pointer",
                      fontSize: 7,
                      color: isClaimed ? zoneColor : isBlocked ? "#374151" : "#475569",
                      fontWeight: isClaimed ? 800 : 400,
                      transition: "all 0.1s",
                    }}
                  >
                    {isClaimed ? "✓" : isBlocked ? "×" : seat.number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Seat info row */}
      {selected && (() => {
        const s = seatingMap.seats.find((x) => x.id === selected);
        if (!s) return null;
        return (
          <div style={{ marginTop: 12, borderTop: "1px solid rgba(251,191,36,0.2)", paddingTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "#fde68a" }}>Selected: Row {s.row} · Seat {s.number}</span>
            <span style={{ fontSize: 10, color: ZONE_COLOR[s.zone] }}>Zone: {s.zone.toUpperCase()}</span>
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>${ZONE_PRICE[s.zone]}</span>
          </div>
        );
      })()}
    </section>
  );
}
