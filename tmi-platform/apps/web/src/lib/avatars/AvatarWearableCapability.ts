/**
 * Wearable / prop capability + Foundry cert loop (PASS / REGENERATE).
 * Derives from FanCosmeticCatalog + AvatarGlbRegistry — no fake neural Foundry.
 */

import { getFanCosmetic, type FanCosmeticDef } from "@/lib/avatars/FanCosmeticCatalog";
import type { AvatarSocketId } from "@/lib/avatars/AvatarSocketSystem";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";
import {
  DEFAULT_FAN_AVATAR_GLB_SLOT,
  FOUNDRY_AVATAR_AUTHORITY,
  getAvatarGlbSlot,
  resolveAvatarViewportBinding,
} from "@/lib/avatars/AvatarGlbRegistry";

export const FAN_COSMETIC_STORE_HREF = "/store/fan";

export type WearableCertVerdict = "PASS" | "REGENERATE" | "UNBOUND";

export type WearableCapability = {
  cosmeticId: string;
  supportedSockets: AvatarSocketId[];
  compatibleMotions: AvatarPreviewAction[];
  seatCompatible: boolean;
  danceCompatible: boolean;
  /** True when this SKU may appear on the production Fan rig (catalog published). */
  productionCompatible: boolean;
  /** Locked SKUs remain previewable (Try Before You Buy). */
  previewable: true;
  /** Equip-to-world / save requires ownership or free starter. */
  requiresOwnershipToEquip: boolean;
  storeHref: string;
  cert: WearableCertVerdict;
};

export function resolveWearableCapability(cosmeticId: string): WearableCapability | null {
  const def = getFanCosmetic(cosmeticId);
  if (!def) return null;
  return capabilityFromDef(def);
}

function capabilityFromDef(def: FanCosmeticDef): WearableCapability {
  const socket = def.rigAnchor ?? def.socketId;
  const isEmote = def.equipSlot === "emote" || def.emoteKind != null;
  const isProp = def.equipSlot === "prop" || def.equipSlot === "instrument";
  const motions: AvatarPreviewAction[] = ["IDLE"];
  if (isEmote && def.emoteKind === "dance") motions.push("HYPE", "DANCE_RANGE_TEST");
  if (isEmote && def.emoteKind === "gesture") motions.push("WAVE");
  if (isProp) motions.push("PROP_GRIP_TEST");
  if (def.equipSlot === "outfit" || def.equipSlot === "hair" || def.slot === "feet") {
    motions.push("WALK", "SIT");
  }
  const published = def.published !== false;
  const rigOk =
    !def.compatibleAvatarRig ||
    def.compatibleAvatarRig === "bobblehead_v0" ||
    def.compatibleAvatarRig === "AvatarRig_v0";
  const free = def.pointsCost === 0 || def.entitlement === "free" || def.rarity === "free";
  return {
    cosmeticId: def.id,
    supportedSockets: [socket],
    compatibleMotions: motions,
    seatCompatible: !(isProp && def.slot === "hand"),
    danceCompatible: def.emoteKind === "dance" || (!isProp && def.equipSlot !== "emote"),
    productionCompatible: published && rigOk,
    previewable: true,
    requiresOwnershipToEquip: !free,
    storeHref: FAN_COSMETIC_STORE_HREF,
    cert: def.certifiedGlb ? "PASS" : published ? "REGENERATE" : "UNBOUND",
  };
}

export function canCommitWearableToWorld(
  cosmeticId: string,
  ownedIds: ReadonlySet<string> | readonly string[],
): boolean {
  const cap = resolveWearableCapability(cosmeticId);
  if (!cap || !cap.productionCompatible) return false;
  if (!cap.requiresOwnershipToEquip) return true;
  const owned = ownedIds instanceof Set ? ownedIds : new Set(ownedIds);
  return owned.has(cosmeticId);
}

export type FoundryWearableCertReport = {
  cosmeticId: string;
  verdict: WearableCertVerdict;
  glbSlotId: string;
  missingArtifact: string | null;
  recipeId: string;
  /** Honest: remanufacture is a Foundry job, not an in-browser neural pass. */
  remanufactureHook: "packages/assets FoundryPipeline / CertificationDirector" | null;
};

export function evaluateFoundryWearableCert(cosmeticId: string): FoundryWearableCertReport {
  const cap = resolveWearableCapability(cosmeticId);
  const slot = getAvatarGlbSlot(DEFAULT_FAN_AVATAR_GLB_SLOT);
  const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  if (!cap) {
    return {
      cosmeticId,
      verdict: "UNBOUND",
      glbSlotId: DEFAULT_FAN_AVATAR_GLB_SLOT,
      missingArtifact: slot?.expectedFoundryArtifact ?? null,
      recipeId: FOUNDRY_AVATAR_AUTHORITY.recipeId,
      remanufactureHook: null,
    };
  }
  if (cap.cert === "PASS" && viewport.diagnostic === "OK") {
    return {
      cosmeticId,
      verdict: "PASS",
      glbSlotId: viewport.slotId,
      missingArtifact: null,
      recipeId: FOUNDRY_AVATAR_AUTHORITY.recipeId,
      remanufactureHook: null,
    };
  }
  return {
    cosmeticId,
    verdict: cap.cert === "UNBOUND" ? "UNBOUND" : "REGENERATE",
    glbSlotId: viewport.slotId,
    missingArtifact: viewport.missingArtifact,
    recipeId: FOUNDRY_AVATAR_AUTHORITY.recipeId,
    remanufactureHook: "packages/assets FoundryPipeline / CertificationDirector",
  };
}

export function assertWearablesProductionCompatible(cosmeticIds: string[]): string[] {
  const blocked: string[] = [];
  for (const id of cosmeticIds) {
    const cap = resolveWearableCapability(id);
    if (!cap || !cap.productionCompatible) blocked.push(id);
  }
  return blocked;
}
