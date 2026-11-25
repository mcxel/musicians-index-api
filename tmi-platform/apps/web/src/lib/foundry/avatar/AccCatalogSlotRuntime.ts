/**
 * ACC Catalog Slot Runtime — stable SLOT_ID + PLACEMENT_ID + tier eligibility.
 * Eight wardrobe sections + anatomy. Adding items never overwrites placements.
 * LIVE_ASSET_SWITCHES=NO.
 */

import { FOUNDRY_RELEASE_LOCKS } from "@/lib/foundry/access/FoundryAccessPolicy";
import {
  listAnatomyInventory,
  type AccPublishCategory,
  type AnatomyInventoryItem,
} from "@/lib/foundry/avatar/AvatarAnatomyFoundryInventory";
import { ACC_WARDROBE_SECTIONS } from "@/lib/foundry/avatar/FoundryDepartmentRegistry";

export type SubscriptionTierId =
  | "FREE"
  | "PERFORMER_PRO"
  | "FAN_PRO"
  | "RUBY"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export type AccSectionId =
  | "HAIR"
  | "FACIAL_HAIR"
  | "FACE"
  | "SKIN"
  | "OUTFITS"
  | "TOPS"
  | "BOTTOMS"
  | "SHOES"
  | "HATS"
  | "ACCESSORIES"
  | "MASKS"
  | "PROPS"
  /** @deprecated use HATS — kept for legacy callers */
  | "HEADWEAR"
  /** @deprecated use ACCESSORIES — glasses live under accessories */
  | "GLASSES";

export type AccCatalogPlacement = {
  placementId: string;
  slotId: string;
  slotIndex: number;
  sectionId: AccSectionId;
  tierId: SubscriptionTierId;
  assetId: string | null;
  assetVersion: string | null;
  publicGlbPath: string | null;
  displayName: string | null;
  roleEligibility: readonly ("FAN" | "PERFORMER")[];
  publicationStatus: "EMPTY" | "STAGED" | "PUBLISHED_TEST" | "ARCHIVED";
  liveSwitched: false;
};

export const SUBSCRIPTION_TIERS: readonly SubscriptionTierId[] = [
  "FREE",
  "FAN_PRO",
  "PERFORMER_PRO",
  "RUBY",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
] as const;

const SECTION_CAPACITY = 12;

/** In-memory placement store — not production DB (PRODUCTION_DB_MUTATIONS=NO). */
const placements = new Map<string, AccCatalogPlacement>();

function placementKey(tierId: SubscriptionTierId, sectionId: AccSectionId, slotIndex: number) {
  return `${tierId}:${sectionId}:slot_${slotIndex}`;
}

function ensureSectionSlots(tierId: SubscriptionTierId, sectionId: AccSectionId): AccCatalogPlacement[] {
  const out: AccCatalogPlacement[] = [];
  for (let i = 0; i < SECTION_CAPACITY; i++) {
    const key = placementKey(tierId, sectionId, i);
    let p = placements.get(key);
    if (!p) {
      p = {
        placementId: `plc_${tierId}_${sectionId}_${i}`,
        slotId: `slot_${tierId}_${sectionId}_${i}`,
        slotIndex: i,
        sectionId,
        tierId,
        assetId: null,
        assetVersion: null,
        publicGlbPath: null,
        displayName: null,
        roleEligibility: ["FAN"],
        publicationStatus: "EMPTY",
        liveSwitched: false,
      };
      placements.set(key, p);
    }
    out.push(p);
  }
  return out;
}

export function listTierSectionSlots(
  tierId: SubscriptionTierId,
  sectionId: AccSectionId,
): AccCatalogPlacement[] {
  return ensureSectionSlots(tierId, sectionId);
}

export function nextAvailableSlot(
  tierId: SubscriptionTierId,
  sectionId: AccSectionId,
): AccCatalogPlacement | null {
  return listTierSectionSlots(tierId, sectionId).find((s) => s.publicationStatus === "EMPTY") ?? null;
}

/**
 * Allocate a stable empty slot for an anatomy asset. Idempotent by asset+tier+section.
 * Never overwrites an occupied slot.
 */
export function allocateStablePlacement(input: {
  tierId: SubscriptionTierId;
  sectionId: AccSectionId;
  asset: AnatomyInventoryItem;
  roleEligibility?: readonly ("FAN" | "PERFORMER")[];
}): { ok: true; placement: AccCatalogPlacement } | { ok: false; error: string } {
  void FOUNDRY_RELEASE_LOCKS.LIVE_ASSET_SWITCHES;

  const existing = listTierSectionSlots(input.tierId, input.sectionId).find(
    (s) => s.assetId === input.asset.assetId && s.publicationStatus !== "ARCHIVED",
  );
  if (existing) return { ok: true, placement: existing };

  const empty = nextAvailableSlot(input.tierId, input.sectionId);
  if (!empty) {
    return { ok: false, error: `No available slots in ${input.tierId}/${input.sectionId} (capacity ${SECTION_CAPACITY})` };
  }

  const key = placementKey(input.tierId, input.sectionId, empty.slotIndex);
  const next: AccCatalogPlacement = {
    ...empty,
    assetId: input.asset.assetId,
    assetVersion: input.asset.version,
    publicGlbPath: input.asset.publicGlbPath,
    displayName: input.asset.label,
    roleEligibility: input.roleEligibility ?? ["FAN"],
    publicationStatus: input.asset.runtimeCertified ? "PUBLISHED_TEST" : "STAGED",
    liveSwitched: false,
  };
  placements.set(key, next);
  return { ok: true, placement: next };
}

export function archivePlacement(placementId: string): AccCatalogPlacement | null {
  for (const [key, p] of placements) {
    if (p.placementId !== placementId) continue;
    const next = { ...p, publicationStatus: "ARCHIVED" as const };
    placements.set(key, next);
    return next;
  }
  return null;
}

export function restorePlacement(placementId: string): AccCatalogPlacement | null {
  for (const [key, p] of placements) {
    if (p.placementId !== placementId) continue;
    if (p.publicationStatus !== "ARCHIVED") return p;
    if (!p.assetId) return null;
    const next: AccCatalogPlacement = {
      ...p,
      publicationStatus: "STAGED",
      liveSwitched: false,
    };
    placements.set(key, next);
    return next;
  }
  return null;
}

export function allocateFootwearPlacement(input: {
  tierId: SubscriptionTierId;
  asset: AnatomyInventoryItem;
  roleEligibility?: readonly ("FAN" | "PERFORMER")[];
}) {
  if (input.asset.accCategory !== "footwear") {
    return { ok: false as const, error: "Asset is not FOOTWEAR — refuse non-shoes allocation into Shoes section" };
  }
  return allocateStablePlacement({
    tierId: input.tierId,
    sectionId: "SHOES",
    asset: input.asset,
    roleEligibility: input.roleEligibility,
  });
}

export function sectionIdForAccCategory(cat: AccPublishCategory): AccSectionId {
  switch (cat) {
    case "hairstyle":
      return "HAIR";
    case "facial_hair":
      return "FACIAL_HAIR";
    case "face":
      return "FACE";
    case "skin":
      return "SKIN";
    case "glasses":
      return "ACCESSORIES";
    case "headwear":
      return "HATS";
    case "footwear":
      return "SHOES";
    case "top":
      return "TOPS";
    case "bottom":
      return "BOTTOMS";
    case "outfit":
    case "costume":
      return "OUTFITS";
    case "gloves":
      return "ACCESSORIES";
    case "prop":
      return "PROPS";
    case "mask":
      return "MASKS";
    case "jewelry":
    case "accessory":
      return "ACCESSORIES";
    default:
      return "ACCESSORIES";
  }
}

/** Seed FREE-tier ACC slots from recovered Anti-Gravity anatomy (private staging only). */
export function seedFreeTierFromAnatomyInventory(limitPerSection = 6): {
  seeded: number;
  skipped: number;
  collisions: number;
} {
  let seeded = 0;
  let skipped = 0;
  let collisions = 0;
  for (const asset of listAnatomyInventory()) {
    const sectionId = sectionIdForAccCategory(asset.accCategory);
    const before = listTierSectionSlots("FREE", sectionId).filter((s) => s.assetId).length;
    if (before >= limitPerSection) {
      skipped += 1;
      continue;
    }
    const res = allocateStablePlacement({ tierId: "FREE", sectionId, asset });
    if (!res.ok) {
      skipped += 1;
      continue;
    }
    if (before === listTierSectionSlots("FREE", sectionId).filter((s) => s.assetId).length) {
      collisions += 1;
    } else {
      seeded += 1;
    }
  }
  return { seeded, skipped, collisions };
}

export function allAccSectionIds(): AccSectionId[] {
  return [
    "HAIR",
    "FACIAL_HAIR",
    "FACE",
    "SKIN",
    ...ACC_WARDROBE_SECTIONS,
  ];
}

export function tierInventorySnapshot(tierId: SubscriptionTierId) {
  return allAccSectionIds().map((sectionId) => {
    const slots = listTierSectionSlots(tierId, sectionId);
    return {
      tierId,
      sectionId,
      occupied: slots.filter((s) => s.assetId && s.publicationStatus !== "ARCHIVED").length,
      empty: slots.filter((s) => s.publicationStatus === "EMPTY").length,
      archived: slots.filter((s) => s.publicationStatus === "ARCHIVED").length,
      slots,
    };
  });
}

/** ACC UI: return display slots for a section — empty squares remain addressable. */
export function getAccDisplaySlots(
  sectionId: AccSectionId,
  tierId: SubscriptionTierId = "FREE",
): AccCatalogPlacement[] {
  seedFreeTierFromAnatomyInventory();
  return listTierSectionSlots(tierId, sectionId);
}
