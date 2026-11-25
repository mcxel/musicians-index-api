/**
 * AvatarShowroomEconomyPolicy — §11426–§11562 (composer, not a second catalog).
 *
 * Composes FanCosmeticCatalog + CosmeticMerchandisingDirector + OwnershipRuntime.
 * Laws:
 * - FREE basics + free ordinary tint
 * - SHOWROOM rotation ≠ personal inventory
 * - purchase status ≠ tint capability
 * - missing price → PRICE_UNAVAILABLE (never invent ?? 100)
 * - TRY ON ≠ OWN
 * - SAVE LOOK rejects unowned marketplace try-ons
 */

import {
  getFanCosmetic,
  getUnifiedFanCosmeticCatalog,
  type FanCosmeticDef,
  type FanInventoryCategory,
} from "./FanCosmeticCatalog";
import { buildFanShowcase } from "@/lib/commerce/CosmeticMerchandisingDirector";
import { canCommitWearableToWorld } from "./AvatarWearableCapability";
import {
  FREE_STARTER_ACTIONS,
  FREE_STARTER_DANCE,
  FREE_STARTER_KIT_IDS,
  FREE_STARTER_PROP,
  STARTER_ASSET_GAPS,
} from "@/lib/avatars/AvatarFreeStarterKit";

export {
  FREE_STARTER_ACTIONS,
  FREE_STARTER_DANCE,
  FREE_STARTER_KIT_IDS,
  FREE_STARTER_PROP,
  STARTER_ASSET_GAPS,
};

export const AVATAR_SHOWROOM_ECONOMY_POLICY_ID = "AVATAR_SHOWROOM_ECONOMY_POLICY_v1" as const;

export type AvatarCommerceClass =
  | "FREE_BASIC"
  | "MARKETPLACE_ITEM"
  | "TIER_INCLUDED"
  | "SEASON_INCLUDED"
  | "NOT_FOR_SALE";

export type PriceResolveStatus = "FREE" | "POINTS" | "USD" | "PRICE_UNAVAILABLE" | "NOT_FOR_SALE";

export interface AvatarItemEconomyResolution {
  itemId: string;
  commerceClass: AvatarCommerceClass;
  owned: boolean;
  entitled: boolean;
  canTryOn: boolean;
  canEquipPersistently: boolean;
  supportsTint: boolean;
  tintIncluded: boolean;
  artworkColorLocked: boolean;
  supportsMaterialVariants: boolean;
  /** Null when FREE / NOT_FOR_SALE / PRICE_UNAVAILABLE — never invent a number. */
  marketplacePriceCents: number | null;
  pointsCost: number | null;
  priceStatus: PriceResolveStatus;
  requiredTier?: string;
  previewAssetId?: string;
  inventoryAssetId?: string;
  category: FanInventoryCategory | "unknown";
}

/** Premium SKUs may appear in Showroom/Marketplace discovery — never auto-owned. */
export const SHOWROOM_DISCOVERY_POOL_IDS = [
  "cyber-jacket-neon",
  "arena_captain",
  "royal_stage",
  "jester_costume",
  "holographic-sneakers-gold",
  "diamond-shades-vip",
  "crown",
  "sunglasses",
  "jester_hat",
  "heart_prop",
  "inst_ukulele",
  "foam_finger",
  "rose",
  "flame_burst",
  "gold_chain",
  "neck_headphones",
  "sparkler",
  "umbrella_festival",
] as const;

function isFreeByCatalog(def: FanCosmeticDef): boolean {
  // Ownership truth comes from catalog pricing/entitlement — never force-free a paid SKU via kit list.
  return def.pointsCost === 0 || def.rarity === "free" || def.entitlement === "free";
}

/**
 * Tintability is an asset capability, not "premium ⇒ locked".
 * Heuristic over existing catalog fields until authored capability flags exist.
 */
export function resolveTintCapability(def: FanCosmeticDef): {
  supportsTint: boolean;
  tintIncluded: boolean;
  artworkColorLocked: boolean;
} {
  const hasPrintCue =
    /print|graphic|pattern|logo|art|holo|diamond|cyber|jester|royal|arena/i.test(
      `${def.id} ${def.label} ${def.description ?? ""}`,
    );
  const isColorwayChild = Boolean(def.colorwayOf);
  const materialPremium =
    def.materialFamily === "chrome" ||
    def.materialFamily === "iridescent" ||
    def.materialFamily === "gold" ||
    (def.emissiveIntensity != null && def.emissiveIntensity > 0.4);

  // Plain basics + tintable colorway parents: free ordinary tint.
  if (isFreeByCatalog(def) && !hasPrintCue) {
    return { supportsTint: true, tintIncluded: true, artworkColorLocked: false };
  }
  // Colorway variants already encode a curated hue — user may still re-tint base fabric.
  if (isColorwayChild && !hasPrintCue) {
    return { supportsTint: true, tintIncluded: true, artworkColorLocked: false };
  }
  // Graphic / curated art: may tint base where bodyTint exists, artwork locked.
  if (hasPrintCue && def.bodyTint) {
    return { supportsTint: true, tintIncluded: true, artworkColorLocked: true };
  }
  if (hasPrintCue || materialPremium) {
    return { supportsTint: false, tintIncluded: false, artworkColorLocked: true };
  }
  // Default: tintable when body/hair/accent channels exist.
  const supports = Boolean(def.bodyTint || def.hairTint || def.accent);
  return {
    supportsTint: supports,
    tintIncluded: supports,
    artworkColorLocked: false,
  };
}

function resolvePrice(def: FanCosmeticDef): {
  marketplacePriceCents: number | null;
  pointsCost: number | null;
  priceStatus: PriceResolveStatus;
} {
  if (isFreeByCatalog(def)) {
    return { marketplacePriceCents: null, pointsCost: 0, priceStatus: "FREE" };
  }
  if (def.entitlement === "tier" || def.entitlement === "season") {
    return { marketplacePriceCents: null, pointsCost: null, priceStatus: "NOT_FOR_SALE" };
  }
  const usd = def.usdCents;
  if (typeof usd === "number" && usd >= 0) {
    return {
      marketplacePriceCents: usd,
      pointsCost: def.pointsCost > 0 ? def.pointsCost : null,
      priceStatus: "USD",
    };
  }
  if (def.pointsCost > 0) {
    return {
      marketplacePriceCents: null,
      pointsCost: def.pointsCost,
      priceStatus: "POINTS",
    };
  }
  // Missing price: fail closed — never invent 100.
  return {
    marketplacePriceCents: null,
    pointsCost: null,
    priceStatus: "PRICE_UNAVAILABLE",
  };
}

function resolveCommerceClass(def: FanCosmeticDef): AvatarCommerceClass {
  if (def.entitlement === "tier") return "TIER_INCLUDED";
  if (def.entitlement === "season" || def.season) return "SEASON_INCLUDED";
  if (isFreeByCatalog(def)) return "FREE_BASIC";
  const price = resolvePrice(def);
  if (price.priceStatus === "PRICE_UNAVAILABLE" && def.pointsCost <= 0) {
    return "NOT_FOR_SALE";
  }
  return "MARKETPLACE_ITEM";
}

export function resolveAvatarItemEconomy(
  itemId: string,
  opts?: { ownedIds?: ReadonlySet<string> | readonly string[] },
): AvatarItemEconomyResolution | null {
  const def = getFanCosmetic(itemId);
  if (!def) return null;

  const ownedSet =
    opts?.ownedIds instanceof Set
      ? opts.ownedIds
      : new Set(opts?.ownedIds ?? []);
  const free = isFreeByCatalog(def);
  const owned = free || ownedSet.has(itemId);
  const commerceClass = resolveCommerceClass(def);
  const tint = resolveTintCapability(def);
  const price = resolvePrice(def);
  const entitled =
    owned ||
    commerceClass === "TIER_INCLUDED" ||
    commerceClass === "SEASON_INCLUDED";

  return {
    itemId,
    commerceClass,
    owned,
    entitled,
    canTryOn: true,
    canEquipPersistently: entitled || free,
    supportsTint: tint.supportsTint,
    tintIncluded: tint.tintIncluded && (free || owned),
    artworkColorLocked: tint.artworkColorLocked,
    supportsMaterialVariants: Boolean(def.materialFamily),
    marketplacePriceCents: price.marketplacePriceCents,
    pointsCost: price.pointsCost,
    priceStatus: price.priceStatus,
    previewAssetId: def.glbUrl ?? def.id,
    inventoryAssetId: def.id,
    category: def.inventoryCategory ?? "unknown",
  };
}

/** Showroom rotation changes discovery only — never mutates ownership sets. */
export function rotateShowroomDiscovery(limit = 12): {
  productIds: string[];
  ROTATION_MUTATES_OWNERSHIP: false;
} {
  const fromShelf = buildFanShowcase("FEATURED").map((s) => s.productId);
  const pool = [
    ...fromShelf,
    ...SHOWROOM_DISCOVERY_POOL_IDS.filter((id) => Boolean(getFanCosmetic(id))),
  ];
  const unique = [...new Set(pool)].slice(0, limit);
  return { productIds: unique, ROTATION_MUTATES_OWNERSHIP: false };
}

export function validateSaveLookOwnership(
  equippedIds: readonly string[],
  ownedIds: ReadonlySet<string> | readonly string[],
): { ok: boolean; blockingUnowned: string[] } {
  const owned = ownedIds instanceof Set ? ownedIds : new Set(ownedIds);
  const blockingUnowned: string[] = [];
  for (const id of equippedIds) {
    if (!id || id === "none") continue;
    const res = resolveAvatarItemEconomy(id, { ownedIds: owned });
    if (!res) continue;
    if (!res.canEquipPersistently || !canCommitWearableToWorld(id, owned)) {
      if (res.commerceClass === "MARKETPLACE_ITEM" && !res.owned) {
        blockingUnowned.push(id);
      }
    }
  }
  return { ok: blockingUnowned.length === 0, blockingUnowned };
}

export function auditStarterWardrobeCoverage(): Record<string, string[]> {
  const catalog = getUnifiedFanCosmeticCatalog();
  const byId = new Map(catalog.map((c) => [c.id, c]));
  const pick = (ids: readonly string[]) =>
    ids.filter((id) => {
      const d = byId.get(id);
      return d && isFreeByCatalog(d);
    });

  return {
    STARTER_TOPS: pick(["street_fit", "tee_basic_black", "tee_basic_white", "tee_basic_cyan"]),
    STARTER_HOODIES: pick(["hoodie_street_midnight_obsidian"]),
    STARTER_PANTS: pick(["pants_fit_black", "pants_fit_denim"]),
    STARTER_SHORTS: [], // ASSET_GAP
    STARTER_SWEATS: pick(["hoodie_street_midnight_obsidian"]),
    STARTER_SHOES: pick(["kicks_white", "kicks_black"]),
    STARTER_SOCKS: [], // ASSET_GAP
    STARTER_HATS: pick(["street_beanie_black", "backwards_cap"]),
    STARTER_GLASSES: pick(["glasses_black"]),
    STARTER_RINGS: [], // ASSET_GAP
    STARTER_JEWELRY: [], // ASSET_GAP — free basic jewelry not authored; gold_chain is Marketplace
    STARTER_ACCESSORIES: pick(["mic", "backwards_cap"]),
    STARTER_ACTIONS: pick([...FREE_STARTER_ACTIONS]),
    STARTER_DANCE: pick([FREE_STARTER_DANCE]),
    STARTER_PROP: pick([FREE_STARTER_PROP]),
    ASSET_GAPS: [...STARTER_ASSET_GAPS],
  };
}

export function isStarterEntitledId(itemId: string): boolean {
  const def = getFanCosmetic(itemId);
  if (!def) return false;
  return isFreeByCatalog(def);
}
