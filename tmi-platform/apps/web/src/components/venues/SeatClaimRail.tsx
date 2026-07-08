"use client";

import { useState } from "react";
import { createTicket } from "@/lib/tickets/ticketEngine";
import { claimSeat } from "@/lib/venue/tmiVenueSeatEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";

type SeatEntry = {
  seatId: string;
  row: string;
  seatNumber: number;
  zone: string;
  price: number;
};

type SeatClaimRailProps = {
  venueSlug: string;
  eventSlug: string;
  userId: string;
  seats: SeatEntry[];
  onTicketIssued?: (ticketId: string, seatId: string) => void;
  onClear?: () => void;
};

const ZONE_TIER: Record<string, TicketTier> = {
  vip:   "VIP",
  front: "STANDARD",
  mid:   "STANDARD",
  rear:  "STANDARD",
};

export default function SeatClaimRail({
  venueSlug,
  eventSlug,
  userId,
  seats,
  onTicketIssued,
  onClear,
}: SeatClaimRailProps) {
  const [issued, setIssued] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = seats.reduce((sum, s) => sum + s.price, 0);
  const allIssued = seats.length > 0 && seats.every((s) => issued[s.seatId]);

  async function handleCheckout() {
    if (seats.length === 0 || processing) return;
    setProcessing(true);
    setError(null);

    try {
      const newIssued: Record<string, string> = { ...issued };
      for (const seat of seats) {
        if (newIssued[seat.seatId]) continue;
        const ticket = createTicket({
          ownerId: userId,
          venueSlug,
          eventSlug,
          tier: ZONE_TIER[seat.zone] ?? "STANDARD",
          faceValue: seat.price,
        });
        claimSeat(seat.seatId, userId, ticket.id);
        newIssued[seat.seatId] = ticket.id;
        onTicketIssued?.(ticket.id, seat.seatId);
      }
      setIssued(newIssued);
    } catch (err) {
      setError(err instanceof Error ? err.message : "checkout_failed");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <aside
      data-seat-claim-rail={venueSlug}
      style={{
        border: "1px solid rgba(34,197,94,0.4)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(5,25,15,0.75), rgba(3,8,5,0.92))",
        padding: 12,
        display: "grid",
        gap: 8,
      }}
    >
      <strong style={{ color: "#86efac", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
        SEAT CLAIM RAIL
      </strong>

      {seats.length === 0 ? (
        <p style={{ fontSize: 10, color: "#475569", margin: 0 }}>No seats selected. Click the map to choose.</p>
      ) : (
        <>
          {seats.map((seat) => (
            <div
              key={seat.seatId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 7,
                padding: "5px 10px",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ fontSize: 10, color: "#d1fae5" }}>
                Row {seat.row} · Seat {seat.seatNumber} · {seat.zone.toUpperCase()}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e" }}>
                  ${seat.price}
                </span>
                {issued[seat.seatId] && (
                  <span style={{ fontSize: 8, color: "#86efac", letterSpacing: "0.1em" }}>
                    TKT:{issued[seat.seatId].slice(-6)}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid rgba(34,197,94,0.2)", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#86efac", fontWeight: 700 }}>
              TOTAL: ${total}
            </span>
            <span style={{ fontSize: 9, color: "#64748b" }}>
              {seats.length} seat{seats.length !== 1 ? "s" : ""}
            </span>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 10, color: "#fca5a5" }}>Error: {error}</p>
          )}

          {allIssued ? (
            <div style={{ background: "rgba(34,197,94,0.12)", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#86efac", fontWeight: 700, letterSpacing: "0.1em" }}>
                ✓ {seats.length} TICKET{seats.length !== 1 ? "S" : ""} ISSUED
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={processing}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: "1px solid rgba(34,197,94,0.6)",
                  background: processing ? "rgba(0,0,0,0.3)" : "rgba(5,46,22,0.55)",
                  color: "#86efac",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  padding: "8px 0",
                  cursor: processing ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                }}
              >
                {processing ? "PROCESSING..." : "CLAIM + ISSUE TICKETS"}
              </button>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  style={{
                    borderRadius: 8,
                    border: "1px solid rgba(100,116,139,0.3)",
                    background: "transparent",
                    color: "#64748b",
                    fontSize: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  CLEAR
                </button>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
}
