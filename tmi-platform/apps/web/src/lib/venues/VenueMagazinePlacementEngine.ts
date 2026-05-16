/**
 * VenueMagazinePlacementEngine
 * Places venue events inside magazine/news/article feeds.
 * Placement types: event article card, magazine event strip, article-side ticket ad, live promo card.
 * Priority driven by active VenuePromotionCampaign boost tier.
 */

import type { VenueBoostTier } from "./VenuePromotionEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MagazinePlacementType =
  | "event-article-card"
  | "magazine-event-strip"
  | "article-side-ticket-ad"
  | "live-event-promo-card";

export type MagazinePlacementStatus = "active" | "paused" | "expired";

export type VenueMagazinePlacement = {
  placementId: string;
  venueId: string;
  eventId: string;
  campaignId: string;
  placementType: MagazinePlacementType;
  boostTier: VenueBoostTier;
  priority: number;                  // higher = shown first (1–100)
  status: MagazinePlacementStatus;
  headline: string;
  subline?: string;
  eventImageUrl?: string;
  venueLogoUrl?: string;
  ticketBuyRoute: string;
  eventRoute: string;
  articleCategory?: string;
  targetGenre?: string;
  impressions: number;
  clicks: number;
  activeSinceMs: number;
  expiresAtMs: number;
};

// ─── Priority by boost tier ───────────────────────────────────────────────────

const TIER_PRIORITY: Record<VenueBoostTier, number> = {
  starter:  20,
  standard: 45,
  featured: 70,
  headline: 95,
};

// ─── Placement types per boost tier ──────────────────────────────────────────

const TIER_PLACEMENTS: Record<VenueBoostTier, MagazinePlacementType[]> = {
  starter:  ["article-side-ticket-ad", "magazine-event-strip"],
  standard: ["article-side-ticket-ad", "magazine-event-strip", "event-article-card"],
  featured: ["article-side-ticket-ad", "magazine-event-strip", "event-article-card", "live-event-promo-card"],
  headline: ["article-side-ticket-ad", "magazine-event-strip", "event-article-card", "live-event-promo-card"],
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const placements: VenueMagazinePlacement[] = [];
let placementCounter = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Auto-create magazine placements for all types unlocked by the campaign's boost tier.
 */
export function createMagazinePlacements(input: {
  venueId: string;
  eventId: string;
  campaignId: string;
  boostTier: VenueBoostTier;
  headline: string;
  subline?: string;
  eventImageUrl?: string;
  venueLogoUrl?: string;
  ticketBuyRoute: string;
  eventRoute: string;
  articleCategory?: string;
  targetGenre?: string;
  durationDays: number;
}): VenueMagazinePlacement[] {
  const types = TIER_PLACEMENTS[input.boostTier];
  const priority = TIER_PRIORITY[input.boostTier];
  const expiresAtMs = Date.now() + input.durationDays * 24 * 60 * 60 * 1000;
  const created: VenueMagazinePlacement[] = [];

  for (const placementType of types) {
    const p: VenueMagazinePlacement = {
      placementId: `mag-place-${++placementCounter}-${input.eventId}`,
      venueId: input.venueId,
      eventId: input.eventId,
      campaignId: input.campaignId,
      placementType,
      boostTier: input.boostTier,
      priority,
      status: "active",
      headline: input.headline,
      subline: input.subline,
      eventImageUrl: input.eventImageUrl,
      venueLogoUrl: input.venueLogoUrl,
      ticketBuyRoute: input.ticketBuyRoute,
      eventRoute: input.eventRoute,
      articleCategory: input.articleCategory,
      targetGenre: input.targetGenre,
      impressions: 0,
      clicks: 0,
      activeSinceMs: Date.now(),
      expiresAtMs,
    };
    placements.unshift(p);
    created.push(p);
  }

  return created;
}

export function getPlacementsByType(
  placementType: MagazinePlacementType,
  limit = 10
): VenueMagazinePlacement[] {
  return placements
    .filter((p) => p.placementType === placementType && p.status === "active" && p.expiresAtMs > Date.now())
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function getPlacementsByGenre(genre: string, limit = 10): VenueMagazinePlacement[] {
  return placements
    .filter((p) => p.status === "active" && p.expiresAtMs > Date.now() && (p.targetGenre === genre || p.targetGenre === undefined))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function getEventPlacements(eventId: string): VenueMagazinePlacement[] {
  return placements.filter((p) => p.eventId === eventId && p.status === "active");
}

export function recordPlacementImpression(placementId: string): void {
  const p = placements.find((x) => x.placementId === placementId);
  if (p) p.impressions += 1;
}

export function recordPlacementClick(placementId: string): void {
  const p = placements.find((x) => x.placementId === placementId);
  if (p) p.clicks += 1;
}

export function expireStalePlacements(): number {
  const now = Date.now();
  let count = 0;
  placements.forEach((p) => {
    if (p.status === "active" && p.expiresAtMs < now) {
      p.status = "expired";
      count++;
    }
  });
  return count;
}

export function listVenueMagazinePlacements(venueId: string): VenueMagazinePlacement[] {
  return placements.filter((p) => p.venueId === venueId);
}
