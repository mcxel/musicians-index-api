// TICKET QR VALIDATION ENGINE — Entry Verification & Scanning
// Purpose: Validate QR codes and ticket ownership at venue entry points
// Prevents duplicate entry and fraudulent ticket use

import { randomUUID } from 'crypto';

export interface QRValidation {
  id: string;
  ticketId: string;
  qrCode: string;
  venueId: string;
  scannedAt: string;
  scannedBy: string; // staff user ID
  validationStatus: 'valid' | 'invalid' | 'already_used' | 'expired' | 'revoked';
  reason: string;
  userId?: string;
  userName?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface EntryPoint {
  id: string;
  venueId: string;
  name: string;
  createdAt: string;
}

export interface VenueEntryStats {
  venueId: string;
  totalEntries: number;
  successfulEntries: number;
  failedEntries: number;
  duplicateAttempts: number;
  todayEntries: number;
}

// Validation log (ticketId → array of validations)
const VALIDATION_LOG = new Map<string, QRValidation[]>();

// Entry points (id → entry point)
const ENTRY_POINTS = new Map<string, EntryPoint>();

// Checked-in users (ticketId → checkout time, or null if still inside)
const ACTIVE_ENTRIES = new Map<string, { checkedInAt: string; checkOutAt?: string }>();

// Used tickets (ticketId → first validation)
const USED_TICKETS = new Set<string>();

export class TicketQRValidationEngine {
  /**
   * Scan and validate QR code at entry
   */
  static async validateQRAtEntry(
    qrCodeData: string,
    venueId: string,
    entryPointId: string,
    staffUserId: string
  ): Promise<QRValidation> {
    // Parse QR code format: TICKET:ticketId:venueId:ownerId
    const parts = qrCodeData.split(':');
    if (parts[0] !== 'TICKET' || parts.length < 4) {
      return this.createValidation(
        'invalid-qr',
        '',
        qrCodeData,
        venueId,
        staffUserId,
        'invalid',
        'QR code format invalid'
      );
    }

    const ticketId = parts[1];
    const qrVenueId = parts[2];
    const ownerId = parts[3];

    // Verify venue match
    if (qrVenueId !== venueId) {
      return this.createValidation(
        ticketId,
        qrCodeData,
        qrCodeData,
        venueId,
        staffUserId,
        'invalid',
        `QR code venue mismatch: ${qrVenueId} != ${venueId}`
      );
    }

    // Check if already used
    if (USED_TICKETS.has(ticketId)) {
      return this.createValidation(
        ticketId,
        qrCodeData,
        qrCodeData,
        venueId,
        staffUserId,
        'already_used',
        'Ticket already scanned at entry'
      );
    }

    // Check if still checked in
    if (ACTIVE_ENTRIES.has(ticketId) && !ACTIVE_ENTRIES.get(ticketId)!.checkOutAt) {
      return this.createValidation(
        ticketId,
        qrCodeData,
        qrCodeData,
        venueId,
        staffUserId,
        'already_used',
        'Ticket holder already inside venue'
      );
    }

    // Mark as used
    USED_TICKETS.add(ticketId);

    // Create check-in entry
    ACTIVE_ENTRIES.set(ticketId, { checkedInAt: new Date().toISOString() });

    // Create validation record
    const validation = this.createValidation(
      ticketId,
      qrCodeData,
      qrCodeData,
      venueId,
      staffUserId,
      'valid',
      'Entry approved',
      ownerId
    );

    // Log validation
    if (!VALIDATION_LOG.has(ticketId)) {
      VALIDATION_LOG.set(ticketId, []);
    }
    VALIDATION_LOG.get(ticketId)!.push(validation);

    return validation;
  }

  /**
   * Check out ticket holder (exit venue)
   */
  static async checkOut(ticketId: string): Promise<void> {
    const entry = ACTIVE_ENTRIES.get(ticketId);
    if (entry) {
      entry.checkOutAt = new Date().toISOString();
    }
  }

  /**
   * Manual ticket validation (admin/staff override)
   */
  static async manualValidate(
    ticketId: string,
    venueId: string,
    staffUserId: string,
    reason: string
  ): Promise<QRValidation> {
    const validation = this.createValidation(
      ticketId,
      `MANUAL:${ticketId}`,
      `MANUAL:${ticketId}`,
      venueId,
      staffUserId,
      'valid',
      `Manual override: ${reason}`
    );

    USED_TICKETS.add(ticketId);
    ACTIVE_ENTRIES.set(ticketId, { checkedInAt: new Date().toISOString() });

    if (!VALIDATION_LOG.has(ticketId)) {
      VALIDATION_LOG.set(ticketId, []);
    }
    VALIDATION_LOG.get(ticketId)!.push(validation);

    return validation;
  }

  /**
   * Invalidate ticket (revoke entry)
   */
  static async invalidateTicket(
    ticketId: string,
    staffUserId: string,
    reason: string
  ): Promise<void> {
    const entry = ACTIVE_ENTRIES.get(ticketId);
    if (entry && !entry.checkOutAt) {
      entry.checkOutAt = new Date().toISOString();
    }

    // Mark as revoked in validation log
    const validations = VALIDATION_LOG.get(ticketId);
    if (validations && validations.length > 0) {
      const lastValidation = validations[validations.length - 1];
      lastValidation.validationStatus = 'revoked';
    }
  }

  /**
   * Get validation history for ticket
   */
  static async getValidationHistory(ticketId: string): Promise<QRValidation[]> {
    return VALIDATION_LOG.get(ticketId) || [];
  }

  /**
   * Check if ticket has been used
   */
  static async isTicketUsed(ticketId: string): Promise<boolean> {
    return USED_TICKETS.has(ticketId);
  }

  /**
   * Check if holder is currently inside venue
   */
  static async isCurrentlyInside(ticketId: string): Promise<boolean> {
    const entry = ACTIVE_ENTRIES.get(ticketId);
    return entry !== undefined && !entry.checkOutAt;
  }

  /**
   * Get entry statistics for venue
   */
  static async getVenueStats(venueId: string): Promise<VenueEntryStats> {
    let totalEntries = 0;
    let successfulEntries = 0;
    let failedEntries = 0;
    let duplicateAttempts = 0;
    let todayEntries = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    VALIDATION_LOG.forEach((validations) => {
      validations.forEach((v) => {
        if (v.venueId !== venueId) return;

        totalEntries += 1;

        if (v.validationStatus === 'valid') {
          successfulEntries += 1;
        } else if (v.validationStatus === 'invalid' || v.validationStatus === 'expired') {
          failedEntries += 1;
        } else if (v.validationStatus === 'already_used') {
          duplicateAttempts += 1;
        }

        if (new Date(v.scannedAt) >= today) {
          todayEntries += 1;
        }
      });
    });

    return {
      venueId,
      totalEntries,
      successfulEntries,
      failedEntries,
      duplicateAttempts,
      todayEntries,
    };
  }

  /**
   * Create entry point
   */
  static async createEntryPoint(venueId: string, name: string): Promise<EntryPoint> {
    const entryPoint: EntryPoint = {
      id: randomUUID(),
      venueId,
      name,
      createdAt: new Date().toISOString(),
    };

    ENTRY_POINTS.set(entryPoint.id, entryPoint);

    return entryPoint;
  }

  /**
   * Get entry points for venue
   */
  static async getEntryPoints(venueId: string): Promise<EntryPoint[]> {
    return Array.from(ENTRY_POINTS.values()).filter((ep) => ep.venueId === venueId);
  }

  /**
   * Get current occupancy (people inside)
   */
  static async getCurrentOccupancy(venueId: string): Promise<number> {
    let count = 0;

    ACTIVE_ENTRIES.forEach((entry) => {
      if (!entry.checkOutAt) {
        count += 1;
      }
    });

    return count;
  }

  /**
   * Create validation record (internal utility)
   */
  private static createValidation(
    ticketId: string,
    qrCode: string,
    qrCodeData: string,
    venueId: string,
    staffUserId: string,
    status: 'valid' | 'invalid' | 'already_used' | 'expired' | 'revoked',
    reason: string,
    userId?: string
  ): QRValidation {
    return {
      id: randomUUID(),
      ticketId,
      qrCode: qrCodeData,
      venueId,
      scannedAt: new Date().toISOString(),
      scannedBy: staffUserId,
      validationStatus: status,
      reason,
      userId,
    };
  }

  /**
   * Generate report (admin)
   */
  static async generateReport(venueId: string, startDate: string, endDate: string): Promise<{
    period: string;
    stats: VenueEntryStats;
    topTickets: Array<{ ticketId: string; scanCount: number }>;
    fraudAttempts: number;
  }> {
    const stats = await this.getVenueStats(venueId);

    // Get top tickets by scan count
    const ticketScans = new Map<string, number>();
    VALIDATION_LOG.forEach((validations) => {
      validations.forEach((v) => {
        if (v.venueId === venueId && new Date(v.scannedAt) >= new Date(startDate) && new Date(v.scannedAt) <= new Date(endDate)) {
          ticketScans.set(v.ticketId, (ticketScans.get(v.ticketId) || 0) + 1);
        }
      });
    });

    const topTickets = Array.from(ticketScans.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ticketId, count]) => ({ ticketId, scanCount: count }));

    const fraudAttempts = Array.from(VALIDATION_LOG.values()).reduce((sum, validations) => {
      return (
        sum +
        validations.filter(
          (v) =>
            v.venueId === venueId &&
            (v.validationStatus === 'invalid' || v.validationStatus === 'already_used')
        ).length
      );
    }, 0);

    return {
      period: `${startDate} to ${endDate}`,
      stats,
      topTickets,
      fraudAttempts,
    };
  }
}

export default TicketQRValidationEngine;
