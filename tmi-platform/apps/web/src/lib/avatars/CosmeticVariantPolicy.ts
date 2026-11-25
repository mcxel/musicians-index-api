/**
 * CosmeticVariantPolicy — universal seasonal / holiday / event variant rules, ownership vs
 * availability, and modular wear layers (masks, full character heads, hats, costumes).
 *
 * NOT a new catalog: items stay in FanCosmeticCatalog (single ID scheme, colorwayOf, AI colorway
 * factory, entitlement kinds). This module adds the rules every surface must share:
 *
 *   1. Availability ≠ ownership. A seasonal store window ending stops NEW purchases only.
 *      A purchased/earned permanent item stays owned and equippable forever (CostumeFaceExposedPolicy
 *      already locked CATALOG_RETIREMENT_REVOKES_OWNERSHIP = 0; this generalizes it).
 *   2. Season Pass / rental / event access is explicit and expires at its own end time.
 *   3. Regions and timezones are data; no calendar is assumed global.
 *   4. Wear layers: one item per layer; FULL_HEAD hides HAIR/HAT/FACE while worn, FULL_BODY hides
 *      UPPER/LOWER — hidden items stay equipped in the saved look (never deleted).
 *   5. Nothing here auto-purchases, auto-equips or replaces a user's items.
 */

export type VariantOwnershipType = "PERMANENT" | "PASS_ENTITLED" | "RENTAL" | "EVENT_ACCESS";

export type CosmeticAvailability = {
  themeId?: string;
  /** e.g. "halloween", "christmas", "valentines", "new_years", "juneteenth", "pride", "tmi_anniversary". */
  holidayOrEventId?: string;
  /** ISO timestamps; absent = always on sale (subject to productionReady). */
  availabilityStart?: string;
  availabilityEnd?: string;
  /** IANA zone the window is defined in (documentation; timestamps are absolute). */
  timezone?: string;
  /** ISO country codes; absent = all regions. */
  regionEligibility?: string[];
  ownershipType: VariantOwnershipType;
  catalogItemId?: string;
  seasonPassRewardId?: string;
  isPlaceholder: boolean;
  productionReady: boolean;
};

/** Can this be bought / claimed right now (store rotation only — says nothing about ownership)? */
export function isAvailableForNewAcquisition(
  a: CosmeticAvailability,
  input: { nowMs: number; region?: string | null; placeholdersAllowed?: boolean },
): boolean {
  if (a.isPlaceholder && !input.placeholdersAllowed) return false;
  if (!a.productionReady && !input.placeholdersAllowed) return false;
  if (a.availabilityStart && input.nowMs < Date.parse(a.availabilityStart)) return false;
  if (a.availabilityEnd && input.nowMs >= Date.parse(a.availabilityEnd)) return false;
  if (a.regionEligibility && a.regionEligibility.length > 0) {
    const r = (input.region ?? "").toUpperCase();
    if (!r || !a.regionEligibility.map((x) => x.toUpperCase()).includes(r)) return false;
  }
  return true;
}

export type CosmeticGrant = {
  source: "starter" | "points" | "grant" | "stripe" | "earned" | "season_pass" | "rental" | "event";
  grantedAtMs: number;
  /** Required for season_pass/rental/event access; ignored for permanent sources. */
  expiresAtMs?: number | null;
  /** Set when a payment was refunded/charged back (RefundEntitlementRevocation). */
  revokedAtMs?: number | null;
};

export type CosmeticAccess = "PURCHASED" | "EARNED" | "PASS_ENTITLED" | "EXPIRED" | "NONE";

const PERMANENT_SOURCES = new Set<CosmeticGrant["source"]>(["starter", "points", "grant", "stripe", "earned"]);

/**
 * Best access the user holds right now. Store availability is deliberately NOT an input:
 * a Halloween glowstick bought in October is still PURCHASED in March.
 */
export function resolveCosmeticAccess(grants: readonly CosmeticGrant[], nowMs: number): CosmeticAccess {
  let sawExpired = false;
  let best: CosmeticAccess = "NONE";
  for (const g of grants) {
    if (g.revokedAtMs != null && g.revokedAtMs <= nowMs) continue;
    if (PERMANENT_SOURCES.has(g.source)) {
      if (g.source !== "earned") return "PURCHASED"; // a live purchase is the strongest access
      best = "EARNED";
      continue;
    }
    // Time-limited access must carry an explicit end; no end = treated as expired (fail closed).
    if (g.expiresAtMs != null && nowMs < g.expiresAtMs) {
      if (best === "NONE") best = "PASS_ENTITLED";
    } else {
      sawExpired = true;
    }
  }
  if (best !== "NONE") return best;
  return sawExpired ? "EXPIRED" : "NONE";
}

export const canEquip = (access: CosmeticAccess) => access === "PURCHASED" || access === "EARNED" || access === "PASS_ENTITLED";

// ─── Modular wear layers ──────────────────────────────────────────────────────

export type WearLayer =
  | "FULL_HEAD"
  | "FACE"
  | "HAT"
  | "HAIR"
  | "UPPER_BODY"
  | "LOWER_BODY"
  | "FULL_BODY"
  | "HANDS"
  | "FEET"
  | "ACCESSORIES"
  | "EFFECTS";

/** Layers a worn item temporarily hides (rendering only; the hidden items stay in the look). */
export const LAYER_HIDES: Readonly<Partial<Record<WearLayer, readonly WearLayer[]>>> = {
  FULL_HEAD: ["FACE", "HAT", "HAIR"],
  FULL_BODY: ["UPPER_BODY", "LOWER_BODY"],
};

export type EquippedWearable = { itemId: string; layer: WearLayer };

/**
 * Apply one equip to a saved look: replaces whatever was in the same layer, keeps everything
 * else (including items the new piece will hide). Returns a new array.
 */
export function equipInLook(look: readonly EquippedWearable[], next: EquippedWearable): EquippedWearable[] {
  return [...look.filter((w) => w.layer !== next.layer), next];
}

/** What renders: hidden-by-occlusion items are reported, never removed from the look. */
export function resolveVisibleLoadout(look: readonly EquippedWearable[]): { visible: EquippedWearable[]; hidden: EquippedWearable[] } {
  const hiddenLayers = new Set<WearLayer>();
  for (const w of look) for (const h of LAYER_HIDES[w.layer] ?? []) hiddenLayers.add(h);
  const visible: EquippedWearable[] = [];
  const hidden: EquippedWearable[] = [];
  for (const w of look) (hiddenLayers.has(w.layer) ? hidden : visible).push(w);
  return { visible, hidden };
}

/** Legacy FanCosmeticSlot → wear layer (full character heads must be tagged FULL_HEAD explicitly). */
export function defaultLayerForSlot(slot: string): WearLayer {
  switch (slot) {
    case "head": return "HAT";
    case "face": return "FACE";
    case "hair": return "HAIR";
    case "chest": return "UPPER_BODY";
    case "waist": return "LOWER_BODY";
    case "outfit": return "FULL_BODY";
    case "hand": return "HANDS";
    case "feet": return "FEET";
    case "aura":
    case "entrance": return "EFFECTS";
    default: return "ACCESSORIES";
  }
}
