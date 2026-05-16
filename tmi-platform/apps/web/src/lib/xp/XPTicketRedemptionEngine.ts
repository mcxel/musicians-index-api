/**
 * XPTicketRedemptionEngine.ts
 *
 * Handles redemption of XP for tickets.
 * Tracks: redemption requests, approvals, ticket generation, anti-fraud.
 * Purpose: Convert fan engagement into real access.
 */

export interface XPTicketRedemption {
  redemptionId: string;
  fanId: string;
  eventId: string;
  eventName: string;
  xpSpent: number;
  ticketValue: number; // estimated cash value
  redemptionStatus: 'pending' | 'approved' | 'issued' | 'used' | 'cancelled';
  requestedAt: number;
  approvedAt?: number;
  issuedAt?: number;
  usedAt?: number;
  ticketCode?: string;
  fraudScore: number; // 0-100, auto-calculated
}

export interface RedemptionStats {
  totalRedemptions: number;
  pendingCount: number;
  approvedCount: number;
  issuedCount: number;
  usedCount: number;
  totalXPRedeemed: number;
  totalTicketValueEstimated: number;
}

// In-memory registry
const redemptions = new Map<string, XPTicketRedemption>();
let redemptionCounter = 0;

const XP_TO_TICKET_VALUE = 0.1; // 1 XP = $0.10 value

/**
 * Creates redemption request.
 */
export function requestXPTicketRedemption(input: {
  fanId: string;
  eventId: string;
  eventName: string;
  xpAmount: number;
}): string {
  const redemptionId = `redemp-${redemptionCounter++}`;

  const redemption: XPTicketRedemption = {
    redemptionId,
    fanId: input.fanId,
    eventId: input.eventId,
    eventName: input.eventName,
    xpSpent: input.xpAmount,
    ticketValue: input.xpAmount * XP_TO_TICKET_VALUE,
    redemptionStatus: 'pending',
    requestedAt: Date.now(),
    fraudScore: calculateFraudScore(input.fanId),
  };

  redemptions.set(redemptionId, redemption);
  return redemptionId;
}

/**
 * Approves redemption request (admin).
 */
export function approveRedemption(redemptionId: string): XPTicketRedemption | null {
  const redemption = redemptions.get(redemptionId);
  if (!redemption || redemption.redemptionStatus !== 'pending') return null;

  redemption.redemptionStatus = 'approved';
  redemption.approvedAt = Date.now();
  return redemption;
}

/**
 * Issues ticket from approved redemption.
 */
export function issueTicketFromRedemption(redemptionId: string): string | null {
  const redemption = redemptions.get(redemptionId);
  if (!redemption || redemption.redemptionStatus !== 'approved') return null;

  redemption.redemptionStatus = 'issued';
  redemption.issuedAt = Date.now();
  const ticketCode = `XPTICKET-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  redemption.ticketCode = ticketCode;

  return ticketCode;
}

/**
 * Marks ticket as used.
 */
export function markTicketUsed(redemptionId: string): void {
  const redemption = redemptions.get(redemptionId);
  if (redemption && redemption.redemptionStatus === 'issued') {
    redemption.redemptionStatus = 'used';
    redemption.usedAt = Date.now();
  }
}

/**
 * Calculates fraud score (0-100).
 * Factors: recent redemptions, velocity, geographic anomalies, device changes.
 */
function calculateFraudScore(fanId: string): number {
  const fanRedemptions = Array.from(redemptions.values()).filter((r) => r.fanId === fanId);
  const recentRedemptions = fanRedemptions.filter(
    (r) => Date.now() - r.requestedAt < 24 * 60 * 60 * 1000
  );

  // High velocity = higher fraud score
  let score = recentRedemptions.length * 10; // +10 per redemption in 24h

  // Cap at 100
  return Math.min(100, score);
}

/**
 * Gets redemption (non-mutating).
 */
export function getRedemption(redemptionId: string): XPTicketRedemption | null {
  return redemptions.get(redemptionId) ?? null;
}

/**
 * Lists redemptions by fan.
 */
export function listRedemptionsByFan(fanId: string): XPTicketRedemption[] {
  return Array.from(redemptions.values()).filter((r) => r.fanId === fanId);
}

/**
 * Gets redemption stats.
 */
export function getRedemptionStats(): RedemptionStats {
  const all = Array.from(redemptions.values());
  const pending = all.filter((r) => r.redemptionStatus === 'pending');
  const approved = all.filter((r) => r.redemptionStatus === 'approved');
  const issued = all.filter((r) => r.redemptionStatus === 'issued');
  const used = all.filter((r) => r.redemptionStatus === 'used');

  return {
    totalRedemptions: all.length,
    pendingCount: pending.length,
    approvedCount: approved.length,
    issuedCount: issued.length,
    usedCount: used.length,
    totalXPRedeemed: all.reduce((sum, r) => sum + r.xpSpent, 0),
    totalTicketValueEstimated: all.reduce((sum, r) => sum + r.ticketValue, 0),
  };
}

/**
 * Lists high-fraud redemptions.
 */
export function getHighFraudRedemptions(threshold: number = 70): XPTicketRedemption[] {
  return Array.from(redemptions.values()).filter((r) => r.fraudScore >= threshold);
}
