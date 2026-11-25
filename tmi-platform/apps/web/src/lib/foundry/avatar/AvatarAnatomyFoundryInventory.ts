/**
 * Avatar Anatomy Foundry Inventory — recover Anti-Gravity / public Foundry parts.
 * Face · skin · facial hair · hairstyles · accessories. Real GLBs only.
 * Manufacturing ≠ ACC publication ≠ LIVE_ASSET_SWITCHES.
 */

import {
  FOUNDRY_PARTS,
  FOUNDRY_PUBLIC_ROOT,
  type FoundryPartDef,
} from "@/lib/avatars/FoundryManufacturedCosmetics";
import { IDENTITY_TARGETS_V2 } from "@/lib/avatars/FaceIdentityGeometryContract";

export type AnatomyDepartment =
  | "FACE_SHAPE_ANATOMY"
  | "REALISTIC_SKIN"
  | "FACIAL_HAIR_GROOMING"
  | "HAIRSTYLE_3D"
  | "ACCESSORY_WEARABLE"
  | "WARDROBE_COSTUME"
  | "FOOTWEAR_SHOES";

export type AccPublishCategory =
  | "face"
  | "skin"
  | "facial_hair"
  | "hairstyle"
  | "headwear"
  | "glasses"
  | "jewelry"
  | "top"
  | "bottom"
  | "outfit"
  | "costume"
  | "gloves"
  | "footwear"
  | "accessory"
  | "mask"
  | "prop";

export type AnatomyInventoryItem = {
  assetId: string;
  version: string;
  department: AnatomyDepartment;
  accCategory: AccPublishCategory;
  label: string;
  publicGlbPath: string;
  sourceOrigin: "ANTI_GRAVITY" | "FOUNDRY_PUBLIC" | "REFERENCE";
  sourcePathHint: string;
  skeleton: "AvatarRig/1.0";
  runtimeCertified: boolean;
  publicationState: "PRIVATE_INVENTORY" | "STAGED_FOR_ACC" | "ARCHIVED";
  isPlaceholder: false;
  notes?: string;
};

const glb = (file: string) => `${FOUNDRY_PUBLIC_ROOT}/${file}`;

/** Extra Anti-Gravity wearables present under public/foundry but not always in FOUNDRY_PARTS. */
const EXTRA_ACCESSORIES: AnatomyInventoryItem[] = [
  {
    assetId: "acc_eyewear_designer_neon_shades_v1",
    version: "v1",
    department: "ACCESSORY_WEARABLE",
    accCategory: "glasses",
    label: "Designer Neon Shades",
    publicGlbPath: glb("acc_eyewear_designer_neon_shades_v1.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/acc_eyewear_designer_neon_shades_v1.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  },
  {
    assetId: "acc_headwear_snapback_crown_cap_v1",
    version: "v1",
    department: "ACCESSORY_WEARABLE",
    accCategory: "headwear",
    label: "Snapback Crown Cap",
    publicGlbPath: glb("acc_headwear_snapback_crown_cap_v1.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/acc_headwear_snapback_crown_cap_v1.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  },
  {
    assetId: "acc_neck_cuban_link_crown_chain_v1",
    version: "v1",
    department: "ACCESSORY_WEARABLE",
    accCategory: "jewelry",
    label: "Cuban Link Crown Chain",
    publicGlbPath: glb("acc_neck_cuban_link_crown_chain_v1.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/acc_neck_cuban_link_crown_chain_v1.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  },
  {
    assetId: "acc_head_studio_dj_headphones_v1",
    version: "v1",
    department: "ACCESSORY_WEARABLE",
    accCategory: "accessory",
    label: "Studio DJ Headphones",
    publicGlbPath: glb("acc_head_studio_dj_headphones_v1.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/acc_head_studio_dj_headphones_v1.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  },
  {
    assetId: "acc_back_urban_creator_backpack_v1",
    version: "v1",
    department: "ACCESSORY_WEARABLE",
    accCategory: "accessory",
    label: "Urban Creator Backpack",
    publicGlbPath: glb("acc_back_urban_creator_backpack_v1.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/acc_back_urban_creator_backpack_v1.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  },
];

const LIVING_SKIN_BASES: AnatomyInventoryItem[] = [
  {
    assetId: "bobblehead_living_skin_v3",
    version: "v3",
    department: "REALISTIC_SKIN",
    accCategory: "skin",
    label: "Living Skin · Masculine v3",
    publicGlbPath: glb("bobblehead_living_skin_v3.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/bobblehead_living_skin_v3.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
    notes: "LIVE_ASSET_SWITCHES=NO · certified=false until browser PASS",
  },
  {
    assetId: "bobblehead_female_living_skin_v3",
    version: "v3",
    department: "REALISTIC_SKIN",
    accCategory: "skin",
    label: "Living Skin · Feminine v3",
    publicGlbPath: glb("bobblehead_female_living_skin_v3.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/bobblehead_female_living_skin_v3.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  },
  {
    assetId: "bobblehead_neutral_living_skin_v3",
    version: "v3",
    department: "REALISTIC_SKIN",
    accCategory: "skin",
    label: "Living Skin · Neutral v3",
    publicGlbPath: glb("bobblehead_neutral_living_skin_v3.glb"),
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/bobblehead_neutral_living_skin_v3.glb",
    skeleton: "AvatarRig/1.0",
    runtimeCertified: false,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  },
];

function mapPart(part: FoundryPartDef): AnatomyInventoryItem {
  let department: AnatomyDepartment = "WARDROBE_COSTUME";
  let accCategory: AccPublishCategory = "accessory";
  switch (part.category) {
    case "HEAD_BASE":
      department = "FACE_SHAPE_ANATOMY";
      accCategory = "face";
      break;
    case "HAIR":
      department = "HAIRSTYLE_3D";
      accCategory = "hairstyle";
      break;
    case "FACIAL_HAIR":
      department = "FACIAL_HAIR_GROOMING";
      accCategory = "facial_hair";
      break;
    case "WARDROBE_TOP":
      department = "WARDROBE_COSTUME";
      accCategory = "top";
      break;
    case "WARDROBE_OUTERWEAR":
      department = "WARDROBE_COSTUME";
      accCategory = "top";
      break;
    case "WARDROBE_BOTTOM":
      department = "WARDROBE_COSTUME";
      accCategory = "bottom";
      break;
    case "FOOTWEAR":
      department = "FOOTWEAR_SHOES";
      accCategory = "footwear";
      break;
    case "COMPLETE_OUTFIT_PRESET":
    case "CHARACTER_COSTUME_PRESET":
      department = "WARDROBE_COSTUME";
      accCategory = "costume";
      break;
  }
  return {
    assetId: part.assetId,
    version: "v1",
    department,
    accCategory,
    label: part.label,
    publicGlbPath: part.publicGlbPath,
    sourceOrigin: "ANTI_GRAVITY",
    sourcePathHint: `.cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/${part.assetId}.glb`,
    skeleton: part.skeleton,
    runtimeCertified: part.runtimeCertified,
    publicationState: "PRIVATE_INVENTORY",
    isPlaceholder: false,
  };
}

const stagedOverrides = new Map<string, AnatomyInventoryItem["publicationState"]>();

export function listAnatomyInventory(): AnatomyInventoryItem[] {
  const fromParts = FOUNDRY_PARTS.map(mapPart);
  const merged = [...LIVING_SKIN_BASES, ...fromParts, ...EXTRA_ACCESSORIES];
  return merged.map((item) => {
    const override = stagedOverrides.get(item.assetId);
    return override ? { ...item, publicationState: override } : item;
  });
}

export function listAnatomyByDepartment(department: AnatomyDepartment): AnatomyInventoryItem[] {
  return listAnatomyInventory().filter((i) => i.department === department);
}

export function getAnatomyItem(assetId: string): AnatomyInventoryItem | undefined {
  return listAnatomyInventory().find((i) => i.assetId === assetId);
}

export function setAnatomyPublicationState(
  assetId: string,
  state: AnatomyInventoryItem["publicationState"],
): AnatomyInventoryItem | null {
  const item = getAnatomyItem(assetId);
  if (!item) return null;
  stagedOverrides.set(assetId, state);
  return { ...item, publicationState: state };
}

/** Certification slice — includes dedicated footwear (Shoes department). */
export function pickAvatarPublishingCertificationSlice(): {
  face: AnatomyInventoryItem | null;
  skin: AnatomyInventoryItem | null;
  hairstyle: AnatomyInventoryItem | null;
  facialHair: AnatomyInventoryItem | null;
  glasses: AnatomyInventoryItem | null;
  shoes: AnatomyInventoryItem | null;
  identityTargetsDeclared: number;
} {
  const all = listAnatomyInventory();
  return {
    face: all.find((i) => i.assetId === "tmi-avatar-head-v2-sculpted") ?? null,
    skin: all.find((i) => i.assetId === "bobblehead_living_skin_v3") ?? null,
    hairstyle: all.find((i) => i.assetId === "hair_rounded_afro_halo_v1") ?? null,
    facialHair: all.find((i) => i.assetId === "beard_full_boxed_lumberjack_v1") ?? null,
    glasses: all.find((i) => i.assetId === "acc_eyewear_designer_neon_shades_v1") ?? null,
    shoes: all.find((i) => i.assetId === "shoes_modular_athletic_sneaker_v1") ?? null,
    identityTargetsDeclared: IDENTITY_TARGETS_V2.length,
  };
}

export function listFootwearInventory(): AnatomyInventoryItem[] {
  return listAnatomyByDepartment("FOOTWEAR_SHOES");
}

export function anatomyDepartmentSummary() {
  const all = listAnatomyInventory();
  const byDept: Record<string, number> = {};
  for (const item of all) {
    byDept[item.department] = (byDept[item.department] ?? 0) + 1;
  }
  return {
    total: all.length,
    byDepartment: byDept,
    runtimeCertifiedCount: all.filter((i) => i.runtimeCertified).length,
    stagedForAcc: all.filter((i) => i.publicationState === "STAGED_FOR_ACC").length,
    emojiPlaceholders: 0,
  };
}
