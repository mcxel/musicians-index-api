// TICKET PRINT ENGINE — Printable Ticket Generation
// Purpose: Generate printable ticket formats with ownership and venue data
// Supports PDF generation, barcode embedding, and ticket metadata

import { randomUUID } from 'crypto';

export interface PrintableTicket {
  id: string;
  ticketNumber: string;
  venueId: string;
  venueName: string;
  ownerId: string;
  ownerName: string;
  eventName: string;
  eventDate: string;
  seatNumber?: string;
  section?: string;
  tier: 'general' | 'vip' | 'premium' | 'front-row';
  qrCode: string; // QR data string
  barcode: string; // Barcode representation
  printableUrl?: string; // URL to printable PDF
  generatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  isPrinted: boolean;
  printedAt?: string;
}

export interface TicketFormat {
  format: 'PDF' | 'PNG' | 'QR_ONLY';
  pageSize: 'A4' | 'LETTER' | 'TICKET';
  includeVenueInfo: boolean;
  includeBranding: boolean;
  includeOwnerInfo: boolean;
}

export interface TicketBatch {
  id: string;
  venueId: string;
  eventId: string;
  generatedAt: string;
  ticketCount: number;
  printedCount: number;
}

// Ticket registry
const TICKETS = new Map<string, PrintableTicket>();

// Batch tracking
const BATCHES = new Map<string, TicketBatch>();

// Print log (ticketId → print timestamp)
const PRINT_LOG = new Map<string, string[]>();

export class TicketPrintEngine {
  /**
   * Generate printable ticket
   */
  static async generatePrintableTicket(
    venueId: string,
    venueName: string,
    ownerId: string,
    ownerName: string,
    eventName: string,
    eventDate: string,
    tier: 'general' | 'vip' | 'premium' | 'front-row',
    options?: {
      seatNumber?: string;
      section?: string;
      expiresAt?: string;
    }
  ): Promise<PrintableTicket> {
    const ticketId = randomUUID();
    const ticketNumber = this.generateTicketNumber(venueId);
    const qrCode = `TICKET:${ticketId}:${venueId}:${ownerId}`;

    const ticket: PrintableTicket = {
      id: ticketId,
      ticketNumber,
      venueId,
      venueName,
      ownerId,
      ownerName,
      eventName,
      eventDate,
      seatNumber: options?.seatNumber,
      section: options?.section,
      tier,
      qrCode,
      barcode: this.generateBarcode(ticketNumber),
      generatedAt: new Date().toISOString(),
      expiresAt: options?.expiresAt,
      isActive: true,
      isPrinted: false,
    };

    TICKETS.set(ticketId, ticket);

    return ticket;
  }

  /**
   * Generate batch of tickets
   */
  static async generateBatch(
    venueId: string,
    venueName: string,
    eventId: string,
    eventName: string,
    eventDate: string,
    count: number,
    tier: 'general' | 'vip' | 'premium' | 'front-row'
  ): Promise<TicketBatch> {
    const batchId = randomUUID();

    // Generate individual tickets for batch
    const ticketIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const ticket = await this.generatePrintableTicket(
        venueId,
        venueName,
        `batch-${batchId}-${i}`,
        `Unassigned`,
        eventName,
        eventDate,
        tier
      );
      ticketIds.push(ticket.id);
    }

    const batch: TicketBatch = {
      id: batchId,
      venueId,
      eventId,
      generatedAt: new Date().toISOString(),
      ticketCount: count,
      printedCount: 0,
    };

    BATCHES.set(batchId, batch);

    return batch;
  }

  /**
   * Generate printable format (PDF data)
   */
  static async generatePrintableFormat(
    ticketId: string,
    format: TicketFormat
  ): Promise<{ html: string; format: string }> {
    const ticket = TICKETS.get(ticketId);
    if (!ticket) {
      return { html: '', format: 'ERROR' };
    }

    // Generate HTML for printable format
    const html = this.buildPrintableHTML(ticket, format);

    return {
      html,
      format: format.format,
    };
  }

  /**
   * Mark ticket as printed
   */
  static async markPrinted(ticketId: string): Promise<void> {
    const ticket = TICKETS.get(ticketId);
    if (ticket && !ticket.isPrinted) {
      ticket.isPrinted = true;
      ticket.printedAt = new Date().toISOString();

      // Log print
      if (!PRINT_LOG.has(ticketId)) {
        PRINT_LOG.set(ticketId, []);
      }
      PRINT_LOG.get(ticketId)!.push(new Date().toISOString());
    }
  }

  /**
   * Get ticket for printing
   */
  static async getTicket(ticketId: string): Promise<PrintableTicket | null> {
    return TICKETS.get(ticketId) || null;
  }

  /**
   * Verify ticket is still valid for entry
   */
  static async isTicketValid(ticketId: string): Promise<boolean> {
    const ticket = TICKETS.get(ticketId);
    if (!ticket) return false;

    // Check active status
    if (!ticket.isActive) return false;

    // Check expiration
    if (ticket.expiresAt && new Date(ticket.expiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Revoke ticket (invalidate)
   */
  static async revokeTicket(ticketId: string): Promise<void> {
    const ticket = TICKETS.get(ticketId);
    if (ticket) {
      ticket.isActive = false;
    }
  }

  /**
   * Transfer ticket ownership
   */
  static async transferOwnership(
    ticketId: string,
    newOwnerId: string,
    newOwnerName: string
  ): Promise<void> {
    const ticket = TICKETS.get(ticketId);
    if (ticket) {
      ticket.ownerId = newOwnerId;
      ticket.ownerName = newOwnerName;
      ticket.isPrinted = false; // Require reprint after transfer
      ticket.printedAt = undefined;
    }
  }

  /**
   * Get all tickets for owner
   */
  static async getTicketsByOwner(ownerId: string): Promise<PrintableTicket[]> {
    return Array.from(TICKETS.values()).filter(
      (t) => t.ownerId === ownerId && t.isActive
    );
  }

  /**
   * Get tickets for venue (admin)
   */
  static async getTicketsByVenue(venueId: string): Promise<PrintableTicket[]> {
    return Array.from(TICKETS.values()).filter((t) => t.venueId === venueId);
  }

  /**
   * Get batch details
   */
  static async getBatch(batchId: string): Promise<TicketBatch | null> {
    return BATCHES.get(batchId) || null;
  }

  /**
   * Generate ticket number (sequential format)
   */
  private static generateTicketNumber(venueId: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${venueId.substring(0, 3).toUpperCase()}-${timestamp}-${random}`;
  }

  /**
   * Generate barcode representation
   */
  private static generateBarcode(ticketNumber: string): string {
    // Simplified barcode (in production: generate Code128 or QR)
    return `||${ticketNumber.replace(/[^0-9]/g, '')}||`;
  }

  /**
   * Build printable HTML
   */
  private static buildPrintableHTML(ticket: PrintableTicket, format: TicketFormat): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ticket - ${ticket.ticketNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .ticket { 
            border: 2px solid #000; 
            padding: 20px; 
            max-width: 400px;
            background: #f9f9f9;
          }
          .header { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .venue { font-size: 18px; color: #333; margin: 5px 0; }
          .details { font-size: 12px; margin: 10px 0; line-height: 1.6; }
          .qr { text-align: center; margin: 20px 0; }
          .barcode { text-align: center; font-family: monospace; font-size: 20px; }
          .owner { font-weight: bold; margin: 10px 0; }
          .footer { font-size: 10px; color: #666; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="ticket">
          ${format.includeBranding ? `<div class="header">${ticket.venueName}</div>` : ''}
          <div class="venue">${ticket.eventName}</div>
          <div class="details">
            <strong>Date:</strong> ${ticket.eventDate}<br>
            ${ticket.seatNumber ? `<strong>Seat:</strong> ${ticket.seatNumber}<br>` : ''}
            ${ticket.section ? `<strong>Section:</strong> ${ticket.section}<br>` : ''}
            <strong>Tier:</strong> ${ticket.tier.toUpperCase()}<br>
            <strong>Ticket #:</strong> ${ticket.ticketNumber}
          </div>
          ${format.includeOwnerInfo ? `<div class="owner">For: ${ticket.ownerName}</div>` : ''}
          <div class="qr">QR Code: ${ticket.qrCode}</div>
          <div class="barcode">${ticket.barcode}</div>
          <div class="footer">Generated: ${new Date(ticket.generatedAt).toLocaleDateString()}</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get print history for ticket
   */
  static async getPrintHistory(ticketId: string): Promise<string[]> {
    return PRINT_LOG.get(ticketId) || [];
  }

  /**
   * Get ticket statistics (admin)
   */
  static async getStats(venueId?: string): Promise<{
    totalTickets: number;
    printedCount: number;
    activeCount: number;
    revokedCount: number;
  }> {
    let tickets = Array.from(TICKETS.values());

    if (venueId) {
      tickets = tickets.filter((t) => t.venueId === venueId);
    }

    const printedCount = tickets.filter((t) => t.isPrinted).length;
    const activeCount = tickets.filter((t) => t.isActive).length;
    const revokedCount = tickets.filter((t) => !t.isActive).length;

    return {
      totalTickets: tickets.length,
      printedCount,
      activeCount,
      revokedCount,
    };
  }
}

export default TicketPrintEngine;
