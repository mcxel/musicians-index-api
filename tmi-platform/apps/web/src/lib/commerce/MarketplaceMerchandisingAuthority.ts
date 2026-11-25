/**
 * MarketplaceMerchandisingAuthority — §9156–9177
 *
 * Smallest merchandising aggregation / control layer over existing catalogs.
 * Does NOT replace FanCosmeticCatalog, StoreItemEngine, FlexStoreLedger,
 * VenueSkinCommerce, FanLobbySkinRegistry, PlaylistArtifactEngine, YoPho
 * catalogs, OwnershipRuntime, StoreItemOwnershipEngine, or
 * SeasonPassAftermarketAuthority.
 *
 * STORE AVAILABILITY ≠ USER OWNERSHIP.
 * System D ranking is never influenced by merchandising state.
 */

import {
  getFanCosmetic,
  getUnifiedFanCosmeticCatalog,
  type FanCosmeticDef,
} from "@/lib/avatars/FanCosmeticCatalog";
import { listCatalogProducts, SEASON_PASS_INCLUDED_SKINS } from "@/lib/venue/VenueSkinCommerceCatalog";
import { listStoreReadyFanLobbySkins, FAN_LOBBY_SKIN_CANON } from "@/lib/lobby/FanLobbySkinRegistry";
import { FLEX_STORE_CATALOG, type FlexStoreItem } from "@/lib/store/FlexStoreLedger";
import { STORE_CATALOG as ROTATION_CATALOG } from "@/lib/store/StoreRotationEngine";
import {
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  type MediaPlayerChassis,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import { YOPHO_STARTER_LAYOUTS } from "@/lib/yopho/YoPhoStarterRegistry";
import { YOPHO_SKIN_CATALOG } from "@/lib/yopho/YoPhoSkinRegistry";
import { OwnershipRuntime } from "@/lib/commerce/OwnershipRuntime";
import { STARTER_WARDROBE_MESH_TO_COSMETIC } from "@/lib/assets/FoundryPromotedAssetRegistry";
import { listIssueOneAftermarketRows } from "@/lib/season/SeasonPassAftermarketAuthority";

// ── Types ────────────────────────────────────────────────────────────────────

export type MerchandisingState =
  | "DEEP_CATALOG"
  | "ACTIVE_SHELF"
  | "RESERVE"
  | "VAULT"
  | "SEASON_PASS_POOL"
  | "FOUNDER_EXCLUSIVE"
  | "INTERNAL"
  | "UNRESOLVED"
  | "DEFAULT_FREE";

export type MerchCatalogFamily =
  | "FAN_COSMETIC"
  | "VENUE_SKIN"
  | "LOBBY_SKIN"
  | "PLAYLIST_CHASSIS"
  | "FLEX_ITEM"
  | "ROTATION_SEED"
  | "YOPHO_STARTER"
  | "YOPHO_PREMIUM"
  | "STORE_ITEM"
  | "FOUNDRY_WARDROBE";

export type MerchPersona = "FAN" | "PERFORMER" | "SHARED";

export type MerchPriceHonesty =
  | "USD_CONFIGURED"
  | "POINTS_CONFIGURED"
  | "BOTH_CONFIGURED"
  | "FREE"
  | "OWNER_VALUE_REQUIRED";

export type MerchandisingProduct = {
  /** Canonical product identity — stable across merchandising state changes. */
  canonicalId: string;
  title: string;
  family: MerchCatalogFamily;
  persona: MerchPersona;
  state: MerchandisingState;
  /** Source authority path (documentation only). */
  sourceAuthority: string;
  usdCents: number | null;
  pointsCost: number | null;
  priceHonesty: MerchPriceHonesty;
  previewCovered: boolean;
  ownershipCovered: boolean;
  equipCovered: boolean;
  href: string;
};

export type CategoryCapacity = {
  family: MerchCatalogFamily;
  activeMax: number;
};

export type FamilyCounts = {
  family: MerchCatalogFamily;
  totalEligible: number;
  active: number;
  reserve: number;
  vault: number;
  founder: number;
  seasonPassPool: number;
  defaultFree: number;
  unresolved: number;
  deepCatalog: number;
};

export type DuplicateIdentityFinding = {
  concept: string;
  ids: string[];
  resolution: "SAME_CANONICAL" | "LEGITIMATE_VARIANTS" | "SEPARATE_PRODUCTS" | "UNRESOLVED";
  note: string;
};

// ── Category capacity (configurable — not dashboard hardcode) ────────────────

export const MERCH_CATEGORY_CAPACITY: readonly CategoryCapacity[] = [
  { family: "FAN_COSMETIC", activeMax: 18 },
  { family: "LOBBY_SKIN", activeMax: 5 },
  { family: "VENUE_SKIN", activeMax: 8 },
  { family: "PLAYLIST_CHASSIS", activeMax: 6 },
  { family: "FLEX_ITEM", activeMax: 10 },
  { family: "ROTATION_SEED", activeMax: 0 }, // UI carousel only — not Store availability
  { family: "YOPHO_STARTER", activeMax: 0 }, // free starters ≠ premium shelf
  { family: "YOPHO_PREMIUM", activeMax: 4 }, // paid YoPhoSkinRegistry + /api/points/spend
  { family: "FOUNDRY_WARDROBE", activeMax: 0 }, // bind via FanCosmetic when SKUs exist
  { family: "STORE_ITEM", activeMax: 4 },
] as const;

/** Founder-exclusive canonical IDs — never auto-rotate into ordinary Store. */
export const FOUNDER_EXCLUSIVE_IDS: ReadonlySet<string> = new Set([
  "nft-founding-genesis-pass",
]);

/**
 * Curated ACTIVE_SHELF — real discovered IDs only (~40–50 target).
 * Order is stable; refreshing does not redefine availability.
 */
export const INITIAL_ACTIVE_SHELF_IDS: readonly string[] = [
  // Fan cosmetics — hair / dances / action emotes (points or free starters shown as free)
  "hair_neon_spikes",
  "hair_blonde_bob",
  "hair_gold_chrome",
  "hair_fuchsia_bangs",
  "hair_silver",
  "emote_dance_hype",
  "emote_dance_shuffle",
  "emote_dance_robot",
  "emote_dance_disco",
  "emote_dance_hiphop",
  "emote_dance_bounce",
  "action_flame_cannon",
  "action_heart_shower",
  "action_gold_coin_toss",
  "action_lightning_strike",
  "action_neon_glow_burst",
  "action_mic_drop",
  "action_smoke_haze",
  // Fan lobby skins (store_sku)
  "lobby-neon",
  "lobby-cinema",
  "lobby-chill",
  "lobby-cypher",
  "lobby-futuristic",
  // Venue skins (real VenueSkinCommerce)
  "neon-club",
  "street-corner",
  "red-theater",
  "warehouse",
  "underground-battle",
  "beach",
  "luxury-lounge",
  "festival",
  // Playlist / media-player chassis (sellable / free display)
  "tmi_neon",
  "tree",
  "fish",
  "submarine",
  "rocket",
  "steampunk",
  // Flex micro-catalog — IDs not already resolved as FanCosmetic (same asset collapsed)
  "afro-fade-gradient",
  "emote-bursting-hearts",
  "emote-flaming-stage",
  "emote-gold-champion-aura",
  "playlist-neon-cyber-skin",
  "beat-cypher-anthem-2026",
  "promotion-booster-headline",
  "venue-skin-underground-cypher",
  // YoPho premium skins (YoPhoSkinRegistry $0.99 + points spend unlock)
  "recording-studio-vip",
  "beach-house-sunset",
  "dj-club-laser-stage",
  "neon-dance-studio",
] as const;

const ACTIVE_SHELF_SET = new Set(INITIAL_ACTIVE_SHELF_IDS);

/** Runtime overrides for merchandising rotation (ACTIVE ↔ VAULT). In-memory only. */
const stateOverrides = new Map<string, MerchandisingState>();

// ── Price honesty ────────────────────────────────────────────────────────────

function resolvePriceHonesty(
  usdCents: number | null,
  pointsCost: number | null,
): MerchPriceHonesty {
  const hasUsd = usdCents != null && usdCents >= 0;
  const hasPts = pointsCost != null && pointsCost >= 0;
  if (hasUsd && usdCents === 0 && (!hasPts || pointsCost === 0)) return "FREE";
  if (hasUsd && hasPts && (usdCents! > 0 || pointsCost! > 0)) {
    if (usdCents === 0 && pointsCost! > 0) return "POINTS_CONFIGURED";
    if (pointsCost === 0 && usdCents! > 0) return "USD_CONFIGURED";
    return "BOTH_CONFIGURED";
  }
  if (hasUsd && usdCents! > 0) return "USD_CONFIGURED";
  if (hasPts && pointsCost! > 0) return "POINTS_CONFIGURED";
  if (hasUsd && usdCents === 0) return "FREE";
  if (hasPts && pointsCost === 0) return "FREE";
  return "OWNER_VALUE_REQUIRED";
}

function withOverride(id: string, base: MerchandisingState): MerchandisingState {
  return stateOverrides.get(id) ?? base;
}

// ── Family resolvers ─────────────────────────────────────────────────────────

function fanCosmeticProduct(c: FanCosmeticDef): MerchandisingProduct {
  const usd =
    c.usdCents != null
      ? c.usdCents
      : c.rarity === "free" || (c.pointsCost ?? 0) === 0
        ? 0
        : null;
  const points = c.pointsCost ?? null;
  let state: MerchandisingState = "DEEP_CATALOG";
  if (FOUNDER_EXCLUSIVE_IDS.has(c.id)) state = "FOUNDER_EXCLUSIVE";
  else if (ACTIVE_SHELF_SET.has(c.id)) state = "ACTIVE_SHELF";
  else if (c.rarity === "free" && (c.pointsCost ?? 0) === 0) state = "DEFAULT_FREE";
  else state = "RESERVE";

  return {
    canonicalId: c.id,
    title: c.label,
    family: "FAN_COSMETIC",
    persona: "FAN",
    state: withOverride(c.id, state),
    sourceAuthority: "lib/avatars/FanCosmeticCatalog.ts",
    usdCents: usd,
    pointsCost: points,
    priceHonesty: resolvePriceHonesty(usd, points),
    previewCovered: true,
    ownershipCovered: true,
    equipCovered: true,
    href: "/store/fan",
  };
}

function venueProducts(): MerchandisingProduct[] {
  return listCatalogProducts().map((p) => {
    const id = p.entitlementId;
    let state: MerchandisingState = "DEEP_CATALOG";
    if (ACTIVE_SHELF_SET.has(id)) state = "ACTIVE_SHELF";
    else if (SEASON_PASS_INCLUDED_SKINS.has(id)) state = "SEASON_PASS_POOL";
    else state = "RESERVE";
    return {
      canonicalId: id,
      title: p.name,
      family: "VENUE_SKIN" as const,
      persona: "PERFORMER" as const,
      state: withOverride(id, state),
      sourceAuthority: "lib/venue/VenueSkinCommerce.ts",
      usdCents: p.priceCents,
      pointsCost: null,
      priceHonesty: resolvePriceHonesty(p.priceCents, null),
      previewCovered: true,
      ownershipCovered: true,
      equipCovered: true,
      href: "/store/venue-skins",
    };
  });
}

function lobbyProducts(): MerchandisingProduct[] {
  return FAN_LOBBY_SKIN_CANON.map((s) => {
    let state: MerchandisingState = "UNRESOLVED";
    if (s.status === "store_sku") {
      state = ACTIVE_SHELF_SET.has(s.id) ? "ACTIVE_SHELF" : "RESERVE";
    } else if (s.status === "concept_folder") {
      state = "RESERVE";
    } else {
      state = "UNRESOLVED";
    }
    const usd = s.priceCents ?? null;
    return {
      canonicalId: s.id,
      title: s.label,
      family: "LOBBY_SKIN" as const,
      persona: "FAN" as const,
      state: withOverride(s.id, state),
      sourceAuthority: "lib/lobby/FanLobbySkinRegistry.ts",
      usdCents: usd,
      pointsCost: null,
      priceHonesty:
        s.status === "store_sku"
          ? resolvePriceHonesty(usd, null)
          : "OWNER_VALUE_REQUIRED",
      previewCovered: s.conceptRefs.length > 0,
      ownershipCovered: s.status === "store_sku",
      equipCovered: s.status === "store_sku" || s.status === "concept_folder",
      href: "/store/lobbies",
    };
  });
}

function playlistProducts(): MerchandisingProduct[] {
  return (Object.keys(MEDIA_PLAYER_CHASSIS_REGISTRY) as MediaPlayerChassisId[]).map((id) => {
    const c: MediaPlayerChassis = MEDIA_PLAYER_CHASSIS_REGISTRY[id];
    const usd = c.priceUsdCents ?? (c.unlockMethod === "free" ? 0 : null);
    const points = c.pricePoints ?? null;
    let state: MerchandisingState = "DEEP_CATALOG";
    if (c.freeDefault || c.unlockMethod === "free") state = "DEFAULT_FREE";
    if (ACTIVE_SHELF_SET.has(id)) state = "ACTIVE_SHELF";
    else if (c.unlockMethod === "tier") state = "RESERVE";
    else if (state === "DEEP_CATALOG") state = "RESERVE";
    return {
      canonicalId: id,
      title: c.label,
      family: "PLAYLIST_CHASSIS" as const,
      persona: "SHARED" as const,
      state: withOverride(id, state),
      sourceAuthority: "lib/artifacts/PlaylistArtifactEngine.ts",
      usdCents: usd,
      pointsCost: points,
      priceHonesty: resolvePriceHonesty(usd, points),
      previewCovered: true,
      ownershipCovered: true,
      equipCovered: true,
      href: "/store/media-players",
    };
  });
}

function flexProducts(): MerchandisingProduct[] {
  return FLEX_STORE_CATALOG.map((item: FlexStoreItem) => {
    let state: MerchandisingState = "RESERVE";
    if (FOUNDER_EXCLUSIVE_IDS.has(item.id)) state = "FOUNDER_EXCLUSIVE";
    else if (ACTIVE_SHELF_SET.has(item.id)) state = "ACTIVE_SHELF";
    else if (item.itemType === "YOPHO_TEMPLATE") state = "UNRESOLVED"; // §9168 chain open
    const persona: MerchPersona =
      item.itemType === "BEAT_LICENSE" || item.itemType === "PROMOTION_BOOSTER"
        ? "PERFORMER"
        : item.itemType === "APPAREL" || item.itemType === "HAIR" || item.itemType === "ACCESSORY" || item.itemType === "EMOTE"
          ? "FAN"
          : "SHARED";
    return {
      canonicalId: item.id,
      title: item.name,
      family: "FLEX_ITEM" as const,
      persona,
      state: withOverride(item.id, state),
      sourceAuthority: "lib/store/FlexStoreLedger.ts",
      usdCents: item.priceCents,
      pointsCost: null,
      priceHonesty: resolvePriceHonesty(item.priceCents, null),
      previewCovered: Boolean(item.preview?.thumbnail),
      ownershipCovered: true,
      equipCovered: Boolean(getFanCosmetic(item.id)) || item.itemType === "PLAYLIST_SKIN",
      href: "/store/flex",
    };
  });
}

function rotationSeedProducts(): MerchandisingProduct[] {
  // UI carousel seeds only — never claim as Store availability (§9172)
  return ROTATION_CATALOG.map((item) => ({
    canonicalId: item.id,
    title: item.name,
    family: "ROTATION_SEED" as const,
    persona: item.category.includes("performer") ? ("PERFORMER" as const) : ("SHARED" as const),
    state: withOverride(item.id, "INTERNAL" as MerchandisingState),
    sourceAuthority: "lib/store/StoreRotationEngine.ts",
    usdCents: item.currency === "USD" ? Math.round(item.price * 100) : null,
    pointsCost: item.currency === "TMI_POINTS" ? item.price : null,
    priceHonesty: resolvePriceHonesty(
      item.currency === "USD" ? Math.round(item.price * 100) : null,
      item.currency === "TMI_POINTS" ? item.price : null,
    ),
    previewCovered: false,
    ownershipCovered: false,
    equipCovered: false,
    href: item.route,
  }));
}

function yophoStarterProducts(): MerchandisingProduct[] {
  return YOPHO_STARTER_LAYOUTS.map((s) => ({
    canonicalId: s.id,
    title: s.label,
    family: "YOPHO_STARTER" as const,
    persona: "SHARED" as const,
    state: withOverride(s.id, "DEFAULT_FREE" as MerchandisingState),
    sourceAuthority: "lib/yopho/YoPhoStarterRegistry.ts",
    usdCents: 0,
    pointsCost: 0,
    priceHonesty: "FREE" as const,
    previewCovered: true,
    ownershipCovered: false,
    equipCovered: true,
    href: "/yopho",
  }));
}

/**
 * Paid YoPho canvas skins — points unlock via PointsSpendCatalog + /api/points/spend.
 * Free starter stays in YOPHO_STARTER / DEFAULT_FREE, never here.
 * Flex YOPHO_TEMPLATE rows remain UNRESOLVED (separate, still open).
 */
function yophoPremiumProducts(): MerchandisingProduct[] {
  return YOPHO_SKIN_CATALOG.filter((s) => !s.isFreeStarter && s.priceUsd > 0).map((s) => {
    const usdCents = Math.round(s.priceUsd * 100);
    const pointsCost = Math.max(99, usdCents);
    let state: MerchandisingState = "RESERVE";
    if (ACTIVE_SHELF_SET.has(s.id)) state = "ACTIVE_SHELF";
    return {
      canonicalId: s.id,
      title: s.name.replace(/\s*\(\$0\.99\)\s*$/i, "").trim(),
      family: "YOPHO_PREMIUM" as const,
      persona: "SHARED" as const,
      state: withOverride(s.id, state),
      sourceAuthority: "lib/yopho/YoPhoSkinRegistry.ts",
      usdCents,
      pointsCost,
      priceHonesty: resolvePriceHonesty(usdCents, pointsCost),
      previewCovered: Boolean(s.previewThumbnail || s.fallbackImageUrl || s.videoBgUrl),
      ownershipCovered: true, // ledger unlock via yophoPointsUnlock / points spend
      equipCovered: true, // unlockSkinById + canvas skin picker
      href: "/hub/fan?drawer=yopho",
    };
  });
}

function foundryWardrobeProducts(): MerchandisingProduct[] {
  return Object.entries(STARTER_WARDROBE_MESH_TO_COSMETIC).map(([mesh, cosmeticId]) => {
    const cosmetic = getFanCosmetic(cosmeticId);
    return {
      canonicalId: `foundry:${mesh}`,
      title: cosmetic?.label ?? mesh,
      family: "FOUNDRY_WARDROBE" as const,
      persona: "FAN" as const,
      state: withOverride(
        `foundry:${mesh}`,
        cosmetic ? "DEEP_CATALOG" : ("UNRESOLVED" as MerchandisingState),
      ),
      sourceAuthority: "lib/assets/FoundryPromotedAssetRegistry.ts",
      usdCents: cosmetic ? (cosmetic.usdCents ?? (cosmetic.rarity === "free" ? 0 : null)) : null,
      pointsCost: cosmetic?.pointsCost ?? null,
      priceHonesty: cosmetic
        ? resolvePriceHonesty(
            cosmetic.usdCents ?? (cosmetic.rarity === "free" ? 0 : null),
            cosmetic.pointsCost ?? null,
          )
        : ("OWNER_VALUE_REQUIRED" as const),
      previewCovered: Boolean(cosmetic),
      ownershipCovered: Boolean(cosmetic),
      equipCovered: Boolean(cosmetic),
      href: "/avatar/studio",
    };
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

/** All resolved merchandising products across connected families. */
export function listAllMerchandisingProducts(): MerchandisingProduct[] {
  const fan = getUnifiedFanCosmeticCatalog().map(fanCosmeticProduct);
  const merged = [
    ...fan,
    ...venueProducts(),
    ...lobbyProducts(),
    ...playlistProducts(),
    ...flexProducts(),
    ...rotationSeedProducts(),
    ...yophoStarterProducts(),
    ...yophoPremiumProducts(),
    ...foundryWardrobeProducts(),
  ];
  // One canonical identity wins — first family resolver keeps the primary row.
  const byId = new Map<string, MerchandisingProduct>();
  for (const p of merged) {
    if (!byId.has(p.canonicalId)) byId.set(p.canonicalId, p);
  }
  return [...byId.values()];
}

export function getMerchandisingProduct(canonicalId: string): MerchandisingProduct | undefined {
  return listAllMerchandisingProducts().find((p) => p.canonicalId === canonicalId);
}

/** Customer-facing active assortment — stable, capacity-capped per family. */
export function listActiveShelfProducts(): MerchandisingProduct[] {
  const all = listAllMerchandisingProducts();
  const byId = new Map(all.map((p) => [p.canonicalId, p]));
  const capacity = new Map(MERCH_CATEGORY_CAPACITY.map((c) => [c.family, c.activeMax]));
  const counts = new Map<MerchCatalogFamily, number>();
  const out: MerchandisingProduct[] = [];
  const seen = new Set<string>();

  // Stable curated order first, then any rotation promote-ins.
  const orderedIds = [
    ...INITIAL_ACTIVE_SHELF_IDS,
    ...all.filter((p) => p.state === "ACTIVE_SHELF" && !ACTIVE_SHELF_SET.has(p.canonicalId)).map((p) => p.canonicalId),
  ];

  for (const id of orderedIds) {
    if (seen.has(id)) continue;
    const product = byId.get(id);
    if (!product) continue;
    if (FOUNDER_EXCLUSIVE_IDS.has(id)) continue;
    if (product.family === "YOPHO_STARTER") continue; // free starters never on premium shelf
    // Respect merchandising overrides — vaulted items leave the shelf (§9172).
    if (product.state === "VAULT" || product.state === "FOUNDER_EXCLUSIVE" || product.state === "INTERNAL") {
      continue;
    }
    const max = capacity.get(product.family) ?? 0;
    const used = counts.get(product.family) ?? 0;
    if (used >= max) continue;
    seen.add(id);
    out.push({ ...product, state: "ACTIVE_SHELF" });
    counts.set(product.family, used + 1);
  }
  return out;
}

export function listProductsByState(state: MerchandisingState): MerchandisingProduct[] {
  return listAllMerchandisingProducts().filter((p) => p.state === state);
}

export function getFamilyCounts(): FamilyCounts[] {
  const families = MERCH_CATEGORY_CAPACITY.map((c) => c.family);
  const all = listAllMerchandisingProducts();
  return families.map((family) => {
    const rows = all.filter((p) => p.family === family);
    const count = (s: MerchandisingState) => rows.filter((p) => p.state === s).length;
    return {
      family,
      totalEligible: rows.length,
      active: count("ACTIVE_SHELF"),
      reserve: count("RESERVE"),
      vault: count("VAULT"),
      founder: count("FOUNDER_EXCLUSIVE"),
      seasonPassPool: count("SEASON_PASS_POOL"),
      defaultFree: count("DEFAULT_FREE"),
      unresolved: count("UNRESOLVED"),
      deepCatalog: count("DEEP_CATALOG") + count("INTERNAL"),
    };
  });
}

/**
 * Rotate A out of ACTIVE into VAULT; optionally promote B into ACTIVE.
 * Ownership is never touched — STORE ≠ OWNERSHIP (§9159).
 */
export function rotateShelfProduct(input: {
  rotateOutId: string;
  rotateInId?: string;
}): { ok: true; out: string; inn?: string } | { ok: false; reason: string } {
  const outProduct = getMerchandisingProduct(input.rotateOutId);
  if (!outProduct) return { ok: false, reason: "ROTATE_OUT_NOT_FOUND" };
  if (FOUNDER_EXCLUSIVE_IDS.has(input.rotateOutId)) {
    return { ok: false, reason: "FOUNDER_EXCLUSIVE_LOCKED" };
  }
  stateOverrides.set(input.rotateOutId, "VAULT");
  if (input.rotateInId) {
    if (FOUNDER_EXCLUSIVE_IDS.has(input.rotateInId)) {
      return { ok: false, reason: "FOUNDER_EXCLUSIVE_LOCKED" };
    }
    const inn = getMerchandisingProduct(input.rotateInId);
    if (!inn) return { ok: false, reason: "ROTATE_IN_NOT_FOUND" };
    if (inn.family === "YOPHO_STARTER") {
      return { ok: false, reason: "YOPHO_STARTER_NOT_SELLABLE" };
    }
    stateOverrides.set(input.rotateInId, "ACTIVE_SHELF");
    return { ok: true, out: input.rotateOutId, inn: input.rotateInId };
  }
  return { ok: true, out: input.rotateOutId };
}

export function clearMerchandisingOverrides(): void {
  stateOverrides.clear();
}

/** Ownership survives vault — never inferred from shelf state. */
export function ownedItemRemainsUsable(userId: string, skuId: string): boolean {
  return OwnershipRuntime.hasEntitlement(userId, skuId);
}

export function listDuplicateIdentityFindings(): DuplicateIdentityFinding[] {
  return [
    {
      concept: "neon jacket / cyber jacket",
      ids: ["cyber-jacket-neon", "cl-01", "clothing-neon-jacket"],
      resolution: "SAME_CANONICAL",
      note: "FanCosmetic + Flex share cyber-jacket-neon — merchandising collapses to one FAN_COSMETIC identity. Rotation clothing-neon-jacket remains INTERNAL seed.",
    },
    {
      concept: "crown tee",
      ids: ["cl-02", "clothing-crown-tee"],
      resolution: "SEPARATE_PRODUCTS",
      note: "Rotation seed only (INTERNAL). No FanCosmetic twin with same id.",
    },
    {
      concept: "venue skin naming",
      ids: ["venue-skin-rooftop-penthouse", "neon-club", "venue-club"],
      resolution: "SEPARATE_PRODUCTS",
      note: "Flex venue skins ≠ VenueSkinCommerce keys ≠ dead StoreItemEngine VENUE_ITEMS.",
    },
    {
      concept: "foundry hair_afro bind",
      ids: ["Hair_Afro_Classic", "hair_afro"],
      resolution: "SAME_CANONICAL",
      note: "STARTER_WARDROBE_MESH_TO_COSMETIC maps mesh → hair_afro FanCosmetic.",
    },
    {
      concept: "foundry taper / braids / kicks / mic SKUs",
      ids: ["hair_taper_high", "hair_braids", "holographic-sneakers-gold", "mic_gold"],
      resolution: "SAME_CANONICAL",
      note: "STARTER_WARDROBE_MESH_TO_COSMETIC rebound to existing FanCosmetic IDs (no invented SKUs).",
    },
  ];
}

export function getMerchandisingDashboardSummary() {
  const all = listAllMerchandisingProducts();
  const active = listActiveShelfProducts();
  const counts = getFamilyCounts();
  const priceCovered = all.filter(
    (p) =>
      p.priceHonesty === "USD_CONFIGURED" ||
      p.priceHonesty === "POINTS_CONFIGURED" ||
      p.priceHonesty === "BOTH_CONFIGURED" ||
      p.priceHonesty === "FREE",
  ).length;
  const pointsCovered = all.filter(
    (p) =>
      p.priceHonesty === "POINTS_CONFIGURED" ||
      p.priceHonesty === "BOTH_CONFIGURED" ||
      (p.pointsCost != null && p.pointsCost > 0),
  ).length;
  const ownerValueRequired = all.filter((p) => p.priceHonesty === "OWNER_VALUE_REQUIRED").length;
  const yophoMarketplaceReady = all.filter(
    (p) => p.family === "YOPHO_PREMIUM" && p.state === "ACTIVE_SHELF",
  ).length;

  return {
    headline:
      "150+ Verified Deep-Catalog Assets · Unified Active Shelf In Convergence",
    totalCanonicalProducts: all.length,
    activeShelfCount: active.length,
    familyCounts: counts,
    founderCount: all.filter((p) => p.state === "FOUNDER_EXCLUSIVE").length,
    unresolvedCount: all.filter((p) => p.state === "UNRESOLVED").length,
    priceCoveredCount: priceCovered,
    pointsCoveredCount: pointsCovered,
    ownerValueRequiredPriceCount: ownerValueRequired,
    previewCoveredCount: all.filter((p) => p.previewCovered).length,
    ownershipCoveredCount: all.filter((p) => p.ownershipCovered).length,
    equipCoveredCount: all.filter((p) => p.equipCovered).length,
    yophoMarketplaceReadyCount: yophoMarketplaceReady,
    yophoStarterCount: all.filter((p) => p.family === "YOPHO_STARTER").length,
    seasonPassAftermarketReadyCount: listIssueOneAftermarketRows().filter(
      (r) => r.sellable && r.storeBound,
    ).length,
    duplicateFindings: listDuplicateIdentityFindings(),
    marketplaceHardcodedDemoStatus: "REMOVED_FROM_PRODUCTION_FACE — page binds listActiveShelfProducts()",
    systemDSeparation: "PRESERVED — merchandising never writes PerformerScoreEngine",
  };
}

export const MarketplaceMerchandisingAuthority = {
  listAllMerchandisingProducts,
  getMerchandisingProduct,
  listActiveShelfProducts,
  listProductsByState,
  getFamilyCounts,
  rotateShelfProduct,
  clearMerchandisingOverrides,
  ownedItemRemainsUsable,
  listDuplicateIdentityFindings,
  getMerchandisingDashboardSummary,
  INITIAL_ACTIVE_SHELF_IDS,
  MERCH_CATEGORY_CAPACITY,
  FOUNDER_EXCLUSIVE_IDS,
};

/** Soft link for CosmeticMerchandisingDirector consumers — Fan showcase may prefer shelf. */
export function listStoreReadyFanLobbySkinsActive() {
  return listStoreReadyFanLobbySkins().filter((s) => ACTIVE_SHELF_SET.has(s.id));
}
