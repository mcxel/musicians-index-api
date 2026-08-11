/**
 * YoPhoImageCapacity — single registry for tier-aware YoPho working-image slots.
 *
 * Uses canonical membership ladder FREE→PRO→RUBY→SILVER→GOLD→PLATINUM→DIAMOND.
 * Band role maps to high capacity (PLATINUM tier numbers) — not a parallel ladder.
 *
 * Counts are product defaults (tunable); structure gates UI now (Rule 20 — no fake slots).
 */

import {
  getPortraitEntitlement,
  type SubscriptionPortraitEntitlement,
} from "./YoPhoPortraitEngine";

/** Canonical image-slot capacity per membership tier / Band role. */
export const YOPHO_IMAGE_CAPACITY_BY_TIER: Record<string, number> = {
  FREE: 1,
  PRO: 3,
  RUBY: 5,
  SILVER: 6,
  GOLD: 8,
  PLATINUM: 12,
  DIAMOND: 16,
  /** Band role — multi-image studio capacity (maps to high tier, not a separate ladder). */
  BAND: 12,
};

export const YOPHO_UPGRADE_HREF = "/account/subscription";

export interface YoPhoImageCapacity {
  tierKey: string;
  maxImages: number;
  /** FREE single-card: strip hidden; paid/Band: strip active within capacity */
  multiImageEnabled: boolean;
  entitlement: SubscriptionPortraitEntitlement;
  upgradeHref: string;
}

function normalizeTierOrRole(tierOrRole: string | undefined | null): string {
  const raw = (tierOrRole || "FREE").toUpperCase().trim();
  if (raw === "BAND" || raw === "MEMBER") return raw === "BAND" ? "BAND" : "FREE";
  if (raw === "BRONZE") return "RUBY"; // Tier canon: Ruby replaces Bronze
  return raw;
}

/**
 * Resolve YoPho working-image capacity from membership tier or Band role.
 * Prefer account tier string; pass "BAND" when role is BAND.
 */
export function getYoPhoImageCapacity(tierOrRole?: string | null): YoPhoImageCapacity {
  const key = normalizeTierOrRole(tierOrRole);
  const maxFromMap = YOPHO_IMAGE_CAPACITY_BY_TIER[key];
  const entitlementTier = key === "BAND" ? "PLATINUM" : key === "RUBY" ? "PRO" : key;
  const entitlement = getPortraitEntitlement(entitlementTier);

  // Prefer explicit capacity map; fall back to maxActivePortraits from entitlement table.
  const maxImages =
    typeof maxFromMap === "number"
      ? maxFromMap
      : Math.max(1, entitlement.maxActivePortraits ?? 1);

  return {
    tierKey: key,
    maxImages,
    multiImageEnabled: maxImages > 1,
    entitlement,
    upgradeHref: YOPHO_UPGRADE_HREF,
  };
}

export function canAddYoPhoImage(currentCount: number, tierOrRole?: string | null): boolean {
  const { maxImages } = getYoPhoImageCapacity(tierOrRole);
  return currentCount < maxImages;
}
