"use client";

import { useState } from "react";
import { printTicket, verifyTicket } from "@/lib/tickets/ticketEngine";
import type { TicketRecord } from "@/lib/tickets/ticketCore";

type TicketPrintEngineProps = {
  ticket: TicketRecord;
  onPrinted?: () => void;
};

export default function TicketPrintEngine({ ticket, onPrinted }: TicketPrintEngineProps) {
  const [printed, setPrinted] = useState(false);
  const [verified, setVerified] = useState<{ valid: boolean; reason?: string } | null>(null);

  function handlePrint() {
    printTicket(ticket.id);
    setPrinted(true);
    onPrinted?.();
  }

  function handleVerify() {
    const result = verifyTicket(ticket.id);
    setVerified({ valid: !ticket.redeemed, reason: ticket.redeemed ? "already_redeemed" : undefined });
    void result;
  }

  const tierColor: Record<string, string> = {
    VIP:            "#fcd34d",
    STANDARD:       "#00FFFF",
    BACKSTAGE:      "#c4b5fd",
    MEET_AND_GREET: "#f97316",
    SPONSOR_GIFT:   "#22c55e",
    SEASON_PASS:    "#e879f9",
    BATTLE_PASS:    "#38bdf8",
    RAFFLE_PASS:    "#94a3b8",
  };

  const accent = tierColor[ticket.template.tier] ?? "#fcd34d";

  return (
    <article
      data-ticket-id={ticket.id}
      style={{
        border: `1px solid ${accent}44`,
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(15,10,30,0.95), rgba(3,2,11,0.98))",
        overflow: "hidden",
        maxWidth: 420,
      }}
    >
      {/* Ticket top bar */}
      <div style={{ background: `${accent}18`, borderBottom: `1px solid ${accent}44`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ color: accent, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", flex: 1 }}>
          {ticket.template.tier} TICKET
        </strong>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: ticket.redeemed ? "#ef4444" : "#22c55e",
            border: `1px solid ${ticket.redeemed ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
            borderRadius: 4,
            padding: "1px 7px",
            letterSpacing: "0.12em",
          }}
        >
          {ticket.redeemed ? "REDEEMED" : "VALID"}
        </span>
      </div>

      {/* Ticket body */}
      <div style={{ padding: 14, display: "grid", gap: 10 }}>
        {/* Event info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Event",   value: ticket.template.eventSlug  },
            { label: "Venue",   value: ticket.template.venueSlug  },
            { label: "Section", value: ticket.seat.section        },
            { label: "Row",     value: ticket.seat.row            },
            { label: "Seat",    value: ticket.seat.seat           },
            { label: "Value",   value: `$${ticket.template.faceValue}` },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ margin: 0, fontSize: 8, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* QR / Barcode visual */}
        <div style={{ border: `1px solid ${accent}33`, borderRadius: 8, padding: "10px 14px", background: "rgba(0,0,0,0.4)", display: "flex", gap: 14, alignItems: "center" }}>
          {/* QR placeholder */}
          <div style={{
            width: 56, height: 56, borderRadius: 4,
            background: `repeating-linear-gradient(45deg, ${accent}22 0, ${accent}22 4px, transparent 4px, transparent 8px)`,
            border: `1px solid ${accent}55`,
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 8, color: accent, textAlign: "center", letterSpacing: 0 }}>QR</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 8, color: "#64748b", letterSpacing: "0.08em" }}>QR VALUE</p>
            <p style={{ margin: "2px 0 6px", fontSize: 9, color: "#e2e8f0", fontFamily: "monospace", wordBreak: "break-all" }}>{ticket.barcode.qrValue}</p>
            <p style={{ margin: 0, fontSize: 8, color: "#64748b", letterSpacing: "0.08em" }}>BARCODE</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "#e2e8f0", fontFamily: "monospace" }}>{ticket.barcode.barcodeValue}</p>
          </div>
        </div>

        {/* Ticket ID */}
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 8, color: "#475569", letterSpacing: "0.14em" }}>TICKET ID</p>
          <p style={{ margin: "2px 0 0", fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{ticket.id}</p>
          <p style={{ margin: "2px 0 0", fontSize: 8, color: "#334155" }}>Issued {new Date(ticket.mintedAt).toLocaleString()}</p>
        </div>

        {/* Output formats */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {ticket.outputFormats.map((fmt) => (
            <span
              key={fmt}
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: accent,
                border: `1px solid ${accent}44`,
                borderRadius: 4,
                padding: "1px 7px",
                background: `${accent}0d`,
              }}
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Verify result */}
        {verified && (
          <div style={{
            borderRadius: 7,
            border: `1px solid ${verified.valid ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
            background: verified.valid ? "rgba(5,46,22,0.35)" : "rgba(69,10,10,0.35)",
            padding: "6px 10px",
            fontSize: 10,
            color: verified.valid ? "#86efac" : "#fca5a5",
            fontWeight: 700,
          }}>
            {verified.valid ? "✓ TICKET VERIFIED — VALID" : `✗ INVALID — ${verified.reason}`}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={handlePrint}
            disabled={printed}
            style={{
              flex: 1,
              borderRadius: 7,
              border: `1px solid ${accent}55`,
              background: printed ? "rgba(0,0,0,0.2)" : `${accent}18`,
              color: printed ? "#64748b" : accent,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "6px 0",
              cursor: printed ? "default" : "pointer",
              textTransform: "uppercase",
            }}
          >
            {printed ? "✓ PRINTED" : "PRINT TICKET"}
          </button>
          <button
            type="button"
            onClick={handleVerify}
            style={{
              flex: 1,
              borderRadius: 7,
              border: "1px solid rgba(56,189,248,0.4)",
              background: "rgba(14,116,144,0.15)",
              color: "#38bdf8",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "6px 0",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            VERIFY
          </button>
        </div>
      </div>
    </article>
  );
}
