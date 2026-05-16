"use client";

import React, { useMemo, useState } from "react";
import { TicketBatchPrintPanel } from "@/components/tickets/TicketBatchPrintPanel";
import { brickAndMortarTicketEngine, type PrintBatch, type PrintFormat } from "@/lib/tickets/BrickAndMortarTicketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";

export default function TicketPrintBatchPage() {
  const [version, setVersion] = useState(0);
  const [batchId] = useState(() => {
    const batch = brickAndMortarTicketEngine.createPrintBatch("venue-downtown", "summer-crown-showdown");
    return batch.batchId;
  });

  const batch: PrintBatch = useMemo(
    () => brickAndMortarTicketEngine.getBatch(batchId) ?? brickAndMortarTicketEngine.createPrintBatch("venue-downtown", "summer-crown-showdown"),
    [batchId, version],
  );

  const refresh = () => setVersion((prev) => prev + 1);

  return (
    <main style={{ minHeight: "100vh", background: "#030712", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Venue Ticket Batch Printing</h1>
        <p style={{ marginTop: 0, color: "#94a3b8", fontSize: 13 }}>
          Brick-and-mortar flow for adding seats, printing individual tickets, and previewing venue output.
        </p>

        <TicketBatchPrintPanel
          batch={batch}
          onAddTicket={(input: {
            tier: TicketTier;
            holderName: string;
            seatSection: string;
            seatRow: string;
            seatNumber: string;
            printFormat: PrintFormat;
          }) => {
            brickAndMortarTicketEngine.addTicketToBatch(batch.batchId, {
              ticketId: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              tier: input.tier,
              holderName: input.holderName,
              seatSection: input.seatSection,
              seatRow: input.seatRow,
              seatNumber: input.seatNumber,
              barcodeValue: `BC-${Date.now().toString().slice(-8)}-${input.seatSection}${input.seatRow}${input.seatNumber}`,
              qrValue: `QR-${Date.now()}-${input.holderName}`,
              printFormat: input.printFormat,
            });
            refresh();
          }}
          onMarkPrinted={(ticketId: string) => {
            brickAndMortarTicketEngine.markPrinted(batch.batchId, ticketId);
            refresh();
          }}
          onVoidTicket={(ticketId: string, reason: string) => {
            brickAndMortarTicketEngine.voidTicket(batch.batchId, ticketId, reason);
            refresh();
          }}
        />
      </div>
    </main>
  );
}
