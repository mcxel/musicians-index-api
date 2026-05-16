"use client";
import React from "react";
import type { PhysicalTicket, PrintFormat } from "@/lib/tickets/BrickAndMortarTicketEngine";

interface PrintableVenueTicketProps {
  ticket: PhysicalTicket;
  venueName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueAddress?: string;
}

const TIER_COLORS = {
  VIP: "#ffd700",
  STANDARD: "#94a3b8",
  BACKSTAGE: "#a78bfa",
  MEET_AND_GREET: "#00ffff",
  SPONSOR_GIFT: "#00ff88",
  SEASON_PASS: "#ff9f43",
  BATTLE_PASS: "#ff2daa",
  RAFFLE_PASS: "#34d399",
};

export function PrintableVenueTicket({
  ticket,
  venueName,
  eventName,
  eventDate,
  eventTime,
  venueAddress,
}: PrintableVenueTicketProps) {
  const tierColor = TIER_COLORS[ticket.tier] ?? "#94a3b8";

  return (
    <div
      className="printable-ticket"
      style={{
        width: 500,
        background: "#0f172a",
        border: `2px solid ${tierColor}`,
        borderRadius: 12,
        fontFamily: "'Courier New', monospace",
        color: "#e2e8f0",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <style>{`
        @media print {
          .printable-ticket {
            break-inside: avoid;
            page-break-inside: avoid;
            color: #000 !important;
            background: #fff !important;
            border: 2px solid ${tierColor} !important;
          }
        }
      `}</style>

      {/* Header band */}
      <div
        style={{
          background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}10)`,
          borderBottom: `1px solid ${tierColor}40`,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: tierColor, textTransform: "uppercase" }}>
            TMI Platform Official Ticket
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{venueName}</div>
        </div>
        <div
          style={{
            background: `${tierColor}25`,
            border: `1px solid ${tierColor}50`,
            color: tierColor,
            padding: "4px 14px",
            borderRadius: 16,
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {ticket.tier.replace(/_/g, " ")}
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#e2e8f0", marginBottom: 4 }}>{eventName}</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
          {eventDate} at {eventTime}
          {venueAddress && ` — ${venueAddress}`}
        </div>

        {/* Seat info */}
        <div style={{ display: "flex", gap: 20, marginBottom: 16, padding: "10px 14px", background: "rgba(51,65,85,0.3)", borderRadius: 8 }}>
          {[
            { label: "Section", value: ticket.seatSection },
            { label: "Row", value: ticket.seatRow },
            { label: "Seat", value: ticket.seatNumber },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: tierColor }}>{item.value}</div>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>Holder</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{ticket.holderName}</div>
          </div>
        </div>

        {/* Barcode area */}
        <div
          style={{
            borderTop: "1px dashed rgba(51,65,85,0.7)",
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            {/* Simulated barcode lines */}
            <div style={{ display: "flex", gap: 1, height: 40, alignItems: "flex-end", marginBottom: 4 }}>
              {ticket.barcodeValue.split("").map((ch, i) => (
                <div
                  key={i}
                  style={{
                    width: 2,
                    height: 20 + (ch.charCodeAt(0) % 3) * 8,
                    background: "#e2e8f0",
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>{ticket.barcodeValue}</div>
          </div>

          {/* QR placeholder */}
          <div
            style={{
              width: 60,
              height: 60,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: "#64748b",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            QR<br />{ticket.qrValue.slice(0, 6)}
          </div>
        </div>

        <div style={{ fontSize: 9, color: "#475569", marginTop: 8 }}>
          Ticket ID: {ticket.ticketId} | Not transferable without venue authorization | This ticket must be presented at entry
        </div>
      </div>
    </div>
  );
}
