/**
 * Performer magazine gallery slot limits — canonical FREE→DIAMOND (Ruby, not Bronze).
 * Reads from SubscriptionPricingEngine.getTierImageLimits (same numbers as SubscriptionPlanEngine.imageSlots).
 */

import type { PerformerTier } from "@/lib/performers/PerformerRegistry";
import {
  getTierImageLimits,
  type SubscriptionTier,
} from "@/lib/subscriptions/SubscriptionPricingEngine";

/** Canonical slot counts for magazine / article gallery. */
export const PERFORMER_GALLERY_SLOT_LIMITS: Record<string, number> = {
  FREE: 1,
  PRO: 3,
  RUBY: 6,
  SILVER: 8,
  GOLD: 10,
  PLATINUM: 15,
  DIAMOND: 20,
};

export function performerTierToSubscriptionTier(tier: PerformerTier | string): SubscriptionTier {
  const key = String(tier).toUpperCase();
  switch (key) {
    case "FREE":
      return "free";
    case "PRO":
      return "pro";
    case "RUBY":
      return "RUBY";
    case "SILVER":
      return "silver";
    case "GOLD":
      return "gold";
    case "PLATINUM":
      return "platinum";
    case "DIAMOND":
      return "diamond";
    default:
      return "free";
  }
}

/** Gallery image slots unlocked for this performer membership tier. */
export function getPerformerGallerySlotCount(tier: PerformerTier | string): number {
  const sub = performerTierToSubscriptionTier(tier);
  return getTierImageLimits("performer", sub);
}

export function getGallerySlotLabel(index: number): string {
  if (index === 0) return "Hero";
  return `Slot ${index + 1}`;
}
