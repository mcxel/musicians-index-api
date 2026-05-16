"use client";

import React, { useMemo, useState } from "react";
import type { PhysicalTicket, PrintBatch, PrintFormat } from "@/lib/tickets/BrickAndMortarTicketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";
import { PrintableVenueTicket } from "@/components/tickets/PrintableVenueTicket";

interface TicketBatchPrintPanelProps {
  batch: PrintBatch;
  onAddTicket?: (input: {
    tier: TicketTier;
    holderName: string;
    seatSection: string;
    seatRow: string;
    seatNumber: string;
    printFormat: PrintFormat;
  }) => void;
  onMarkPrinted?: (ticketId: string) => void;
  onVoidTicket?: (ticketId: string, reason: string) => void;
}

const TIER_OPTIONS: TicketTier[] = [
  "VIP",
  "STANDARD",
  "BACKSTAGE",
  "MEET_AND_GREET",
  "SPONSOR_GIFT",
  "SEASON_PASS",
  "BATTLE_PASS",
  "RAFFLE_PASS",
];

const FORMAT_OPTIONS: PrintFormat[] = ["A4", "thermal_80mm", "ticket_stub_100x50", "full_page_letter"];

export function TicketBatchPrintPanel({ batch, onAddTicket, onMarkPrinted, onVoidTicket }: TicketBatchPrintPanelProps) {
  const [holderName, setHolderName] = useState("");
  const [seatSection, setSeatSection] = useState("A");
  const [seatRow, setSeatRow] = useState("1");
  const [seatNumber, setSeatNumber] = useState("1");
  const [tier, setTier] = useState<TicketTier>("STANDARD");
  const [printFormat, setPrintFormat] = useState<PrintFormat>("A4");
  const [previewTicketId, setPreviewTicketId] = useState<string | null>(batch.tickets[0]?.ticketId ?? null);

  const previewTicket: PhysicalTicket | null = useMemo(
    () => batch.tickets.find((ticket) => ticket.ticketId === previewTicketId) ?? null,
    [batch.tickets, previewTicketId],
  );

  return (
    <div
      style={{
        background: "rgba(2,6,23,0.96)",
        border: "1px solid rgba(51,65,85,0.6)",
        borderRadius: 16,
        padding: 16,
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 14,
      }}
    >
      <section style={{ border: "1px solid rgba(51,65,85,0.4)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Batch Builder</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Holder Name" style={inputStyle} />
          <select value={tier} onChange={(e) => setTier(e.target.value as TicketTier)} style={inputStyle}>
            {TIER_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <input value={seatSection} onChange={(e) => setSeatSection(e.target.value)} placeholder="Section" style={inputStyle} />
          <input value={seatRow} onChange={(e) => setSeatRow(e.target.value)} placeholder="Row" style={inputStyle} />
          <input value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} placeholder="Seat" style={inputStyle} />
          <select value={printFormat} onChange={(e) => setPrintFormat(e.target.value as PrintFormat)} style={inputStyle}>
            {FORMAT_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!holderName.trim()) return;
            onAddTicket?.({
              tier,
              holderName: holderName.trim(),
              seatSection,
              seatRow,
              seatNumber,
              printFormat,
            });
            setHolderName("");
          }}
          style={{
            marginTop: 10,
            width: "100%",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            padding: "10px 12px",
            color: "#0f172a",
            background: "linear-gradient(135deg,#00ffff,#34d399)",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          Add Ticket To Batch
        </button>

        <div style={{ marginTop: 12, borderTop: "1px solid rgba(51,65,85,0.4)", paddingTop: 10 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
            {batch.venueSlug} / {batch.eventSlug} | {batch.printedCount} printed of {batch.totalCount}
          </div>

          <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {batch.tickets.map((ticket) => (
              <div
                key={ticket.ticketId}
                style={{
                  border: "1px solid rgba(51,65,85,0.5)",
                  borderRadius: 9,
                  padding: "8px 10px",
                  background: previewTicketId === ticket.ticketId ? "rgba(15,23,42,0.95)" : "rgba(15,23,42,0.6)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPreviewTicketId(ticket.ticketId)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e2e8f0",
                      cursor: "pointer",
                      textAlign: "left",
                      padding: 0,
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{ticket.holderName}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      {ticket.tier} | {ticket.seatSection}-{ticket.seatRow}-{ticket.seatNumber} | {ticket.status}
                    </div>
                  </button>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" onClick={() => onMarkPrinted?.(ticket.ticketId)} style={tinyButtonStyle}>Print</button>
                    <button type="button" onClick={() => onVoidTicket?.(ticket.ticketId, "manual void") } style={{ ...tinyButtonStyle, color: "#fca5a5", borderColor: "rgba(239,68,68,0.5)" }}>
                      Void
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {batch.tickets.length === 0 && <div style={{ fontSize: 12, color: "#64748b" }}>No tickets in this batch yet.</div>}
          </div>
        </div>
      </section>

      <section style={{ border: "1px solid rgba(51,65,85,0.4)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Print Preview</div>
        {previewTicket ? (
          <div style={{ transform: "scale(0.82)", transformOrigin: "top left", width: 500, height: 420, overflow: "hidden" }}>
            <PrintableVenueTicket
              ticket={previewTicket}
              venueName={batch.venueSlug.toUpperCase()}
              eventName={batch.eventSlug.replace(/-/g, " ")}
              eventDate={new Date().toLocaleDateString()}
              eventTime={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            />
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 12 }}>Select a ticket to preview.</div>
        )}
      </section>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid rgba(51,65,85,0.5)",
  background: "rgba(15,23,42,0.85)",
  color: "#e2e8f0",
  fontSize: 12,
  padding: "8px 10px",
};

const tinyButtonStyle: React.CSSProperties = {
  borderRadius: 8,
  border: "1px solid rgba(51,65,85,0.6)",
  background: "rgba(15,23,42,0.9)",
  color: "#93c5fd",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  padding: "4px 8px",
};
