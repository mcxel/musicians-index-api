/**
 * Season Pass aftermarket lifecycle — Owner law §§9116–9155.
 * Retired pass rewards graduate into existing Store / Marketplace authorities.
 * No second Season Pass store. No merchandising AI. No invented prices.
 */

import { STORE_CATALOG, type StoreItem } from "@/lib/store/StoreRotationEngine";
import { FLEX_STORE_CATALOG, type FlexStoreItem } from "@/lib/store/FlexStoreLedger";
import { OwnershipRuntime } from "@/lib/commerce/OwnershipRuntime";
import { SEASON_ONE_REWARDS, type SeasonOneReward } from "@/config/seasonOneRewards";
import { listCatalogProducts } from "@/lib/venue/VenueSkinCommerceCatalog";
import { getFanCosmetic } from "@/lib/avatars/FanCosmeticCatalog";

/**
 * Explicit reward → existing Store identity (no cloned SKUs).
 * Only sellable Issue-1 cosmetics with a real priced authority.
 */
const AFTERMARKET_CANONICAL_BINDINGS: Readonly<Record<string, string>> = {
  "shared-t3-venue-accent": "neon-club",
  "fan-t1-shades": "diamond-shades-vip",
};

export type SeasonPassAftermarketState =
  | "ACTIVE_SEASON_PASS"
  | "RETIRED"
  | "COOLDOWN"
  | "STORE_ELIGIBLE"
  | "MARKETPLACE_ACTIVE"
  | "VAULTED"
  | "RETURN_CANDIDATE"
  | "SCHEDULED_RETURN"
  | "ACTIVE_RETURN"
  | "ARCHIVED";

export type SeasonPassIssueLifecycle = "ACTIVE" | "RETIRED" | "DRAFT" | "READY";

export type AftermarketAdminAction =
  | "FEATURE_NOW"
  | "SCHEDULE_RETURN"
  | "VAULT"
  | "REMOVE_FROM_ROTATION"
  | "DISABLE_AUTO_RETURN"
  | "RE_ENABLE_AUTO_RETURN";

const adminOverrides = new Map<string, AftermarketAdminAction>();

/** Issue 1 cosmetics may later sell; credits, YoPho contracts, and missing effects do not auto-dump. */
const POST_SEASON_SELLABLE: Record<string, boolean> = {
  "shared-t1-lounge-lamp": true,
  "shared-t2-yopho-frame": false,
  "shared-t3-venue-accent": true,
  "fan-t1-shades": true,
  "fan-t2-action-icon": true,
  "fan-t3-companion": true,
  "fan-t4-spin-emote": true,
  "artist-t1-billboard": false,
  "artist-t1-video-boost": false,
  "artist-t2-bandwidth": false,
  "artist-t3-liveworld": false,
  "artist-t4-magazine": false,
  "artist-t5-fireball": false,
};

export function isPostSeasonSellable(rewardId: string): boolean {
  return POST_SEASON_SELLABLE[rewardId] === true;
}

export function findCanonicalStoreBinding(reward: SeasonOneReward): StoreItem | FlexStoreItem | undefined {
  const needles = [reward.id, ...(reward.variants ?? []).map((variant) => variant.variantId)];
  const fromStore =
    STORE_CATALOG.find((item) => needles.includes(item.id) || needles.includes(item.slug)) ??
    FLEX_STORE_CATALOG.find((item) => needles.includes(item.id));
  if (fromStore) return fromStore;

  const boundId = AFTERMARKET_CANONICAL_BINDINGS[reward.id];
  if (!boundId) return undefined;

  const venue = listCatalogProducts().find((p) => p.entitlementId === boundId);
  const venuePrice = venue?.priceCents ?? null;
  if (venue && venuePrice != null && venuePrice > 0) {
    return {
      id: venue.entitlementId,
      name: venue.name,
      description: `Season Pass aftermarket → VenueSkin ${venue.entitlementId}`,
      itemType: "VENUE_SKIN",
      collectionTier: "EVERYDAY",
      priceCents: venuePrice,
      icon: "🎤",
      preview: { thumbnail: "/images/tmi-placeholder.jpg", accentColor: "#FF2DAA" },
    } satisfies FlexStoreItem;
  }

  const cosmetic = getFanCosmetic(boundId);
  if (cosmetic) {
    const usd = cosmetic.usdCents ?? null;
    const pts = cosmetic.pointsCost ?? (cosmetic as { cost?: number }).cost ?? null;
    // Prefer real USD; Points-only stays OWNER_VALUE_REQUIRED for cash aftermarket.
    if (usd != null && usd > 0) {
      return {
        id: cosmetic.id,
        name: cosmetic.label,
        description: `Season Pass aftermarket → FanCosmetic ${cosmetic.id}`,
        itemType: "ACCESSORY",
        collectionTier: "EVERYDAY",
        priceCents: usd,
        icon: cosmetic.icon ?? "🕶️",
        preview: { thumbnail: "/images/tmi-placeholder.jpg", accentColor: "#00FFFF" },
      } satisfies FlexStoreItem;
    }
    if (pts != null && pts > 0) {
      return {
        id: cosmetic.id,
        slug: cosmetic.id,
        name: cosmetic.label,
        category: "avatar_buttons",
        price: pts,
        currency: "TMI_POINTS",
        status: "available",
        expiresAt: null,
        returnsAt: null,
        accent: "#00FFFF",
        emoji: cosmetic.icon ?? "🕶️",
        route: "/store/fan",
      } satisfies StoreItem;
    }
  }
  return undefined;
}

export function resolveAftermarketState(input: {
  reward: SeasonOneReward;
  issueStatus: SeasonPassIssueLifecycle;
  cooldownComplete?: boolean;
  windowActive?: boolean;
  returnEligible?: boolean;
}): SeasonPassAftermarketState {
  const override = adminOverrides.get(input.reward.id);
  if (override === "VAULT" || override === "REMOVE_FROM_ROTATION") return "VAULTED";
  if (override === "FEATURE_NOW") return "MARKETPLACE_ACTIVE";
  if (override === "SCHEDULE_RETURN") return "SCHEDULED_RETURN";
  if (input.issueStatus === "DRAFT" || input.issueStatus === "READY") return "ARCHIVED";
  if (input.issueStatus === "ACTIVE") return "ACTIVE_SEASON_PASS";
  if (!isPostSeasonSellable(input.reward.id)) return "VAULTED";
  if (!input.cooldownComplete) return "COOLDOWN";
  if (input.windowActive) return "MARKETPLACE_ACTIVE";
  if (input.returnEligible) return "RETURN_CANDIDATE";
  return "STORE_ELIGIBLE";
}

export function canPublishRetiredRewardToStore(input: {
  reward: SeasonOneReward;
  issueStatus: SeasonPassIssueLifecycle;
  storeItem?: StoreItem | FlexStoreItem | null;
  windowValid?: boolean;
}): { publish: boolean; reason: string } {
  if (input.issueStatus !== "RETIRED") {
    return { publish: false, reason: "ISSUE_NOT_RETIRED" };
  }
  if (input.reward.grantKind === "yopho_contract") {
    return { publish: false, reason: "YOPHO_LANE_UNTOUCHED" };
  }
  if (input.reward.grantKind === "effect_future") {
    return { publish: false, reason: "ASSET_MISSING" };
  }
  if (!isPostSeasonSellable(input.reward.id)) {
    return { publish: false, reason: "POST_SEASON_SELLABLE_NO" };
  }
  const storeItem = input.storeItem === undefined ? findCanonicalStoreBinding(input.reward) : input.storeItem;
  if (!storeItem) {
    return { publish: false, reason: "NO_CANONICAL_STORE_BINDING" };
  }
  const price = "priceCents" in storeItem ? storeItem.priceCents : storeItem.price;
  if (!price || price <= 0) {
    return { publish: false, reason: "PRICE_NOT_CONFIGURED" };
  }
  if (input.windowValid === false) {
    return { publish: false, reason: "WINDOW_INVALID" };
  }
  return { publish: true, reason: "BOUND_TO_EXISTING_STORE" };
}

export function earnedOwnershipSurvivesRetirement(
  userId: string,
  skuId: string,
): boolean {
  return OwnershipRuntime.hasEntitlement(userId, skuId);
}

export function setAftermarketAdminOverride(rewardId: string, action: AftermarketAdminAction | null): void {
  if (!action) {
    adminOverrides.delete(rewardId);
    return;
  }
  adminOverrides.set(rewardId, action);
}

export function aftermarketReturnScoreStatus(): "OWNER_VALUE_REQUIRED" {
  return "OWNER_VALUE_REQUIRED";
}

export function listIssueOneAftermarketRows(): Array<{
  rewardId: string;
  sellable: boolean;
  storeBound: boolean;
}> {
  return SEASON_ONE_REWARDS.map((reward) => ({
    rewardId: reward.id,
    sellable: isPostSeasonSellable(reward.id),
    storeBound: Boolean(findCanonicalStoreBinding(reward)),
  }));
}
