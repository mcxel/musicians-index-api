/**
 * SponsorEngine.ts
 * Purpose: Sponsor contracts, placement priority, ROI tracking, fulfillment workflow.
 * Placement: packages/engines/src/SponsorEngine.ts
 *            Import via @tmi/engines/SponsorEngine
 * Depends on: TierEngine, RevenueEngine
 */

import { Tier } from './TierEngine';
import { calculateSponsorROI } from './RevenueEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SponsorTier = 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'GLOBAL' | 'TITLE';

export type SponsorPlacementType =
  | 'ARTIST_PROFILE_RAIL'        // movable widget on artist profile
  | 'ARTIST_PROFILE_STABLE'      // locked slot (higher price)
  | 'LIVE_EVENT_BANNER'          // banner during live events
  | 'MAGAZINE_INSERT'            // card inserted between pages
  | 'EVENT_NAMING_RIGHTS'        // "Powered by X" event title
  | 'INTERMISSION_VIDEO'         // video played between sets
  | 'WINNER_PRIZE'               // physical/digital prize for contest winners
  | 'CONTEST_PRIZE_POOL'         // adds to prize pool
  | 'AVATAR_SKIN'                // branded avatar cosmetic
  | 'SPONSORED_BY_BUMPER';       // "Sponsored by X" audio/visual bumper

export interface SponsorContract {
  id: string;
  sponsorId: string;
  sponsorName: string;
  sponsorTier: SponsorTier;
  placements: SponsorPlacement[];
  startDate: Date;
  endDate: Date;
  totalBudgetCents: number;
  spentCents: number;
  isActive: boolean;
  requiresModeration: boolean;   // must admin-approve creatives
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface SponsorPlacement {
  id: string;
  contractId: string;
  type: SponsorPlacementType;
  priority: number;              // 1–100, higher = shown first
  targetArtistId?: string;       // for ARTIST_PROFILE placements
  targetEventType?: string;      // for event-specific placements
  targetGenres?: string[];       // genre targeting
  creativeAssetUrl: string;
  clickUrl?: string;
  impressionsCap?: number;
  impressionsDelivered: number;
  isActive: boolean;
}

export interface SponsorPrize {
  id: string;
  contractId: string;
  description: string;
  estimatedValueCents: number;
  quantityAvailable: number;
  quantityClaimed: number;
  shipsDirectlyFromSponsor: boolean;
  claimWindowDays: number;
}

// ─── Fulfillment Types ────────────────────────────────────────────────────────

export type FulfillmentStatus =
  | 'WINNER_NOTIFIED'
  | 'CLAIM_SUBMITTED'
  | 'ADDRESS_VERIFIED'
  | 'SPONSOR_NOTIFIED'
  | 'SPONSOR_SHIPPED'
  | 'TRACKING_PROVIDED'
  | 'DELIVERED'
  | 'CLAIM_EXPIRED'
  | 'DISPUTED';

export interface PrizeClaim {
  id: string;
  prizeId: string;
  winnerId: string;
  winnerEventId: string;
  shippingAddress: ShippingAddress;
  status: FulfillmentStatus;
  sponsorPacketSentAt?: Date;
  trackingNumber?: string;
  trackingCarrier?: string;
  claimedAt: Date;
  expiresAt: Date;
  deliveredAt?: Date;
  timeline: FulfillmentEvent[];
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface FulfillmentEvent {
  status: FulfillmentStatus;
  timestamp: Date;
  note?: string;
  actorId?: string;    // who triggered this step
}

// ─── Sponsor Analytics ────────────────────────────────────────────────────────

export interface SponsorAnalytics {
  contractId: string;
  periodStart: Date;
  periodEnd: Date;
  impressions: number;
  clicks: number;
  conversions: number;
  avgOrderValueCents: number;
  winnersSponsored: number;
  prizesShipped: number;
  totalSpentCents: number;
  roi: ReturnType<typeof calculateSponsorROI>;
}

// ─── Priority Stack (resolves which sponsor shows when multiple compete) ──────

export interface PlacementContext {
  surface: SponsorPlacementType;
  artistId?: string;
  eventType?: string;
  genre?: string;
  viewerTier: Tier;
}

/** Select the best placement for a surface context */
export function selectPlacement(
  placements: SponsorPlacement[],
  context: PlacementContext,
): SponsorPlacement | null {
  const eligible = placements
    .filter(p => {
      if (!p.isActive) return false;
      if (p.type !== context.surface) return false;
      if (p.impressionsCap && p.impressionsDelivered >= p.impressionsCap) return false;
      if (p.targetArtistId && p.targetArtistId !== context.artistId) return false;
      if (p.targetEventType && p.targetEventType !== context.eventType) return false;
      if (p.targetGenres?.length && !p.targetGenres.includes(context.genre ?? '')) return false;
      return true;
    })
    .sort((a, b) => b.priority - a.priority);

  return eligible[0] ?? null;
}

/** Calculate magazine insertion positions (weighted, contract-honored) */
export function calculateMagazineInsertions(
  totalPages: number,
  placements: SponsorPlacement[],
  insertionRate: number,  // from TierEngine.getSponsorExposure
): Map<number, SponsorPlacement> {
  const result = new Map<number, SponsorPlacement>();
  const magazinePlacements = placements.filter(p => p.type === 'MAGAZINE_INSERT' && p.isActive);

  if (magazinePlacements.length === 0) return result;

  // Every N pages, insert a sponsor card
  const interval = Math.ceil(1 / insertionRate);
  let placementIdx = 0;

  for (let page = interval; page <= totalPages; page += interval) {
    const placement = magazinePlacements[placementIdx % magazinePlacements.length];
    result.set(page, placement);
    placementIdx++;
  }

  return result;
}

/** Build sponsor packet for fulfillment (sent to sponsor when winner claims) */
export function buildSponsorPacket(claim: PrizeClaim): {
  winnerId: string;
  shipping: ShippingAddress;
  prizeId: string;
  claimId: string;
  generatedAt: Date;
} {
  return {
    winnerId: claim.winnerId,
    shipping: claim.shippingAddress,
    prizeId: claim.prizeId,
    claimId: claim.id,
    generatedAt: new Date(),
  };
}

/** Advance fulfillment status */
export function advanceFulfillment(
  claim: PrizeClaim,
  newStatus: FulfillmentStatus,
  actorId: string,
  note?: string,
  trackingNumber?: string,
  trackingCarrier?: string,
): PrizeClaim {
  const event: FulfillmentEvent = {
    status: newStatus,
    timestamp: new Date(),
    note,
    actorId,
  };

  return {
    ...claim,
    status: newStatus,
    trackingNumber: trackingNumber ?? claim.trackingNumber,
    trackingCarrier: trackingCarrier ?? claim.trackingCarrier,
    timeline: [...claim.timeline, event],
  };
}

/** Check if claim has expired */
export function isClaimExpired(claim: PrizeClaim): boolean {
  return claim.status !== 'DELIVERED' && new Date() > claim.expiresAt;
}
