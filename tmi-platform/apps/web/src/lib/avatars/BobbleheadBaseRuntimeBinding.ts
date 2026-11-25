/**
 * BobbleheadBaseRuntimeBinding — honest selectable vs concept-only bases.
 *
 * v3.1 Foundry: masculine / feminine / neutral standalone GLBs promoted under
 * public/models/avatars/foundry/. certified remains false until browser PASS.
 * Do not mark Female Available GREEN without physical render verification.
 *
 * COMMIT=OFF
 */

import type { BobbleheadBase } from "@/lib/avatars/BobbleheadBaseRegistry";
import {
  resolveFoundryV3GlbUrl,
  type FoundryBodyPresentation,
} from "@/lib/avatars/AvatarFoundryV3Bases";

export type BaseRuntimeAvailability =
  | "DEDICATED_GLB"
  | "SHARED_UNIVERSAL_MESH"
  | "PRESENTATION_GLB"
  | "CONCEPT_ONLY";

export type BobbleheadBaseRuntimeBinding = {
  baseId: string;
  selectable: boolean;
  availability: BaseRuntimeAvailability;
  glbUrl: string | null;
  presentation: FoundryBodyPresentation | null;
  stateLabel: "Available" | "Shared mesh" | "Presentation mesh" | "Unavailable";
  honesty: string;
  /** False until browser loads + morphs the GLB (Rule 20). */
  meshReady: boolean;
};

const URBAN_CAP_GLB = "/models/avatars/bobblehead_urban_cap_v1.glb";
const BOBBLEHEAD_V0_GLB = "/models/avatars/bobblehead_v0.glb";

export function resolveBobbleheadBaseRuntimeBinding(
  base: BobbleheadBase,
): BobbleheadBaseRuntimeBinding {
  if (base.id === "bh-urban-cap-male") {
    return {
      baseId: base.id,
      selectable: true,
      availability: "DEDICATED_GLB",
      glbUrl: URBAN_CAP_GLB,
      presentation: "MASCULINE",
      stateLabel: "Available",
      honesty: "Dedicated Urban Cap GLB on AvatarRig/1.0",
      meshReady: true,
    };
  }

  if (base.unlock === "free") {
    const glbUrl = resolveFoundryV3GlbUrl(base.gender);
    const presentation =
      base.gender === "female"
        ? "FEMININE"
        : base.gender === "unisex"
          ? "NEUTRAL"
          : "MASCULINE";
    return {
      baseId: base.id,
      selectable: true,
      availability: "PRESENTATION_GLB",
      glbUrl,
      presentation,
      stateLabel: "Presentation mesh",
      honesty:
        presentation === "FEMININE"
          ? "Feminine Foundry v3 GLB promoted — meshReady=false until browser physical PASS."
          : presentation === "NEUTRAL"
            ? "Neutral Foundry v3 GLB promoted — meshReady=false until browser physical PASS."
            : "Masculine/universal Foundry v3 GLB promoted — meshReady=false until browser physical PASS.",
      meshReady: false,
    };
  }

  return {
    baseId: base.id,
    selectable: false,
    availability: "CONCEPT_ONLY",
    glbUrl: null,
    presentation: null,
    stateLabel: "Unavailable",
    honesty: "Unlock-gated or concept-only — no runtime mesh binding",
    meshReady: false,
  };
}

export function resolveGlbUrlForBaseId(baseId: string, gender?: BobbleheadBase["gender"]): string {
  if (baseId === "bh-urban-cap-male") return URBAN_CAP_GLB;
  if (gender) return resolveFoundryV3GlbUrl(gender);
  return resolveFoundryV3GlbUrl("male") || BOBBLEHEAD_V0_GLB;
}

/** @deprecated Prefer resolveFoundryV3GlbUrl by gender. */
export function resolveSharedUniversalMeshUrl(): string {
  return resolveFoundryV3GlbUrl("male");
}
