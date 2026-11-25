/**
 * Outfit Composition — complete looks reference component asset IDs.
 * Equip outfit atomically, then allow per-slot overrides (shoes, hat, etc.).
 * Never duplicates component files; never silently strips unrelated slots.
 */

import { FOUNDRY_PARTS, type FoundryPartDef } from "@/lib/avatars/FoundryManufacturedCosmetics";
import type { AccWardrobeSectionId } from "@/lib/foundry/avatar/FoundryDepartmentRegistry";

export type OutfitComponentSlot =
  | "TOP"
  | "BOTTOM"
  | "SHOES"
  | "HAT"
  | "ACCESSORY"
  | "MASK"
  | "GLOVES"
  | "OTHER";

export type OutfitComponentRef = {
  slot: OutfitComponentSlot;
  assetId: string | null;
  assetVersion: string;
  embeddedInMesh: boolean;
  independentlyReplaceable: boolean;
};

export type OutfitComposition = {
  outfitAssetId: string;
  outfitVersion: string;
  label: string;
  components: OutfitComponentRef[];
  conflictPolicy: "LAYER_COMPATIBLE" | "FULL_BODY_MESH";
};

/** Equipped wardrobe state — one asset per wardrobe section (slot-safe). */
export type WardrobeLoadoutState = Partial<Record<AccWardrobeSectionId, string | null>>;

const OUTFIT_COMPOSITIONS: Record<string, OutfitComposition> = {
  outfit_complete_stage_performer_v1: {
    outfitAssetId: "outfit_complete_stage_performer_v1",
    outfitVersion: "v1",
    label: "Complete Stage Performer Outfit",
    conflictPolicy: "LAYER_COMPATIBLE",
    components: [
      { slot: "TOP", assetId: "top_layered_street_tee_v1", assetVersion: "v1", embeddedInMesh: false, independentlyReplaceable: true },
      { slot: "BOTTOM", assetId: "bottom_tapered_cargo_denim_v1", assetVersion: "v1", embeddedInMesh: false, independentlyReplaceable: true },
      { slot: "SHOES", assetId: "shoes_modular_athletic_sneaker_v1", assetVersion: "v1", embeddedInMesh: false, independentlyReplaceable: true },
      { slot: "HAT", assetId: null, assetVersion: "v1", embeddedInMesh: false, independentlyReplaceable: true },
      { slot: "ACCESSORY", assetId: null, assetVersion: "v1", embeddedInMesh: false, independentlyReplaceable: true },
      { slot: "MASK", assetId: null, assetVersion: "v1", embeddedInMesh: false, independentlyReplaceable: true },
    ],
  },
  costume_fullbody_neon_astronaut_v1: {
    outfitAssetId: "costume_fullbody_neon_astronaut_v1",
    outfitVersion: "v1",
    label: "Neon Astronaut Costume",
    conflictPolicy: "FULL_BODY_MESH",
    components: [
      { slot: "TOP", assetId: null, assetVersion: "v1", embeddedInMesh: true, independentlyReplaceable: false },
      { slot: "BOTTOM", assetId: null, assetVersion: "v1", embeddedInMesh: true, independentlyReplaceable: false },
      { slot: "SHOES", assetId: null, assetVersion: "v1", embeddedInMesh: true, independentlyReplaceable: true },
      { slot: "HAT", assetId: null, assetVersion: "v1", embeddedInMesh: true, independentlyReplaceable: true },
      { slot: "MASK", assetId: null, assetVersion: "v1", embeddedInMesh: true, independentlyReplaceable: true },
      { slot: "ACCESSORY", assetId: null, assetVersion: "v1", embeddedInMesh: false, independentlyReplaceable: true },
    ],
  },
};

function slotToSection(slot: OutfitComponentSlot): AccWardrobeSectionId | null {
  switch (slot) {
    case "TOP":
      return "TOPS";
    case "BOTTOM":
      return "BOTTOMS";
    case "SHOES":
      return "SHOES";
    case "HAT":
      return "HATS";
    case "ACCESSORY":
      return "ACCESSORIES";
    case "MASK":
      return "MASKS";
    default:
      return null;
  }
}

export function getOutfitComposition(outfitAssetId: string): OutfitComposition | null {
  return OUTFIT_COMPOSITIONS[outfitAssetId] ?? null;
}

export function listOutfitCompositions(): OutfitComposition[] {
  return Object.values(OUTFIT_COMPOSITIONS);
}

/**
 * Apply an outfit: set OUTFITS + fill component sections when linked.
 * Preserves unrelated sections (PROPS, etc.) unless conflictPolicy forces full-body.
 */
export function applyOutfitToLoadout(
  current: WardrobeLoadoutState,
  outfitAssetId: string,
  options?: { equipMatchingShoes?: boolean; keepCurrentShoes?: boolean },
): WardrobeLoadoutState {
  const composition = getOutfitComposition(outfitAssetId);
  const next: WardrobeLoadoutState = { ...current, OUTFITS: outfitAssetId };

  if (!composition) {
    return next;
  }

  for (const comp of composition.components) {
    const section = slotToSection(comp.slot);
    if (!section || !comp.assetId) continue;
    if (section === "SHOES") {
      if (options?.keepCurrentShoes) continue;
      if (options?.equipMatchingShoes === false) continue;
    }
    if (!comp.independentlyReplaceable && composition.conflictPolicy === "FULL_BODY_MESH") {
      // Embedded mesh — clear independent slot so we don't double-layer
      next[section] = null;
      continue;
    }
    next[section] = comp.assetId;
  }

  return next;
}

/** Replace one wardrobe section after an outfit is equipped — never clears other sections. */
export function overrideOutfitComponent(
  current: WardrobeLoadoutState,
  section: AccWardrobeSectionId,
  assetId: string | null,
): WardrobeLoadoutState {
  if (section === "PROPS") {
    return { ...current, PROPS: assetId };
  }
  const outfitId = current.OUTFITS;
  if (outfitId) {
    const composition = getOutfitComposition(outfitId);
    const slot =
      section === "TOPS"
        ? "TOP"
        : section === "BOTTOMS"
          ? "BOTTOM"
          : section === "SHOES"
            ? "SHOES"
            : section === "HATS"
              ? "HAT"
              : section === "ACCESSORIES"
                ? "ACCESSORY"
                : section === "MASKS"
                  ? "MASK"
                  : null;
    if (slot && composition) {
      const ref = composition.components.find((c) => c.slot === slot);
      if (ref && !ref.independentlyReplaceable) {
        // Soft allow for shoes/hats on full-body when flagged replaceable; otherwise block
        return current;
      }
    }
  }
  return { ...current, [section]: assetId };
}

export function outfitIncludesFootwear(outfitAssetId: string): boolean {
  const c = getOutfitComposition(outfitAssetId);
  if (!c) {
    const part = FOUNDRY_PARTS.find((p) => p.assetId === outfitAssetId);
    return (
      part?.category === "COMPLETE_OUTFIT_PRESET" || part?.category === "CHARACTER_COSTUME_PRESET"
    );
  }
  return c.components.some((x) => x.slot === "SHOES" && (x.assetId || x.embeddedInMesh));
}

export function listOutfitParts(): FoundryPartDef[] {
  return FOUNDRY_PARTS.filter(
    (p) => p.category === "COMPLETE_OUTFIT_PRESET" || p.category === "CHARACTER_COSTUME_PRESET",
  );
}
