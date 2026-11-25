/**
 * AvatarFoundryV3Bases — Phase 1 wiring for Anti-Gravity v3.1 manufactured bases.
 *
 * Sources (isolated foundry → public promotion):
 *   masculine / universal → bobblehead_living_skin_v3.glb
 *   feminine              → bobblehead_female_living_skin_v3.glb
 *   neutral               → bobblehead_neutral_living_skin_v3.glb
 *
 * Morph names come from BODY_MORPH_SPEC.json — never assume array indices.
 * certified remains false until browser physical PASS (Rule 20 / Rule 28).
 *
 * Height: use independent height morph channels + skeleton proportion path —
 * never treat height as a uniform mesh Y-stretch alone.
 */

import type { BobbleheadGender } from "@/lib/avatars/BobbleheadBaseRegistry";
import type { AvatarGlbSlotId } from "@/lib/avatars/AvatarGlbRegistry";

export type FoundryBodyPresentation = "MASCULINE" | "FEMININE" | "NEUTRAL";

export const FOUNDRY_V3_PUBLIC_ROOT = "/models/avatars/foundry" as const;

export const FOUNDRY_V3_BASE_GLBS = {
  MASCULINE: `${FOUNDRY_V3_PUBLIC_ROOT}/bobblehead_living_skin_v3.glb`,
  FEMININE: `${FOUNDRY_V3_PUBLIC_ROOT}/bobblehead_female_living_skin_v3.glb`,
  NEUTRAL: `${FOUNDRY_V3_PUBLIC_ROOT}/bobblehead_neutral_living_skin_v3.glb`,
} as const;

export const FOUNDRY_V3_SLOT_IDS: Record<FoundryBodyPresentation, AvatarGlbSlotId> = {
  MASCULINE: "bobblehead_living_skin_v3",
  FEMININE: "bobblehead_female_living_skin_v3",
  NEUTRAL: "bobblehead_neutral_living_skin_v3",
};

/** Presentation morph targets (also baked into standalone GLBs). */
export const FOUNDRY_PRESENTATION_MORPHS: Record<FoundryBodyPresentation, string> = {
  MASCULINE: "presentation_masculine",
  FEMININE: "presentation_feminine",
  NEUTRAL: "presentation_neutral",
};

/**
 * Independent body diversity channels (BODY_MORPH_SPEC independentMorphChannels).
 * Bind by name in the renderer — not by export index.
 */
export const FOUNDRY_BODY_DIVERSITY_MORPHS = [
  "body_height_very_short",
  "body_height_short",
  "body_height_tall",
  "body_height_very_tall",
  "body_mass_extremely_slim",
  "body_mass_super_heavy",
  "body_belly_fullness",
  "body_chest_fullness",
  "body_waist_width",
  "body_hip_width",
  "body_shoulder_width",
  "body_arm_thickness",
  "body_leg_thickness",
  "body_thigh_fullness",
  "body_glute_fullness",
  "body_neck_proportions",
  "body_torso_length",
  "body_leg_length",
  "archetype_extremely_slim",
  "archetype_slim",
  "archetype_average",
  "archetype_large",
  "archetype_very_large_super_heavy",
  "presentation_masculine",
  "presentation_feminine",
  "presentation_neutral",
  "body_bust_contour",
  "body_iliac_curve",
  "body_deltoid_span",
  "body_pectoral_flatness",
  "body_hourglass_waist",
  "body_soft_shoulder_slope",
  "body_slender_neck",
] as const;

/** Expected total morph package per GLB (AG v3.1 receipt). */
export const FOUNDRY_V3_EXPECTED_MORPH_TOTAL = 100 as const;
export const FOUNDRY_V3_ARKIT_RANGE = { start: 0, end: 51 } as const;
export const FOUNDRY_V3_IDENTITY_RANGE = { start: 52, end: 58 } as const;
export const FOUNDRY_V3_TOUCH_RANGE = { start: 59, end: 66 } as const;
export const FOUNDRY_V3_BODY_RANGE = { start: 67, end: 99 } as const;

export function presentationFromGender(gender: BobbleheadGender | string | null | undefined): FoundryBodyPresentation {
  if (gender === "female") return "FEMININE";
  if (gender === "unisex") return "NEUTRAL";
  return "MASCULINE";
}

export function resolveFoundryV3GlbUrl(
  gender: BobbleheadGender | string | null | undefined,
  presentationOverride?: FoundryBodyPresentation | null,
): string {
  const presentation = presentationOverride ?? presentationFromGender(gender);
  return FOUNDRY_V3_BASE_GLBS[presentation];
}

export function resolveFoundryV3SlotId(
  gender: BobbleheadGender | string | null | undefined,
  presentationOverride?: FoundryBodyPresentation | null,
): AvatarGlbSlotId {
  const presentation = presentationOverride ?? presentationFromGender(gender);
  return FOUNDRY_V3_SLOT_IDS[presentation];
}

export {
  mapStatureToFoundryMorphs,
  BOBBLEHEAD_STATURE_PRESETS,
  evaluateBobbleheadSilhouette,
  BOBBLEHEAD_SILHOUETTE_REFERENCE,
  BOBBLEHEAD_PROPORTION_LAW_VERSION,
} from "@/lib/avatars/BobbleheadProportionLaw";

/**
 * Map AvatarBodyTypeEngine height/width sliders → named morph weights.
 * Height and width are orthogonal (BODY_MORPH_SPEC law).
 * Stature must remain inside BobbleheadProportionLaw (2.3–3.2 head-heights) —
 * never treat height01 as adult-human stretch.
 */
export function mapSlidersToFoundryBodyMorphs(input: {
  height01: number; // 0=short … 1=tall
  width01: number; // 0=slim … 1=heavy
}): Record<string, number> {
  const h = Math.min(1, Math.max(0, input.height01));
  const w = Math.min(1, Math.max(0, input.width01));
  const out: Record<string, number> = {
    body_height_very_short: 0,
    body_height_short: 0,
    body_height_tall: 0,
    body_height_very_tall: 0,
    body_mass_extremely_slim: 0,
    body_mass_super_heavy: 0,
    body_belly_fullness: 0,
  };

  if (h < 0.5) {
    const t = 1 - h * 2;
    out.body_height_very_short = Math.max(0, t - 0.5) * 2;
    out.body_height_short = Math.min(1, t * 2);
  } else {
    const t = (h - 0.5) * 2;
    out.body_height_tall = Math.min(1, t * 2);
    out.body_height_very_tall = Math.max(0, t - 0.5) * 2;
  }

  if (w < 0.5) {
    out.body_mass_extremely_slim = 1 - w * 2;
  } else {
    const t = (w - 0.5) * 2;
    out.body_mass_super_heavy = t;
    out.body_belly_fullness = t * 0.95;
  }

  return out;
}
