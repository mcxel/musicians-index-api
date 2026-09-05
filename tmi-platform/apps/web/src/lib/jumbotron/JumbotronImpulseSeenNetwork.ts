/**
 * JumbotronImpulseSeenNetwork.ts
 *
 * Master Law:
 * Jumbotron Delivery Guarantee:
 * Paid spotlight revenue is earned only after verified delivery. Any purchased spotlight
 * that is not fully delivered must automatically remain available as credit or become
 * refundable; failed or partial delivery may never be silently treated as fulfilled.
 *
 * Architectural Protections:
 * 1. SETTLEMENT_HOLD (Internal pending-settlement ledger; not regulated financial escrow).
 * 2. Preferred Inventory vs Absolute Ownership:
 *    Sponsors prefer North/South and fan spotlights prefer East/West, but the canonical
 *    Show Director may dynamically relocate or preempt either when P0 emergency, Battle
 *    score, Challenge contract, or critical show cues require it.
 * 3. Photosensitivity & Accessibility Limits:
 *    Premium/VIP tiers feature richer lighting and dynamic neon framing, but strictly
 *    adhere to WCAG photosensitivity limits (< 3 Hz flash rates, max 1.25 relative luminance,
 *    full bypass on prefers-reduced-motion).
 * 4. Venue Internal Prestige Points:
 *    Hardware tiers provide internal TMI venue prestige/loadout points and store capability tiers,
 *    not external financial or guaranteed resale valuation.
 * 5. Lounge Presence Law Intact:
 *    Fan Lobbies display canonical avatars. TMI Lounges remain strictly NO-AVATAR spaces;
 *    paid placements in Lounges use authorized live video panels or presentation profile cards.
 */

import type { JumbotronCardinalFace } from './JumbotronAdContracts';

export const IMPULSE_SEEN_FLAT_RATE_CENTS = 399; // $3.99 flat rate
export const SPOTLIGHT_SLOT_DURATION_MS = 15000; // 15 seconds
export const BULK_UPGRADE_MIN_SLOTS = 5; // 5+ slots unlocks Sparkle Glitter Tier
export const DEFAULT_PERFORMER_SPLIT_BPS = 7000; // 70% to performer, 30% to TMI platform
export const BUYER_DISCONNECT_GRACE_MS = 30000; // 30s reconnect window

export type SpotlightDeliveryOutcome = 'FULFILLED' | 'CREDITED' | 'REFUNDED';

export type SpotlightFailureReason =
  | 'ROOM_ENDED'
  | 'PERFORMER_OFFLINE'
  | 'BUYER_DISCONNECTED'
  | 'VENUE_RUNTIME_FAILURE'
  | 'NETWORK_FAILURE'
  | 'SHOW_PREEMPTION'
  | 'PLATFORM_ERROR';

export type VisualEffectTier = 'STANDARD' | 'SPARKLE_GLITTER_TIER';

export type HardwareTier = 'STANDARD' | 'VIP_PRO' | 'CHAMPIONSHIP_HYBRID';

export type SpotlightPresenceFormat = 'FAN_AVATAR' | 'LIVE_VIDEO' | 'PROFILE_CARD';

export interface SpotlightDeliveryRecord {
  entitlementId: string;
  purchaseId: string;
  participantId: string;
  participantName: string;
  roomId: string;
  venueId: string;
  performerId: string;
  slotIndexInOrder: number;
  totalSlotsInOrder: number;
  scheduledStart: string;
  scheduledStartMs: number;
  actualStart?: string;
  actualStartMs?: number;
  actualEnd?: string;
  actualEndMs?: number;
  deliveredMs: number;
  requiredMs: number; // 15000
  deliveryQualified: boolean;
  visualEffectTier: VisualEffectTier;
  assignedFace: JumbotronCardinalFace;
  preferredFace: JumbotronCardinalFace;
  facePreemptedOrRelocated: boolean;
  preemptionReason?: string;
  presenceFormat: SpotlightPresenceFormat;
  failureReason?: SpotlightFailureReason;
  resolution: SpotlightDeliveryOutcome;
  financialSettlement: {
    grossAmountCents: number; // 399
    performerShareCents: number; // 279 (70%)
    platformShareCents: number; // 120 (30%)
    settlementState: 'SETTLEMENT_HOLD' | 'PERFORMER_RELEASED' | 'REFUNDED' | 'CREDIT_ISSUED';
    settledAt?: string;
  };
}

export interface VenueJumbotronHardwareConfig {
  venueId: string;
  hardwareTier: HardwareTier;
  brightnessMultiplier: number;
  neonFlashRingsEnabled: boolean;
  underbellyPanelsEnabled: boolean;
  venuePrestigePoints: number; // TMI-internal loadout points (not external financial asset value)
  sponsorAdRevenueMultiplier: number;
  maxFlashFrequencyHz: number; // WCAG accessibility clamp (< 3Hz)
  reducedMotionSupported: boolean;
}

export interface ImpulseSeenOrderRequest {
  participantId: string;
  participantName: string;
  roomId: string;
  venueId: string;
  performerId: string;
  experienceType?: string;
  slotsCount: number;
  paymentReference: string;
  startDelayMs?: number; // default 120,000ms (2 minutes from now)
}

export class JumbotronImpulseSeenNetwork {
  private records = new Map<string, SpotlightDeliveryRecord>();
  private userCredits = new Map<string, number>(); // participantId -> count of reusable 15s credits
  private seq = 0;

  /**
   * Generates the prompt banner configuration
   */
  public getPromptConfig(): {
    title: string;
    subline: string;
    flatRateUsd: string;
    flatRateCents: number;
    slotDurationSeconds: number;
    bulkRewardText: string;
  } {
    return {
      title: 'You want to be seen?',
      subline: 'Get your presence spotlighted on the giant Jumbotron for everyone in the room to see!',
      flatRateUsd: '$3.99',
      flatRateCents: IMPULSE_SEEN_FLAT_RATE_CENTS,
      slotDurationSeconds: SPOTLIGHT_SLOT_DURATION_MS / 1000,
      bulkRewardText: 'Buy 5 or more slots to automatically unlock the exclusive Sparkle Glitter Tier!',
    };
  }

  /**
   * Resolves presence display format adhering to Lounge Presence Law.
   * Lounges are NO-AVATAR spaces; presence falls back to live video or profile card.
   */
  public resolvePresenceFormat(experienceType?: string): SpotlightPresenceFormat {
    const t = (experienceType ?? '').toUpperCase();
    if (t.includes('LOUNGE')) {
      return 'PROFILE_CARD'; // Strictly no avatar injection in Lounges
    }
    return 'FAN_AVATAR';
  }

  /**
   * Places an impulse order with flat rate pricing and automated bulk upgrade
   */
  public createImpulseOrder(request: ImpulseSeenOrderRequest): {
    orderId: string;
    totalAmountCents: number;
    slotsPurchased: number;
    visualTier: VisualEffectTier;
    records: SpotlightDeliveryRecord[];
    viralShareAlert: string;
  } {
    const orderId = `ord_seen_${++this.seq}_${Date.now()}`;
    const totalAmountCents = request.slotsCount * IMPULSE_SEEN_FLAT_RATE_CENTS;
    const visualTier: VisualEffectTier =
      request.slotsCount >= BULK_UPGRADE_MIN_SLOTS ? 'SPARKLE_GLITTER_TIER' : 'STANDARD';

    const now = Date.now();
    const baseStartMs = now + (request.startDelayMs ?? 120000); // 2 minutes in future
    const createdRecords: SpotlightDeliveryRecord[] = [];
    const presenceFormat = this.resolvePresenceFormat(request.experienceType);

    // Preferred inventory: East/West preferred for fan spotlights, North/South for sponsors
    const preferredFaces: JumbotronCardinalFace[] = ['EAST', 'WEST'];

    for (let i = 0; i < request.slotsCount; i++) {
      const scheduledStartMs = baseStartMs + i * SPOTLIGHT_SLOT_DURATION_MS;
      const assignedFace = preferredFaces[i % preferredFaces.length];
      const entitlementId = `ent_seen_${orderId}_slot_${i + 1}`;

      const performerShareCents = Math.round((IMPULSE_SEEN_FLAT_RATE_CENTS * DEFAULT_PERFORMER_SPLIT_BPS) / 10000);
      const platformShareCents = IMPULSE_SEEN_FLAT_RATE_CENTS - performerShareCents;

      const record: SpotlightDeliveryRecord = {
        entitlementId,
        purchaseId: orderId,
        participantId: request.participantId,
        participantName: request.participantName,
        roomId: request.roomId,
        venueId: request.venueId,
        performerId: request.performerId,
        slotIndexInOrder: i + 1,
        totalSlotsInOrder: request.slotsCount,
        scheduledStart: new Date(scheduledStartMs).toISOString(),
        scheduledStartMs,
        deliveredMs: 0,
        requiredMs: SPOTLIGHT_SLOT_DURATION_MS,
        deliveryQualified: false,
        visualEffectTier: visualTier,
        assignedFace,
        preferredFace: assignedFace,
        facePreemptedOrRelocated: false,
        presenceFormat,
        resolution: 'CREDITED', // Holds as unfulfilled until qualified
        financialSettlement: {
          grossAmountCents: IMPULSE_SEEN_FLAT_RATE_CENTS,
          performerShareCents,
          platformShareCents,
          settlementState: 'SETTLEMENT_HOLD', // Explicit pending-settlement ledger
        },
      };

      this.records.set(entitlementId, record);
      createdRecords.push(record);
    }

    const minutesUntilStart = Math.max(1, Math.round((baseStartMs - now) / 60000));
    const viralShareAlert = `Hey, come join this room! I'll be on the teleprompter in ${minutesUntilStart} minute${
      minutesUntilStart === 1 ? '' : 's'
    }!`;

    return {
      orderId,
      totalAmountCents,
      slotsPurchased: request.slotsCount,
      visualTier,
      records: createdRecords,
      viralShareAlert,
    };
  }

  /**
   * Preferred inventory re-routing: allows the Show Director to relocate
   * a fan spotlight face if high-priority content (P0/P1) preempts it.
   */
  public relocateFaceAssignment(
    entitlementId: string,
    newFace: JumbotronCardinalFace,
    reason: string
  ): boolean {
    const record = this.records.get(entitlementId);
    if (!record) return false;

    record.assignedFace = newFace;
    record.facePreemptedOrRelocated = true;
    record.preemptionReason = reason;
    return true;
  }

  /**
   * Starts a scheduled spotlight slot delivery on the physical Jumbotron
   */
  public startSlotDelivery(entitlementId: string, timestampMs: number = Date.now()): boolean {
    const record = this.records.get(entitlementId);
    if (!record) return false;

    record.actualStart = new Date(timestampMs).toISOString();
    record.actualStartMs = timestampMs;
    return true;
  }

  /**
   * Records ongoing delivery heartbeat. Incrementally accumulates delivered time.
   */
  public recordDeliveryHeartbeat(entitlementId: string, deltaMs: number): number {
    const record = this.records.get(entitlementId);
    if (!record) return 0;

    record.deliveredMs = Math.min(record.requiredMs, record.deliveredMs + deltaMs);
    return record.deliveredMs;
  }

  /**
   * Completes slot delivery. Enforces the Jumbotron Delivery Guarantee:
   * Revenue is earned only after verified qualified delivery of the full 15,000ms.
   */
  public completeSlotDelivery(entitlementId: string, timestampMs: number = Date.now()): SpotlightDeliveryRecord | null {
    const record = this.records.get(entitlementId);
    if (!record) return null;

    record.actualEnd = new Date(timestampMs).toISOString();
    record.actualEndMs = timestampMs;

    if (record.deliveredMs >= record.requiredMs) {
      // Qualified delivery achieved
      record.deliveryQualified = true;
      record.resolution = 'FULFILLED';
      record.financialSettlement.settlementState = 'PERFORMER_RELEASED';
      record.financialSettlement.settledAt = new Date(timestampMs).toISOString();
    } else {
      // Partial delivery (< 15000 ms) is NOT counted as fulfilled!
      // Enforce law: Restores full 15-second entitlement as reusable credit
      record.deliveryQualified = false;
      record.resolution = 'CREDITED';
      record.failureReason = 'NETWORK_FAILURE';
      record.financialSettlement.settlementState = 'CREDIT_ISSUED';
      this.grantCredit(record.participantId, 1);
    }

    return record;
  }

  /**
   * Handles unexpected room, venue, or network failures
   */
  public handleDeliveryInterruption(
    entitlementId: string,
    reason: SpotlightFailureReason
  ): SpotlightDeliveryRecord | null {
    const record = this.records.get(entitlementId);
    if (!record) return null;

    record.deliveryQualified = false;
    record.failureReason = reason;
    record.resolution = 'CREDITED';
    record.financialSettlement.settlementState = 'CREDIT_ISSUED';
    this.grantCredit(record.participantId, 1);

    return record;
  }

  /**
   * Allows customer one-click refund of unfulfilled or interrupted credits
   */
  public requestRefund(entitlementId: string): boolean {
    const record = this.records.get(entitlementId);
    if (!record) return false;

    if (record.resolution === 'FULFILLED') {
      // Cannot refund already fulfilled delivery
      return false;
    }

    record.resolution = 'REFUNDED';
    record.financialSettlement.settlementState = 'REFUNDED';
    record.financialSettlement.settledAt = new Date().toISOString();

    // Deduct user credit if it was converted to credit
    const currentCredits = this.userCredits.get(record.participantId) ?? 0;
    if (currentCredits > 0) {
      this.userCredits.set(record.participantId, currentCredits - 1);
    }

    return true;
  }

  /**
   * Helper to grant reusable credit
   */
  public grantCredit(participantId: string, count: number = 1): number {
    const existing = this.userCredits.get(participantId) ?? 0;
    const updated = existing + count;
    this.userCredits.set(participantId, updated);
    return updated;
  }

  public getUserCredits(participantId: string): number {
    return this.userCredits.get(participantId) ?? 0;
  }

  public getRecord(entitlementId: string): SpotlightDeliveryRecord | undefined {
    return this.records.get(entitlementId);
  }

  /**
   * Calculates dynamic sponsor advertiser rate multiplier based on venue type and performer tier
   */
  public calculateDynamicAdRateCents(
    baseRateCents: number,
    eventType: string,
    performerLevel: number = 1
  ): {
    finalRateCents: number;
    experienceMultiplier: number;
    performerMultiplier: number;
  } {
    const t = eventType.toUpperCase();
    let experienceMultiplier = 1.0;

    if (t.includes('BATTLE')) {
      experienceMultiplier = 2.5;
    } else if (t.includes('CHALLENGE')) {
      experienceMultiplier = 2.0;
    } else if (t.includes('CYPHER')) {
      experienceMultiplier = 1.8;
    } else if (t.includes('MONDAY')) {
      experienceMultiplier = 3.0;
    } else if (t.includes('DANCE')) {
      experienceMultiplier = 2.2;
    } else if (t.includes('CONCERT')) {
      experienceMultiplier = 3.5;
    }

    let performerMultiplier = 1.0;
    if (performerLevel >= 5) {
      performerMultiplier = 1.5; // Headliner tier
    } else if (performerLevel >= 3) {
      performerMultiplier = 1.2; // Regional pro
    }

    const totalMultiplier = experienceMultiplier * performerMultiplier;
    const finalRateCents = Math.round(baseRateCents * totalMultiplier);

    return {
      finalRateCents,
      experienceMultiplier,
      performerMultiplier,
    };
  }

  /**
   * Resolves venue hardware config and prestige loadout points with photosensitivity safety
   */
  public resolveVenueHardwareConfig(
    venueId: string,
    tier: HardwareTier,
    reducedMotionRequested: boolean = false
  ): VenueJumbotronHardwareConfig {
    switch (tier) {
      case 'CHAMPIONSHIP_HYBRID':
        return {
          venueId,
          hardwareTier: 'CHAMPIONSHIP_HYBRID',
          brightnessMultiplier: reducedMotionRequested ? 1.0 : 1.25, // Safe luminance ceiling
          neonFlashRingsEnabled: !reducedMotionRequested,
          underbellyPanelsEnabled: true,
          venuePrestigePoints: 5000,
          sponsorAdRevenueMultiplier: 1.5,
          maxFlashFrequencyHz: 2.0, // Strictly < 3 Hz
          reducedMotionSupported: true,
        };
      case 'VIP_PRO':
        return {
          venueId,
          hardwareTier: 'VIP_PRO',
          brightnessMultiplier: reducedMotionRequested ? 1.0 : 1.15,
          neonFlashRingsEnabled: !reducedMotionRequested,
          underbellyPanelsEnabled: false,
          venuePrestigePoints: 2500,
          sponsorAdRevenueMultiplier: 1.3,
          maxFlashFrequencyHz: 2.0, // Strictly < 3 Hz
          reducedMotionSupported: true,
        };
      case 'STANDARD':
      default:
        return {
          venueId,
          hardwareTier: 'STANDARD',
          brightnessMultiplier: 1.0,
          neonFlashRingsEnabled: false,
          underbellyPanelsEnabled: false,
          venuePrestigePoints: 500,
          sponsorAdRevenueMultiplier: 1.0,
          maxFlashFrequencyHz: 0.0,
          reducedMotionSupported: true,
        };
    }
  }
}
