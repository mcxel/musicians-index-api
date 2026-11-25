/**
 * BobbleheadProportionLaw — ultra-photorealistic stubby bobblehead silhouette.
 *
 * Owner visual reference (proportions only — not identity/likeness):
 *   `BobbleHead Avatar Bases/BobbleHead Avatar extras 1.jpg`
 *   (ship-deck couple: oversized realistic heads + short thick compressed bodies)
 *
 * Law: avatars are miniature photoreal people with giant realistic heads and
 * thick, compressed bodies — NOT normal humans with enlarged heads attached,
 * NOT skinny chibi, NOT long-limbed humanoids.
 *
 * Design targets below are silhouette specifications derived from the reference
 * look — not pixel measurements extracted from the JPEG.
 *
 * COMMIT/PUSH/DEPLOY remain owner-gated. Morph counts ≠ physical PASS.
 */

/** Canonical on-disk silhouette reference (gitignored concept pack). */
export const BOBBLEHEAD_SILHOUETTE_REFERENCE = {
  id: "src-extras-1",
  fileName: "BobbleHead Avatar extras 1.jpg",
  localRefPath: "BobbleHead Avatar Bases/BobbleHead Avatar extras 1.jpg",
  purpose: "body_silhouette_proportion_law",
  identityBinding: "none — proportions only, never likeness",
} as const;

/**
 * headRatio = headHeight / totalAvatarHeight.
 * N head-heights tall ⇒ headRatio ≈ 1/N.
 */
export const BOBBLEHEAD_HEAD_HEIGHTS = {
  /** Hard floor — shorter than this leaves the bobblehead family. */
  minHeadHeights: 2.3,
  /** Hard ceiling — taller than this reads as near-human / long-limbed. */
  maxHeadHeights: 3.2,
  /** Classic bobblehead (closest to extras-1). */
  classicMin: 2.6,
  classicMax: 2.9,
  /** Extra stubby. */
  stubbyMin: 2.3,
  stubbyMax: 2.6,
  /** Tall bobblehead — still compact. */
  tallMin: 2.9,
  tallMax: 3.2,
} as const;

/** headRatio bounds corresponding to head-height window above. */
export const BOBBLEHEAD_HEAD_RATIO = {
  min: 1 / BOBBLEHEAD_HEAD_HEIGHTS.maxHeadHeights, // ~0.3125
  max: 1 / BOBBLEHEAD_HEAD_HEIGHTS.minHeadHeights, // ~0.435
  classic: 1 / 2.75, // ~0.364
} as const;

export type BobbleheadStatureId = "extra_stubby" | "classic" | "tall";

export interface BobbleheadStaturePreset {
  id: BobbleheadStatureId;
  label: string;
  /** Target total height in head-heights (center of band). */
  targetHeadHeights: number;
  headHeightsMin: number;
  headHeightsMax: number;
  /** Maps onto BodyDiversityParameters.heightScale (overall stature, not human stretch). */
  heightScale: number;
  /** Prefer shorter legs / longer torso (negative = stubbier). */
  legToTorsoRatio: number;
  /** Prefer thicker arms/legs/torso depth. */
  armThickness: number;
  legThickness: number;
  chestFullness: number;
  bodyMass: number;
  neckProportions: number;
  frameWidth: number;
  description: string;
}

/**
 * Three controlled stature options — same canonical skeleton, never adult-human stretch.
 */
export const BOBBLEHEAD_STATURE_PRESETS: readonly BobbleheadStaturePreset[] = [
  {
    id: "extra_stubby",
    label: "Extra Stubby",
    targetHeadHeights: 2.45,
    headHeightsMin: 2.3,
    headHeightsMax: 2.6,
    heightScale: 0.78,
    legToTorsoRatio: -0.45,
    armThickness: 0.55,
    legThickness: 0.55,
    chestFullness: 0.45,
    bodyMass: 0.4,
    neckProportions: 0.45,
    frameWidth: 0.35,
    description: "Thickest, shortest silhouette — deep torso, stubbiest limbs.",
  },
  {
    id: "classic",
    label: "Classic Bobblehead",
    targetHeadHeights: 2.75,
    headHeightsMin: 2.6,
    headHeightsMax: 2.9,
    heightScale: 0.9,
    legToTorsoRatio: -0.35,
    armThickness: 0.4,
    legThickness: 0.4,
    chestFullness: 0.35,
    bodyMass: 0.25,
    neckProportions: 0.35,
    frameWidth: 0.25,
    description: "Closest to BobbleHead Avatar extras 1 — short thick body, oversized head.",
  },
  {
    id: "tall",
    label: "Tall Bobblehead",
    targetHeadHeights: 3.05,
    headHeightsMin: 2.9,
    headHeightsMax: 3.2,
    heightScale: 1.02,
    legToTorsoRatio: -0.2,
    armThickness: 0.3,
    legThickness: 0.3,
    chestFullness: 0.25,
    bodyMass: 0.1,
    neckProportions: 0.25,
    frameWidth: 0.15,
    description: "Slightly taller, still compact — never adult-human proportions.",
  },
] as const;

export const DEFAULT_BOBBLEHEAD_STATURE_ID: BobbleheadStatureId = "classic";

export function getBobbleheadStaturePreset(
  id: BobbleheadStatureId | string | null | undefined,
): BobbleheadStaturePreset {
  return (
    BOBBLEHEAD_STATURE_PRESETS.find((p) => p.id === id) ??
    BOBBLEHEAD_STATURE_PRESETS.find((p) => p.id === DEFAULT_BOBBLEHEAD_STATURE_ID)!
  );
}

export function headHeightsToHeadRatio(headHeights: number): number {
  const n = Math.max(
    BOBBLEHEAD_HEAD_HEIGHTS.minHeadHeights,
    Math.min(BOBBLEHEAD_HEAD_HEIGHTS.maxHeadHeights, headHeights),
  );
  return 1 / n;
}

export function headRatioToHeadHeights(headRatio: number): number {
  const r = Math.max(BOBBLEHEAD_HEAD_RATIO.min, Math.min(BOBBLEHEAD_HEAD_RATIO.max, headRatio));
  return 1 / r;
}

/** Clamp head/total-height into the locked bobblehead band. */
export function clampBobbleheadHeadRatio(headRatio: number): number {
  return Math.max(BOBBLEHEAD_HEAD_RATIO.min, Math.min(BOBBLEHEAD_HEAD_RATIO.max, headRatio));
}

/**
 * Stubby limb length band — short legs relative to torso.
 * Values are multipliers on the base legLengthRatio channel.
 */
export const BOBBLEHEAD_LIMB_BOUNDS = {
  legLengthRatioMin: 0.48,
  legLengthRatioMax: 0.82,
  armLengthBiasMin: 0.55,
  armLengthBiasMax: 0.88,
  limbThicknessMin: 0.95,
  limbThicknessMax: 1.55,
  torsoDepthMin: 0.95,
  torsoDepthMax: 1.55,
} as const;

export function clampBobbleheadLegLengthRatio(ratio: number): number {
  return Math.max(
    BOBBLEHEAD_LIMB_BOUNDS.legLengthRatioMin,
    Math.min(BOBBLEHEAD_LIMB_BOUNDS.legLengthRatioMax, ratio),
  );
}

/**
 * Forbidden silhouette checks for Foundry / QA (design-law, not pixel OCR).
 */
export function evaluateBobbleheadSilhouette(input: {
  headRatio: number;
  legLengthRatio: number;
  limbThickness: number;
  chestDepth: number;
}): {
  pass: boolean;
  headHeights: number;
  violations: string[];
} {
  const violations: string[] = [];
  const headHeights = headRatioToHeadHeights(input.headRatio);

  if (headHeights < BOBBLEHEAD_HEAD_HEIGHTS.minHeadHeights) {
    violations.push("TOO_STUBBY_OR_HEAD_TOO_LARGE");
  }
  if (headHeights > BOBBLEHEAD_HEAD_HEIGHTS.maxHeadHeights) {
    violations.push("TOO_TALL_HUMAN_LIKE_SILHOUETTE");
  }
  if (input.legLengthRatio > BOBBLEHEAD_LIMB_BOUNDS.legLengthRatioMax) {
    violations.push("LEGS_TOO_LONG");
  }
  if (input.legLengthRatio < BOBBLEHEAD_LIMB_BOUNDS.legLengthRatioMin) {
    violations.push("LEGS_COLLAPSED");
  }
  if (input.limbThickness < BOBBLEHEAD_LIMB_BOUNDS.limbThicknessMin) {
    violations.push("LIMBS_TOO_SKINNY_CHIBI");
  }
  if (input.chestDepth < BOBBLEHEAD_LIMB_BOUNDS.torsoDepthMin) {
    violations.push("TORSO_TOO_FLAT_NO_DEPTH");
  }

  return {
    pass: violations.length === 0,
    headHeights,
    violations,
  };
}

/**
 * Map stature preset → Foundry named morph weights (BODY_MORPH_SPEC channels).
 * Never invent height as uniform mesh Y-stretch alone.
 */
export function mapStatureToFoundryMorphs(
  statureId: BobbleheadStatureId,
): Record<string, number> {
  const preset = getBobbleheadStaturePreset(statureId);
  const out: Record<string, number> = {
    body_height_very_short: 0,
    body_height_short: 0,
    body_height_tall: 0,
    body_height_very_tall: 0,
    body_torso_length: 0.35,
    body_leg_length: 0,
    body_arm_thickness: Math.max(0, preset.armThickness),
    body_leg_thickness: Math.max(0, preset.legThickness),
    body_shoulder_width: Math.max(0, preset.frameWidth),
    body_neck_proportions: Math.max(0, preset.neckProportions),
    body_chest_fullness: Math.max(0, preset.chestFullness),
    body_belly_fullness: Math.max(0, preset.bodyMass * 0.5),
    body_mass_super_heavy: Math.max(0, preset.bodyMass),
    body_mass_extremely_slim: 0,
  };

  if (statureId === "extra_stubby") {
    out.body_height_very_short = 0.85;
    out.body_height_short = 0.55;
    out.body_leg_length = 0.15; // short legs channel if present as positive = shorter in some packs
  } else if (statureId === "classic") {
    out.body_height_short = 0.7;
    out.body_height_very_short = 0.25;
  } else {
    out.body_height_short = 0.25;
    out.body_height_tall = 0.35;
  }

  return out;
}

export const BOBBLEHEAD_PROPORTION_LAW_VERSION = "2026-11-07.extras-1.silhouette.v1" as const;
