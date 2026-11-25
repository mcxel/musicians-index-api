/**
 * Foundry-manufactured AvatarRig/1.0 parts (Anti-Gravity 2026-11-06 isolated pack).
 * Files live under /models/avatars/foundry after promotion from
 * .cursor/artifacts/antigravity-avatar-foundry-2026-11-06/.
 *
 * Honesty: glbUrl means a mesh file is served. certifiedGlb stays false until
 * Creation Center / venue runtime fit certification. Never treat a thumbnail as wearable.
 */

import type { FanCosmeticDef } from "./FanCosmeticCatalog";

export const FOUNDRY_PUBLIC_ROOT = "/models/avatars/foundry" as const;
export const FOUNDRY_THUMB_ROOT = "/models/avatars/foundry/thumbs" as const;

export type FoundryPartCategory =
  | "HEAD_BASE"
  | "HAIR"
  | "FACIAL_HAIR"
  | "WARDROBE_TOP"
  | "WARDROBE_OUTERWEAR"
  | "WARDROBE_BOTTOM"
  | "FOOTWEAR"
  | "COMPLETE_OUTFIT_PRESET"
  | "CHARACTER_COSTUME_PRESET";

export type FoundryPartReadiness = "MANUFACTURED" | "EQUIP-READY" | "REFERENCE_ONLY";

export interface FoundryPartDef {
  assetId: string;
  category: FoundryPartCategory;
  label: string;
  publicGlbPath: string;
  thumbnailPath: string;
  readiness: FoundryPartReadiness;
  /** True only after browser/runtime fit certification — never set from Blender alone. */
  runtimeCertified: boolean;
  preservesIdentityOnApply: boolean;
  skeleton: "AvatarRig/1.0";
}

const glb = (file: string) => `${FOUNDRY_PUBLIC_ROOT}/${file}` as const;
const thumb = (file: string) => `${FOUNDRY_THUMB_ROOT}/${file}` as const;

/** All 21 manufactured meshes — manufactured ≠ equip-ready. */
export const FOUNDRY_PARTS: readonly FoundryPartDef[] = [
  {
    assetId: "tmi-avatar-head-v2-sculpted",
    category: "HEAD_BASE",
    label: "Stylized Anatomical Head v2",
    publicGlbPath: glb("avatar-BH-head-v2-sculpted.glb"),
    thumbnailPath: thumb("avatar-BH-head-v2-sculpted-3q.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_high_taper_sponged_fade_v1",
    category: "HAIR",
    label: "High Taper Sponged Fade",
    publicGlbPath: glb("hair_high_taper_sponged_fade_v1.glb"),
    thumbnailPath: thumb("hair_high_taper_sponged_fade_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_rounded_afro_halo_v1",
    category: "HAIR",
    label: "Sculpted Afro Halo",
    publicGlbPath: glb("hair_rounded_afro_halo_v1.glb"),
    thumbnailPath: thumb("hair_rounded_afro_halo_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_classic_flattop_v1",
    category: "HAIR",
    label: "Classic Flat Top",
    publicGlbPath: glb("hair_classic_flattop_v1.glb"),
    thumbnailPath: thumb("hair_classic_flattop_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_short_curls_coils_v1",
    category: "HAIR",
    label: "Short Curls / Coils",
    publicGlbPath: glb("hair_short_curls_coils_v1.glb"),
    thumbnailPath: thumb("hair_short_curls_coils_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_shoulder_box_braids_v1",
    category: "HAIR",
    label: "Shoulder Box Braids",
    publicGlbPath: glb("hair_shoulder_box_braids_v1.glb"),
    thumbnailPath: thumb("hair_shoulder_box_braids_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_double_afro_puffs_v1",
    category: "HAIR",
    label: "Double High Afro Puffs",
    publicGlbPath: glb("hair_double_afro_puffs_v1.glb"),
    thumbnailPath: thumb("hair_double_afro_puffs_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_high_ponytail_swoop_v1",
    category: "HAIR",
    label: "High Ponytail Swoop",
    publicGlbPath: glb("hair_high_ponytail_swoop_v1.glb"),
    thumbnailPath: thumb("hair_high_ponytail_swoop_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_side_part_pompadour_wave_v1",
    category: "HAIR",
    label: "Side-Part Pompadour Wave",
    publicGlbPath: glb("hair_side_part_pompadour_wave_v1.glb"),
    thumbnailPath: thumb("hair_side_part_pompadour_wave_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_layered_curtain_bob_v1",
    category: "HAIR",
    label: "Layered Curtain Bob",
    publicGlbPath: glb("hair_layered_curtain_bob_v1.glb"),
    thumbnailPath: thumb("hair_layered_curtain_bob_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "hair_crowned_cornrows_bun_v1",
    category: "HAIR",
    label: "Cornrows Top-Knot Bun",
    publicGlbPath: glb("hair_crowned_cornrows_bun_v1.glb"),
    thumbnailPath: thumb("hair_crowned_cornrows_bun_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "beard_full_boxed_lumberjack_v1",
    category: "FACIAL_HAIR",
    label: "Full Boxed Beard",
    publicGlbPath: glb("beard_full_boxed_lumberjack_v1.glb"),
    thumbnailPath: thumb("beard_full_boxed_lumberjack_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "beard_van_dyke_imperial_goatee_v1",
    category: "FACIAL_HAIR",
    label: "Van Dyke Goatee",
    publicGlbPath: glb("beard_van_dyke_imperial_goatee_v1.glb"),
    thumbnailPath: thumb("beard_van_dyke_imperial_goatee_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "beard_precision_chinstrap_fade_v1",
    category: "FACIAL_HAIR",
    label: "Precision Chin Strap",
    publicGlbPath: glb("beard_precision_chinstrap_fade_v1.glb"),
    thumbnailPath: thumb("beard_precision_chinstrap_fade_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "mustache_chevron_handlebar_v1",
    category: "FACIAL_HAIR",
    label: "Chevron Handlebar Mustache",
    publicGlbPath: glb("mustache_chevron_handlebar_v1.glb"),
    thumbnailPath: thumb("mustache_chevron_handlebar_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "top_layered_street_tee_v1",
    category: "WARDROBE_TOP",
    label: "Layered Street Tee",
    publicGlbPath: glb("top_layered_street_tee_v1.glb"),
    thumbnailPath: thumb("top_layered_street_tee_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "outerwear_bomber_hoodie_jacket_v1",
    category: "WARDROBE_OUTERWEAR",
    label: "Bomber Hoodie Jacket",
    publicGlbPath: glb("outerwear_bomber_hoodie_jacket_v1.glb"),
    thumbnailPath: thumb("outerwear_bomber_hoodie_jacket_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "bottom_tapered_cargo_denim_v1",
    category: "WARDROBE_BOTTOM",
    label: "Tapered Cargo Denim",
    publicGlbPath: glb("bottom_tapered_cargo_denim_v1.glb"),
    thumbnailPath: thumb("bottom_tapered_cargo_denim_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "shoes_modular_athletic_sneaker_v1",
    category: "FOOTWEAR",
    label: "Athletic Sneaker Pair",
    publicGlbPath: glb("shoes_modular_athletic_sneaker_v1.glb"),
    thumbnailPath: thumb("shoes_modular_athletic_sneaker_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "shoes_tactical_combat_boot_v1",
    category: "FOOTWEAR",
    label: "Tactical Combat Boot Pair",
    publicGlbPath: glb("shoes_tactical_combat_boot_v1.glb"),
    thumbnailPath: thumb("shoes_tactical_combat_boot_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "shoes_novelty_bunny_slippers_v1",
    category: "FOOTWEAR",
    label: "Novelty Bunny Slippers",
    publicGlbPath: glb("shoes_novelty_bunny_slippers_v1.glb"),
    thumbnailPath: thumb("shoes_novelty_bunny_slippers_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "outfit_complete_stage_performer_v1",
    category: "COMPLETE_OUTFIT_PRESET",
    label: "Complete Stage Performer Outfit",
    publicGlbPath: glb("outfit_complete_stage_performer_v1.glb"),
    thumbnailPath: thumb("outfit_complete_stage_performer_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
  {
    assetId: "costume_fullbody_neon_astronaut_v1",
    category: "CHARACTER_COSTUME_PRESET",
    label: "Neon Astronaut Costume",
    publicGlbPath: glb("costume_fullbody_neon_astronaut_v1.glb"),
    thumbnailPath: thumb("costume_fullbody_neon_astronaut_v1.png"),
    readiness: "MANUFACTURED",
    runtimeCertified: false,
    preservesIdentityOnApply: true,
    skeleton: "AvatarRig/1.0",
  },
] as const;

export const FOUNDRY_WARDROBE_ASSET_IDS = [
  "top_layered_street_tee_v1",
  "outerwear_bomber_hoodie_jacket_v1",
  "bottom_tapered_cargo_denim_v1",
  "shoes_modular_athletic_sneaker_v1",
  "shoes_tactical_combat_boot_v1",
  "shoes_novelty_bunny_slippers_v1",
  "outfit_complete_stage_performer_v1",
  "costume_fullbody_neon_astronaut_v1",
] as const;

/**
 * Starting presentation options — Foundry v3.1 promoted GLBs.
 * selectable=true when public GLB is promoted (Phase 1B probe PASS).
 * meshReady stays false until Phase 1C Creation Center + Hub lobby physical PASS (Rule 20/28).
 */
export const STARTING_BASE_OPTIONS = [
  {
    id: "male" as const,
    label: "Masculine",
    /** Promoted GLB may be selected for live cert; formal meshReady remains locked. */
    selectable: true,
    meshReady: false,
    /** Dedicated Foundry v3 masculine base — not Urban Cap (legacy certified path). */
    bobbleheadBaseId: "bh-masculine-foundry",
    note: "Foundry v3 masculine/universal living-skin GLB. meshReady=false until Creation Center + lobby PASS.",
  },
  {
    id: "female" as const,
    label: "Feminine",
    selectable: true,
    meshReady: false,
    bobbleheadBaseId: "bh-music-fan-female",
    note: "Foundry v3 feminine living-skin GLB. meshReady=false until Creation Center + lobby PASS.",
  },
  {
    id: "neutral" as const,
    label: "Neutral",
    selectable: true,
    meshReady: false,
    bobbleheadBaseId: "bh-neutral-foundry",
    note: "Foundry v3 neutral living-skin GLB. meshReady=false until Creation Center + lobby PASS.",
  },
] as const;

export const STARTING_BASE_STORAGE_KEY = "tmi_avatar_starting_base_v1";

export function getFoundryPart(assetId: string): FoundryPartDef | undefined {
  return FOUNDRY_PARTS.find((p) => p.assetId === assetId);
}

export function listFoundryPartsByCategory(category: FoundryPartCategory): FoundryPartDef[] {
  return FOUNDRY_PARTS.filter((p) => p.category === category);
}

function iconFor(category: FoundryPartCategory): string {
  switch (category) {
    case "HAIR":
      return "💇";
    case "FACIAL_HAIR":
      return "🧔";
    case "WARDROBE_TOP":
      return "👕";
    case "WARDROBE_OUTERWEAR":
      return "🧥";
    case "WARDROBE_BOTTOM":
      return "👖";
    case "FOOTWEAR":
      return "👟";
    case "COMPLETE_OUTFIT_PRESET":
      return "🎭";
    case "CHARACTER_COSTUME_PRESET":
      return "🧑‍🚀";
    case "HEAD_BASE":
      return "🧍";
    default:
      return "📦";
  }
}

function mapPartToCosmetic(part: FoundryPartDef): FanCosmeticDef | null {
  if (part.category === "HEAD_BASE") return null;
  const socketId =
    part.category === "HAIR"
      ? "socket_head"
      : part.category === "FACIAL_HAIR"
        ? "socket_mouth"
        : part.category === "WARDROBE_BOTTOM"
          ? "socket_waist"
          : part.category === "FOOTWEAR"
            ? "socket_foot_r"
            : "socket_chest";
  const inventoryCategory =
    part.category === "HAIR" || part.category === "FACIAL_HAIR"
      ? "hair"
      : part.category === "WARDROBE_TOP"
        ? "tops"
        : part.category === "WARDROBE_OUTERWEAR"
          ? "jackets"
          : part.category === "WARDROBE_BOTTOM"
            ? "bottoms"
            : part.category === "FOOTWEAR"
              ? "shoes"
              : "outfits";
  const equipSlot =
    part.category === "HAIR" || part.category === "FACIAL_HAIR"
      ? "hair"
      : part.category === "FOOTWEAR"
        ? "accessory"
        : part.category === "COMPLETE_OUTFIT_PRESET" || part.category === "CHARACTER_COSTUME_PRESET"
          ? "outfit"
          : "outfit";
  const slot =
    part.category === "HAIR" || part.category === "FACIAL_HAIR"
      ? "hair"
      : part.category === "FOOTWEAR"
        ? "feet"
        : "outfit";
  return {
    id: part.assetId,
    label: part.label,
    icon: iconFor(part.category),
    accent: part.category.includes("COSTUME") ? "#AA2DFF" : "#00FFFF",
    slot,
    socketId,
    pointsCost: 0,
    rarity: "free",
    inventoryCategory,
    equipSlot,
    certifiedGlb: part.runtimeCertified,
    glbUrl: part.publicGlbPath,
    plateUrl: part.thumbnailPath,
    description: `Foundry manufactured mesh · ${part.skeleton} · readiness ${part.readiness} · not runtime-certified`,
    entitlement: "free",
    published: true,
    isNew: true,
    featured: part.category === "COMPLETE_OUTFIT_PRESET" || part.category === "CHARACTER_COSTUME_PRESET",
    compatibleAvatarRig: "AvatarRig_v0",
    stripeProductId: null,
  } as FanCosmeticDef;
}

/** Raw catalog rows — normalize via FanCosmeticCatalog when merging. */
export const FOUNDRY_MANUFACTURED_COSMETIC_SEEDS: FanCosmeticDef[] = FOUNDRY_PARTS.map(mapPartToCosmetic).filter(
  (c): c is FanCosmeticDef => Boolean(c),
);

export function isIdentityPreservingOutfit(cosmeticId: string): boolean {
  const part = getFoundryPart(cosmeticId);
  return Boolean(part?.preservesIdentityOnApply);
}

/**
 * Map legacy FanCosmeticCatalog hair_* tint SKUs → manufactured Foundry hair GLBs.
 * Catalog rows without a GLB stay tint-only; bald has no mesh by design.
 */
export const CATALOG_HAIR_TO_FOUNDRY_ASSET: Readonly<Record<string, string>> = {
  hair_fade_short: "hair_high_taper_sponged_fade_v1",
  hair_taper_high: "hair_high_taper_sponged_fade_v1",
  hair_fade_low: "hair_high_taper_sponged_fade_v1",
  hair_crop_textured: "hair_high_taper_sponged_fade_v1",
  hair_undercut: "hair_high_taper_sponged_fade_v1",
  hair_afro: "hair_rounded_afro_halo_v1",
  hair_afro_mini: "hair_rounded_afro_halo_v1",
  hair_flattop: "hair_classic_flattop_v1",
  hair_curls: "hair_short_curls_coils_v1",
  hair_coily_crown: "hair_double_afro_puffs_v1",
  hair_braids: "hair_shoulder_box_braids_v1",
  hair_cornrows: "hair_crowned_cornrows_bun_v1",
  hair_bun_top: "hair_crowned_cornrows_bun_v1",
  hair_topknot: "hair_crowned_cornrows_bun_v1",
  hair_ponytail: "hair_high_ponytail_swoop_v1",
  hair_long_layers: "hair_high_ponytail_swoop_v1",
  hair_bob_classic: "hair_layered_curtain_bob_v1",
  hair_blonde_bob: "hair_layered_curtain_bob_v1",
  hair_side_part: "hair_side_part_pompadour_wave_v1",
  hair_slick_back: "hair_side_part_pompadour_wave_v1",
  hair_waves: "hair_side_part_pompadour_wave_v1",
};

/** Resolve a public hair/facial-hair GLB for a catalog or Foundry asset id. */
export function resolveFoundryHairGlbUrl(cosmeticId: string): string | null {
  if (!cosmeticId || cosmeticId === "hair_bald" || cosmeticId === "none") return null;
  const direct = getFoundryPart(cosmeticId);
  if (direct && (direct.category === "HAIR" || direct.category === "FACIAL_HAIR")) {
    return direct.publicGlbPath;
  }
  const mapped = CATALOG_HAIR_TO_FOUNDRY_ASSET[cosmeticId];
  if (!mapped) return null;
  return getFoundryPart(mapped)?.publicGlbPath ?? null;
}

export function listFoundryHairCatalogCount(): number {
  return FOUNDRY_PARTS.filter((p) => p.category === "HAIR").length;
}
