/**
 * Video Boost → Home 2 Magazine Network eligibility.
 *
 * STATUS (2026-07-29): FUTURE — no dedicated VideoBoost runtime / purchase queue exists.
 * Closest real systems:
 *   - PromotionSlotEngine (sponsored-boost / venue-promo slots)
 *   - Store SKU `artist-boost` / Stripe `prod_artist_boost`
 *   - FlexStoreLedger `promotion-booster-headline`
 *
 * This module extends queue eligibility only: when active boosts exist, they may
 * enter MagazineRotationScheduler as kind "video_boost". Do not invent a second boost system.
 */

import {
  PROMO_ELIGIBLE_SLOTS,
  type PromoSlotRequest,
  type PromoSlotResult,
  requestPromoSlot,
} from "@/lib/discovery-rotation/PromotionSlotEngine";
import type { UnifiedMediaRecord } from "./UnifiedMediaRecord";

/** Magazine TV is an approved promo surface once Video Boost purchases wire in. */
export const MAGAZINE_TV_PROMO_SLOT = "sponsored-boost" as const;

export type VideoBoostEligibilityStatus = "FUTURE" | "active";

export function getVideoBoostStatus(): {
  status: VideoBoostEligibilityStatus;
  note: string;
  promoSlots: readonly string[];
} {
  return {
    status: "FUTURE",
    note:
      "No active Video Boost purchase ledger wired to Magazine Network yet. " +
      "Scheduler accepts video_boost records when publishers supply them; " +
      "PromotionSlotEngine sponsored-boost remains the eligibility gate.",
    promoSlots: PROMO_ELIGIBLE_SLOTS,
  };
}

/**
 * Gate a prospective Video Boost for the Magazine Network queue.
 * Until a purchase ledger exists, always returns unapproved with FUTURE reason.
 */
export function requestMagazineVideoBoostSlot(
  req: Pick<PromoSlotRequest, "artistId" | "budgetCredits" | "targetZone">,
): PromoSlotResult {
  return requestPromoSlot({
    artistId: req.artistId,
    requestedSlotType: MAGAZINE_TV_PROMO_SLOT,
    budgetCredits: req.budgetCredits,
    targetZone: req.targetZone,
    targetIssue: undefined,
  });
}

/**
 * Collect active video_boost UnifiedMediaRecords for the Home 2 queue.
 * Returns [] until a real boost ledger publishes records (Rule 20 — no fakes).
 */
export function listActiveVideoBoostMedia(): UnifiedMediaRecord[] {
  // FUTURE: read from Video Boost purchase ledger / MediaRegistry boost metadata.
  void getVideoBoostStatus();
  return [];
}

export function isActiveBoost(record: UnifiedMediaRecord, now = Date.now()): boolean {
  if (record.kind !== "video_boost" && !record.boostEligible) return false;
  if (record.boostExpiresAt != null && record.boostExpiresAt <= now) return false;
  return Boolean(record.boostEligible || record.kind === "video_boost");
}
