/**
 * BrickAndMortarTicketEngine
 * Physical venue ticket generation + print flow.
 * Connects digital ticket records to printable PDFs for brick-and-mortar venues.
 */
import type { TicketTier } from "./ticketCore";

export type PhysicalTicketStatus =
  | "pending_print"
  | "queued"
  | "printed"
  | "delivered"
  | "scanned"
  | "voided";

export type PrintFormat = "A4" | "thermal_80mm" | "ticket_stub_100x50" | "full_page_letter";

export type PhysicalTicket = {
  ticketId: string;
  printJobId: string;
  venueSlug: string;
  eventSlug: string;
  tier: TicketTier;
  holderName: string;
  seatSection: string;
  seatRow: string;
  seatNumber: string;
  barcodeValue: string;
  qrValue: string;
  printFormat: PrintFormat;
  printedAtMs: number | null;
  status: PhysicalTicketStatus;
  printCount: number;
  voidReason?: string;
};

export type PrintBatch = {
  batchId: string;
  venueSlug: string;
  eventSlug: string;
  tickets: PhysicalTicket[];
  createdAtMs: number;
  completedAtMs: number | null;
  totalCount: number;
  printedCount: number;
};

let _printJobSeq = 0;

export class BrickAndMortarTicketEngine {
  private readonly batches: Map<string, PrintBatch> = new Map();

  createPrintBatch(venueSlug: string, eventSlug: string): PrintBatch {
    const batchId = `batch-${venueSlug}-${Date.now()}-${++_printJobSeq}`;
    const batch: PrintBatch = {
      batchId,
      venueSlug,
      eventSlug,
      tickets: [],
      createdAtMs: Date.now(),
      completedAtMs: null,
      totalCount: 0,
      printedCount: 0,
    };
    this.batches.set(batchId, batch);
    return batch;
  }

  addTicketToBatch(
    batchId: string,
    params: {
      ticketId: string;
      tier: TicketTier;
      holderName: string;
      seatSection: string;
      seatRow: string;
      seatNumber: string;
      barcodeValue: string;
      qrValue: string;
      printFormat: PrintFormat;
    },
  ): PhysicalTicket | null {
    const batch = this.batches.get(batchId);
    if (!batch) return null;

    const ticket: PhysicalTicket = {
      ticketId: params.ticketId,
      printJobId: `pjob-${params.ticketId}`,
      venueSlug: batch.venueSlug,
      eventSlug: batch.eventSlug,
      tier: params.tier,
      holderName: params.holderName,
      seatSection: params.seatSection,
      seatRow: params.seatRow,
      seatNumber: params.seatNumber,
      barcodeValue: params.barcodeValue,
      qrValue: params.qrValue,
      printFormat: params.printFormat,
      printedAtMs: null,
      status: "pending_print",
      printCount: 0,
    };

    batch.tickets.push(ticket);
    batch.totalCount = batch.tickets.length;
    return ticket;
  }

  markPrinted(batchId: string, ticketId: string): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;
    const ticket = batch.tickets.find((t) => t.ticketId === ticketId);
    if (!ticket) return;
    ticket.status = "printed";
    ticket.printedAtMs = Date.now();
    ticket.printCount += 1;
    batch.printedCount = batch.tickets.filter((t) => t.status === "printed").length;
  }

  voidTicket(batchId: string, ticketId: string, reason: string): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;
    const ticket = batch.tickets.find((t) => t.ticketId === ticketId);
    if (!ticket) return;
    ticket.status = "voided";
    ticket.voidReason = reason;
  }

  completeBatch(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;
    batch.completedAtMs = Date.now();
    // Move remaining pending_print to queued
    for (const t of batch.tickets) {
      if (t.status === "pending_print") t.status = "queued";
    }
  }

  getBatch(batchId: string): PrintBatch | null {
    return this.batches.get(batchId) ?? null;
  }

  getPendingTickets(batchId: string): PhysicalTicket[] {
    return this.batches.get(batchId)?.tickets.filter((t) => t.status === "pending_print" || t.status === "queued") ?? [];
  }
}

export const brickAndMortarTicketEngine = new BrickAndMortarTicketEngine();
