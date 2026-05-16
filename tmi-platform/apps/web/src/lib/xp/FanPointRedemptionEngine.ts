/**
 * FanPointRedemptionEngine.ts
 *
 * Handles redemption of fan points for rewards.
 * Rewards: merchandise, emotes, profile items, season pass items.
 * Purpose: Create value exit path for points.
 */

export interface PointRedemption {
  redemptionId: string;
  fanId: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  redemptionStatus: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  requestedAt: number;
  approvedAt?: number;
  fulfilledAt?: number;
  fulfillmentCode?: string; // sent to user
}

// In-memory registry
const pointRedemptions = new Map<string, PointRedemption>();
let redemptionCounter = 0;

/**
 * Creates redemption request.
 */
export function requestPointRedemption(input: {
  fanId: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
}): string {
  const redemptionId = `predeem-${redemptionCounter++}`;

  const redemption: PointRedemption = {
    redemptionId,
    fanId: input.fanId,
    rewardId: input.rewardId,
    rewardName: input.rewardName,
    pointsCost: input.pointsCost,
    redemptionStatus: 'pending',
    requestedAt: Date.now(),
  };

  pointRedemptions.set(redemptionId, redemption);
  return redemptionId;
}

/**
 * Approves redemption.
 */
export function approvePointRedemption(redemptionId: string): PointRedemption | null {
  const redemption = pointRedemptions.get(redemptionId);
  if (!redemption || redemption.redemptionStatus !== 'pending') return null;

  redemption.redemptionStatus = 'approved';
  redemption.approvedAt = Date.now();
  return redemption;
}

/**
 * Fulfills redemption and generates code.
 */
export function fulfillPointRedemption(redemptionId: string): string | null {
  const redemption = pointRedemptions.get(redemptionId);
  if (!redemption || redemption.redemptionStatus !== 'approved') return null;

  redemption.redemptionStatus = 'fulfilled';
  redemption.fulfilledAt = Date.now();
  const fulfillmentCode = `REWARD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  redemption.fulfillmentCode = fulfillmentCode;

  return fulfillmentCode;
}

/**
 * Cancels redemption.
 */
export function cancelPointRedemption(redemptionId: string): void {
  const redemption = pointRedemptions.get(redemptionId);
  if (redemption) {
    redemption.redemptionStatus = 'cancelled';
  }
}

/**
 * Gets redemption.
 */
export function getPointRedemption(redemptionId: string): PointRedemption | null {
  return pointRedemptions.get(redemptionId) ?? null;
}

/**
 * Lists redemptions by fan.
 */
export function listRedemptionsByFan(fanId: string): PointRedemption[] {
  return Array.from(pointRedemptions.values()).filter((r) => r.fanId === fanId);
}

/**
 * Gets redemption stats.
 */
export function getRedemptionStats(): {
  totalRedemptions: number;
  pending: number;
  approved: number;
  fulfilled: number;
  cancelled: number;
  totalPointsRedeemed: number;
} {
  const all = Array.from(pointRedemptions.values());

  return {
    totalRedemptions: all.length,
    pending: all.filter((r) => r.redemptionStatus === 'pending').length,
    approved: all.filter((r) => r.redemptionStatus === 'approved').length,
    fulfilled: all.filter((r) => r.redemptionStatus === 'fulfilled').length,
    cancelled: all.filter((r) => r.redemptionStatus === 'cancelled').length,
    totalPointsRedeemed: all.reduce((sum, r) => sum + r.pointsCost, 0),
  };
}
