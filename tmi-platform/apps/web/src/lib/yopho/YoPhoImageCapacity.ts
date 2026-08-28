/**
 * YoPho composition capacity law — IMAGE SLOTS vs TOTAL LAYERS vs MEDIA MODULES.
 *
 * IMAGE SLOT = source picture / background / cutout image.
 * TOTAL LAYER = anything in the stack (images, masks, text, stickers, overlays,
 * frames, effects, shadows). Applying an owned effect onto an existing image
 * does NOT burn an extra IMAGE SLOT — it still counts as a total layer if it
 * is a new stack item (overlay / texture).
 *
 * MEDIA MODULES stay a separate budget (optional player; never steal image slots).
 *
 * Tier canon: FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND.
 * Never Bronze. Bronze maps to RUBY. Diamond is NOT unlimited.
 *
 * FREE = 2 source pictures + 1 background = 3 image slots + 12 total layers + 1 media module.
 *
 *   Tier      | Image slots | Total layers | Media modules
 *   FREE      | 3           | 12           | 1
 *   PRO       | 5           | 18           | 1
 *   RUBY      | 6           | 24           | 1
 *   SILVER    | 8           | 32           | 2
 *   GOLD      | 12          | 48           | 2
 *   PLATINUM  | 16          | 64           | 3
 *   DIAMOND   | 24          | 96           | 4
 */

import {
  getPortraitEntitlement,
  type SubscriptionPortraitEntitlement,
  type YoPhoPortraitBlueprint,
  type PortraitLayer,
} from "./YoPhoPortraitEngine";

export const YOPHO_TIER_LADDER = [
  "FREE",
  "PRO",
  "RUBY",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
] as const;

export type YoPhoMembershipTier = (typeof YOPHO_TIER_LADDER)[number];

export type YoPhoBudgetKind = "image" | "text" | "effects" | "stickers" | "masks" | "media";

/** Kinds that never consume IMAGE SLOTS. */
export const YOPHO_NON_IMAGE_BUDGET_KINDS: readonly YoPhoBudgetKind[] = [
  "text",
  "effects",
  "stickers",
  "masks",
  "media",
];

/** Locked — source pictures / backgrounds / cutouts. Saved library is unbounded separately. */
export const YOPHO_IMAGE_CAPACITY_BY_TIER: Record<string, number> = {
  FREE: 3,
  PRO: 5,
  RUBY: 6,
  SILVER: 8,
  GOLD: 12,
  PLATINUM: 16,
  DIAMOND: 24,
  /** Band role maps to PLATINUM image count — not a parallel ladder. */
  BAND: 16,
};

/**
 * Locked — everything in the composition stack, including image slots.
 * Diamond is a high cap, not unlimited.
 */
export const YOPHO_TOTAL_LAYER_CAPACITY_BY_TIER: Record<string, number> = {
  FREE: 12,
  PRO: 18,
  RUBY: 24,
  SILVER: 32,
  GOLD: 48,
  PLATINUM: 64,
  DIAMOND: 96,
  BAND: 64,
};

/** Locked — optional media modules on a card. Does not consume image slots or total layers. */
export const YOPHO_MEDIA_MODULE_CAPACITY_BY_TIER: Record<string, number> = {
  FREE: 1,
  PRO: 1,
  RUBY: 1,
  SILVER: 2,
  GOLD: 2,
  PLATINUM: 3,
  DIAMOND: 4,
  BAND: 3,
};

export const YOPHO_SEPARATE_BUDGET_NOTE =
  "IMAGE SLOT = picture / background / cutout. TOTAL LAYER = every stack item. MEDIA is a separate budget. Owned effects on an existing image do not burn an extra image slot.";

/** Existing Stripe / membership path — /upgrade also exists (redirects to season-pass). */
export const YOPHO_UPGRADE_HREF = "/account/subscription";

export interface YoPhoImageCapacity {
  tierKey: string;
  maxImages: number;
  maxTotalLayers: number;
  maxMediaModules: number;
  /** FREE still has 3 image slots — strip is active within capacity */
  multiImageEnabled: boolean;
  entitlement: SubscriptionPortraitEntitlement;
  upgradeHref: string;
}

export function normalizeYoPhoTier(tierOrRole: string | undefined | null): string {
  const raw = (tierOrRole || "FREE").toUpperCase().trim();
  if (raw === "MEMBER") return "FREE";
  if (raw === "BRONZE") return "RUBY";
  if (raw === "FAN" || raw === "PERFORMER" || raw === "ARTIST" || raw === "WRITER") return "FREE";
  return raw;
}

function lookupCap(map: Record<string, number>, key: string, fallback: number): number {
  const value = map[key];
  return typeof value === "number" ? value : fallback;
}

/**
 * Resolve YoPho working-image + total-layer + media-module capacity from membership
 * tier or Band role. Prefer account tier string from session; pass "BAND" when role is BAND.
 */
export function getYoPhoImageCapacity(tierOrRole?: string | null): YoPhoImageCapacity {
  const key = normalizeYoPhoTier(tierOrRole);
  const entitlementTier = key === "BAND" ? "PLATINUM" : key;
  const entitlement = getPortraitEntitlement(entitlementTier);

  const maxFromMap = YOPHO_IMAGE_CAPACITY_BY_TIER[key];
  const maxImages =
    typeof maxFromMap === "number"
      ? maxFromMap
      : Math.max(1, entitlement.maxActivePortraits ?? 3);

  return {
    tierKey: key,
    maxImages,
    maxTotalLayers: lookupCap(YOPHO_TOTAL_LAYER_CAPACITY_BY_TIER, key, 12),
    maxMediaModules: lookupCap(YOPHO_MEDIA_MODULE_CAPACITY_BY_TIER, key, 1),
    multiImageEnabled: maxImages > 1,
    entitlement,
    upgradeHref: YOPHO_UPGRADE_HREF,
  };
}

/** Source picture / background / cutout — not effects, text, stickers, masks. */
export function yoPhoLayerConsumesImageSlot(layer: PortraitLayer): boolean {
  return (layer.budgetKind ?? "image") === "image";
}

export function countYoPhoImageSlots(bp: YoPhoPortraitBlueprint): number {
  return [bp.primaryLayer, ...bp.secondaryLayers].filter(yoPhoLayerConsumesImageSlot).length;
}

/**
 * Everything in the stack: image slots + non-image stack items + enabled overlays
 * + object mask + one texture if it is not none.
 */
export function countYoPhoTotalLayers(bp: YoPhoPortraitBlueprint): number {
  const stack = 1 + bp.secondaryLayers.length;
  const overlays = (bp.portraitEffects ?? []).filter((effect) => effect.enabled).length;
  const mask = bp.objectMask ? 1 : 0;
  const texture = bp.texturePreset && bp.texturePreset !== "none" ? 1 : 0;
  return stack + overlays + mask + texture;
}

export function canAddYoPhoImage(currentCount: number, tierOrRole?: string | null): boolean {
  const { maxImages } = getYoPhoImageCapacity(tierOrRole);
  return currentCount < maxImages;
}

export function canAddYoPhoTotalLayer(currentCount: number, tierOrRole?: string | null): boolean {
  const { maxTotalLayers } = getYoPhoImageCapacity(tierOrRole);
  return currentCount < maxTotalLayers;
}

export function canAddYoPhoMediaModule(currentCount: number, tierOrRole?: string | null): boolean {
  const { maxMediaModules } = getYoPhoImageCapacity(tierOrRole);
  return currentCount < maxMediaModules;
}

/** Triple-Stage ADD kinds that consume an IMAGE SLOT (pictures / backgrounds / cutouts only). */
export function yoPhoAddKindConsumesImageSlot(kind: string): boolean {
  return kind === "photo" || kind === "background" || kind === "cutout";
}

export function yoPhoBudgetKindForAddLayer(kind: string): YoPhoBudgetKind | "unsupported" {
  if (kind === "video") return "unsupported";
  if (kind === "photo" || kind === "background" || kind === "cutout") return "image";
  if (kind === "text") return "text";
  if (kind === "effect" || kind === "particle" || kind === "animation" || kind === "shadow") {
    return "effects";
  }
  if (kind === "prop" || kind === "logo" || kind === "frame") return "stickers";
  if (kind === "mask") return "masks";
  if (kind === "media") return "media";
  return "image";
}

export type YoPhoAddBlockReason = "image" | "total" | "unsupported";

export type YoPhoAddVerdict =
  | { ok: true }
  | { ok: false; reason: YoPhoAddBlockReason; message: string };

/**
 * Triple-Stage ADD gate. Image-slot and total-layer are separate:
 * photo/background/cutout must pass both; text/stickers/masks/effects pass total-layer only.
 */
export function evaluateYoPhoAdd(
  bp: YoPhoPortraitBlueprint,
  kind: string,
  tierOrRole?: string | null,
): YoPhoAddVerdict {
  if (kind === "video") {
    return {
      ok: false,
      reason: "unsupported",
      message: "Video cutout layers are not available this pass. Attach audio in the Media tab.",
    };
  }
  if (kind === "media") {
    // Media is a separate budget — never steals image slots or total layers.
    return { ok: true };
  }

  const consumesImage = yoPhoAddKindConsumesImageSlot(kind);
  if (consumesImage && !canAddYoPhoImage(countYoPhoImageSlots(bp), tierOrRole)) {
    return { ok: false, reason: "image", message: yoPhoImageCapMessage(tierOrRole) };
  }
  if (!canAddYoPhoTotalLayer(countYoPhoTotalLayers(bp), tierOrRole)) {
    return { ok: false, reason: "total", message: yoPhoTotalLayerCapMessage(tierOrRole) };
  }
  return { ok: true };
}

/**
 * Owned effect / overlay / texture applied onto an existing image.
 * Never burns an extra IMAGE SLOT. A brand-new overlay or first texture
 * still consumes one TOTAL LAYER.
 */
export function canApplyYoPhoOwnedEffect(
  bp: YoPhoPortraitBlueprint,
  alreadyOnStack: boolean,
  tierOrRole?: string | null,
): boolean {
  if (alreadyOnStack) return true;
  return canAddYoPhoTotalLayer(countYoPhoTotalLayers(bp), tierOrRole);
}

export function yoPhoImageCapMessage(tierOrRole?: string | null): string {
  const { tierKey, maxImages } = getYoPhoImageCapacity(tierOrRole);
  const label = tierKey === "BAND" ? "BAND (PLATINUM image cap)" : tierKey;
  return `Image slot cap is ${maxImages} on ${label}. Diamond is not unlimited. Upgrade for more source pictures / backgrounds / cutouts.`;
}

export function yoPhoTotalLayerCapMessage(tierOrRole?: string | null): string {
  const { tierKey, maxTotalLayers } = getYoPhoImageCapacity(tierOrRole);
  const label = tierKey === "BAND" ? "BAND (PLATINUM layer cap)" : tierKey;
  return `Total layer cap is ${maxTotalLayers} on ${label}. Diamond is not unlimited. Upgrade for a deeper stack (images, masks, text, stickers, overlays, frames, effects).`;
}

export function yoPhoMediaCapMessage(tierOrRole?: string | null): string {
  const { tierKey, maxMediaModules } = getYoPhoImageCapacity(tierOrRole);
  const label = tierKey === "BAND" ? "BAND" : tierKey;
  return `Media module cap is ${maxMediaModules} on ${label}. Extra modules stay visual / tap-to-play — one audible source.`;
}

/** Honest gate when a saved edition exceeds the current membership. */
export function trimYoPhoBlueprintToCapacity(
  bp: YoPhoPortraitBlueprint,
  tierOrRole?: string | null,
): YoPhoPortraitBlueprint {
  const { maxImages, maxTotalLayers } = getYoPhoImageCapacity(tierOrRole);
  const primaryIsImage = yoPhoLayerConsumesImageSlot(bp.primaryLayer);
  const imageSecondaries = bp.secondaryLayers.filter(yoPhoLayerConsumesImageSlot);
  const nonImageSecondaries = bp.secondaryLayers.filter((layer) => !yoPhoLayerConsumesImageSlot(layer));
  const maxImageSecondaries = Math.max(0, maxImages - (primaryIsImage ? 1 : 0));

  let next: YoPhoPortraitBlueprint = {
    ...bp,
    secondaryLayers: [...imageSecondaries.slice(0, maxImageSecondaries), ...nonImageSecondaries],
  };
  next.activePortraitsCount = Math.min(
    [next.primaryLayer, ...next.secondaryLayers].filter((layer) => Boolean(layer.imageUrl?.trim())).length,
    maxImages,
  );

  let effects = [...(next.portraitEffects ?? [])];
  while (countYoPhoTotalLayers({ ...next, portraitEffects: effects }) > maxTotalLayers && effects.length > 0) {
    effects.pop();
  }
  next = { ...next, portraitEffects: effects };

  if (countYoPhoTotalLayers(next) > maxTotalLayers && next.texturePreset !== "none") {
    next = { ...next, texturePreset: "none" };
  }
  if (countYoPhoTotalLayers(next) > maxTotalLayers && next.objectMask) {
    next = { ...next, objectMask: undefined };
  }

  let extras = next.secondaryLayers.filter((layer) => !yoPhoLayerConsumesImageSlot(layer));
  let keptImages = next.secondaryLayers.filter(yoPhoLayerConsumesImageSlot);
  while (countYoPhoTotalLayers({ ...next, secondaryLayers: [...keptImages, ...extras] }) > maxTotalLayers && extras.length > 0) {
    extras.pop();
  }
  next = { ...next, secondaryLayers: [...keptImages, ...extras] };
  return next;
}
