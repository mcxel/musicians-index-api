/**
 * Outfit ↔ Shoes coordination + footwear certification checklist.
 * Users may accept matching shoes from an outfit OR keep Shoes-section choice.
 */

import {
  FOUNDRY_PARTS,
  type FoundryPartDef,
} from "@/lib/avatars/FoundryManufacturedCosmetics";
import type { FootwearTypeId } from "@/lib/foundry/avatar/FoundryDepartmentRegistry";
import {
  getOutfitComposition,
  outfitIncludesFootwear,
} from "@/lib/foundry/avatar/OutfitCompositionEngine";

export type OutfitFootwearPolicy =
  | {
      includesFootwear: true;
      mode: "MESH_EMBEDDED" | "LINKED_PAIR";
      matchedFootwearAssetId: string | null;
      footwearType: FootwearTypeId | null;
      prompt:
        | "OFFER_EQUIP_MATCHING_SHOES"
        | "KEEP_CURRENT_SHOES"
        | "CHOOSE_FROM_SHOES_SECTION";
    }
  | { includesFootwear: false };

export function classifyFootwearType(assetId: string, label?: string): FootwearTypeId {
  const hay = `${assetId} ${label ?? ""}`.toLowerCase();
  if (hay.includes("sneaker") || hay.includes("athletic")) return "SNEAKERS_ATHLETIC";
  if (hay.includes("boot")) return "BOOTS";
  if (hay.includes("loafer") || hay.includes("dress")) return "DRESS_LOAFERS";
  if (hay.includes("sandal") || hay.includes("slide")) return "SANDALS_SLIDES";
  if (hay.includes("heel")) return "HEELS";
  if (hay.includes("platform")) return "PLATFORMS";
  if (hay.includes("slipper") || hay.includes("bunny")) return "SLIPPERS";
  if (hay.includes("futur") || hay.includes("cyber")) return "FUTURISTIC";
  if (hay.includes("costume") || hay.includes("astronaut")) return "COSTUME_FOOTWEAR";
  return "CUSTOM";
}

export function resolveOutfitFootwearPolicy(outfitAssetId: string): OutfitFootwearPolicy {
  if (!outfitIncludesFootwear(outfitAssetId)) {
    return { includesFootwear: false };
  }
  const composition = getOutfitComposition(outfitAssetId);
  const shoesComp = composition?.components.find((c) => c.slot === "SHOES");
  return {
    includesFootwear: true,
    mode: shoesComp?.embeddedInMesh ? "MESH_EMBEDDED" : "LINKED_PAIR",
    matchedFootwearAssetId: shoesComp?.assetId ?? null,
    footwearType: shoesComp?.assetId
      ? classifyFootwearType(shoesComp.assetId)
      : shoesComp?.embeddedInMesh
        ? "COSTUME_FOOTWEAR"
        : "CUSTOM",
    prompt: "OFFER_EQUIP_MATCHING_SHOES",
  };
}

export type ShoesEquipDecision =
  | { action: "EQUIP_MATCHING"; footwearAssetId: string | null; sourceOutfitId: string }
  | { action: "KEEP_CURRENT_SHOES"; sourceOutfitId: string }
  | { action: "OPEN_SHOES_SECTION"; sourceOutfitId: string }
  | { action: "NO_FOOTWEAR_IN_OUTFIT"; sourceOutfitId: string };

export function decideShoesForOutfit(
  outfitAssetId: string,
  choice: "EQUIP_MATCHING" | "KEEP_CURRENT" | "CHOOSE_OTHER",
): ShoesEquipDecision {
  const policy = resolveOutfitFootwearPolicy(outfitAssetId);
  if (!policy.includesFootwear) {
    return { action: "NO_FOOTWEAR_IN_OUTFIT", sourceOutfitId: outfitAssetId };
  }
  if (choice === "KEEP_CURRENT") {
    return { action: "KEEP_CURRENT_SHOES", sourceOutfitId: outfitAssetId };
  }
  if (choice === "CHOOSE_OTHER") {
    return { action: "OPEN_SHOES_SECTION", sourceOutfitId: outfitAssetId };
  }
  return {
    action: "EQUIP_MATCHING",
    footwearAssetId: policy.matchedFootwearAssetId,
    sourceOutfitId: outfitAssetId,
  };
}

export function listFootwearParts(): FoundryPartDef[] {
  return FOUNDRY_PARTS.filter((p) => p.category === "FOOTWEAR");
}

export function footwearCertificationChecklist(assetId: string) {
  const part = FOUNDRY_PARTS.find((p) => p.assetId === assetId && p.category === "FOOTWEAR");
  return {
    assetId,
    exists: Boolean(part),
    leftRightGeometry: part ? "REQUIRED" : "N/A",
    footAnkleSockets: part ? "REQUIRED" : "N/A",
    bodyFit: part ? "REQUIRED" : "N/A",
    walkRunDance: part ? "REQUIRED" : "N/A",
    materials: part ? "REQUIRED" : "N/A",
    collisionClipping: part ? "REQUIRED" : "N/A",
    lods: part ? "REQUIRED" : "N/A",
    desktopMobile: part ? "REQUIRED" : "N/A",
    inspect360: part ? "REQUIRED" : "N/A",
    runtimeCertified: part?.runtimeCertified ?? false,
    publicGlbPath: part?.publicGlbPath ?? null,
    footwearType: part ? classifyFootwearType(part.assetId, part.label) : null,
    physicalVerified: false,
  };
}
