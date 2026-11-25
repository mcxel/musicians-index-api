/**
 * Mini-Me Creation Center contract façade — binds FaceIdentityGeometry + BodyShape
 * + head scale (default 1.85×) without inventing morphs or loading live public/models.
 * LIVE_ASSET_SWITCHES remains NO; JOB Mini-Me GLBs stay integration-path only.
 */

import type { FaceIdentityShapeCoefficients, FeatureConfidenceScores } from "@/lib/avatar/AvatarFaceIdentityContract";
import {
  DEFAULT_HEAD_TO_BODY_SCALE,
  HEAD_TO_BODY_SCALE_RANGE,
  identityTargetWeights,
  stylize,
  assertLayerSeparation,
  type IdentityWeights,
} from "@/lib/avatars/FaceIdentityGeometryContract";
import {
  bodyMorphWeights,
  legHeight,
  validateBodyShape,
  type BodyShape,
} from "@/lib/avatars/BodyShapeContract";
import { jobArtifactRepoPath, LIVE_ASSET_SWITCHES } from "@/lib/assets/ManufacturingArtifactBinding";

export const MINI_ME_CREATION_CONTRACTS_ID = "MINI_ME_CREATION_CONTRACTS_v1" as const;
export const DEFAULT_MINI_ME_HEAD_SCALE = DEFAULT_HEAD_TO_BODY_SCALE;
export const FAKE_MORPH_TARGETS_FORBIDDEN = true as const;
export const PLACEHOLDER_SPHERE_IDENTITY_FORBIDDEN = true as const;

export type MiniMePreviewBundle = {
  identityWeights: IdentityWeights;
  headScale: number;
  bodyWeights: ReturnType<typeof bodyMorphWeights>;
  leg: ReturnType<typeof legHeight>;
  layerSeparationOk: boolean;
  integrationGlb: string | null;
  liveAssetSwitches: false;
};

export function resolveMiniMeHeadScale(raw: number | null | undefined): number {
  const n = typeof raw === "number" && Number.isFinite(raw) ? raw : DEFAULT_HEAD_TO_BODY_SCALE;
  return Math.max(HEAD_TO_BODY_SCALE_RANGE[0], Math.min(HEAD_TO_BODY_SCALE_RANGE[1], n));
}

/**
 * Identity geometry for Creation Center preview — id_* targets only.
 * Expression/speech ARKit layers stay separate (assertLayerSeparation).
 */
export function buildMiniMePreview(input: {
  shape: Partial<FaceIdentityShapeCoefficients>;
  confidence?: FeatureConfidenceScores | null;
  headToBodyScale?: number;
  caricature?: number;
  body?: BodyShape;
  archetypeId?: string;
}): MiniMePreviewBundle {
  const identity = identityTargetWeights(input.shape, input.confidence ?? null);
  const styled = stylize(identity, {
    caricature: input.caricature ?? 0.35,
    headToBodyScale: resolveMiniMeHeadScale(input.headToBodyScale),
  });
  const body = validateBodyShape(input.body ?? {});
  const bodyWeights = body.ok ? bodyMorphWeights(body.shape) : bodyMorphWeights({});
  const legCtrl = body.ok && typeof body.shape.legHeight === "number" ? body.shape.legHeight : 0;
  const leg = legHeight(legCtrl, { thighM: 0.3304, shinM: 0.3100, ankleM: 0.1400 });
  const separation = assertLayerSeparation(styled.weights as Record<string, number>, {});
  const archetype = input.archetypeId ?? "M2_AVERAGE";
  const integrationGlb = LIVE_ASSET_SWITCHES
    ? null
    : jobArtifactRepoPath(
        "JOB-MINIME-VOICE-REBIRTH-001",
        `bobblehead_minime_${archetype.toLowerCase()}_voice_rebirth_v1.glb`,
      );

  return {
    identityWeights: styled.weights,
    headScale: styled.headScale,
    bodyWeights,
    leg,
    layerSeparationOk: separation.ok,
    integrationGlb,
    liveAssetSwitches: LIVE_ASSET_SWITCHES,
  };
}

export const MINI_ME_CREATION_MODES = [
  "TALK",
  "TEACH",
  "PLAY",
  "MEMORY",
  "VOICE_SETTINGS",
  "RESET_REBIRTH",
] as const;

export type MiniMeCreationMode = (typeof MINI_ME_CREATION_MODES)[number];

export type MiniMeResetKind = "VOICE_RESET" | "PERSONALITY_RESET" | "FULL_REBIRTH";

/**
 * Reset policy — appearance / saved looks / purchased items preserved unless FULL_REBIRTH
 * explicitly includes them (owner-controlled; no silent wipe).
 * Voice/personality clears also reset slow-growth axes via MiniMeSlowGrowthLaw.applyGrowthReset.
 */
export function resolveMiniMeResetScope(kind: MiniMeResetKind): {
  clearVoiceLearning: boolean;
  clearPersonality: boolean;
  clearAppearance: boolean;
  clearSavedLooks: boolean;
  clearPurchases: boolean;
} {
  if (kind === "VOICE_RESET") {
    return {
      clearVoiceLearning: true,
      clearPersonality: false,
      clearAppearance: false,
      clearSavedLooks: false,
      clearPurchases: false,
    };
  }
  if (kind === "PERSONALITY_RESET") {
    return {
      clearVoiceLearning: false,
      clearPersonality: true,
      clearAppearance: false,
      clearSavedLooks: false,
      clearPurchases: false,
    };
  }
  return {
    clearVoiceLearning: true,
    clearPersonality: true,
    clearAppearance: false,
    clearSavedLooks: false,
    clearPurchases: false,
  };
}

/** Re-exports for Creation Center / Quick Panel — slow growth + catchphrase laws. */
export {
  MINI_ME_VOCAL_STAGES,
  INSTANT_FLUENT_SPEECH_FORBIDDEN,
  catchphraseRenditionForStage,
} from "@/lib/avatars/MiniMeSlowGrowthLaw";
export {
  DEFAULT_MINI_ME_SPEECH_SETTINGS,
  decideSpontaneousCallback,
  LEARNING_IMPLIES_PUBLIC_BROADCAST,
} from "@/lib/avatars/MiniMeSpontaneousCallbackPolicy";
export {
  FIRST_HELLO_PROMPT,
  COMPANION_MIC_ACTIVATES_BROADCAST_MIC,
  selectImmediateCompanionReply,
} from "@/lib/avatars/MiniMeDedicatedMicLaw";
export {
  PRACTICE_BEFORE_PRONUNCIATION,
  RECOGNITION_UNLOCKS_FLUENT_SPEECH,
  MINI_SPEAK_ELIMINATED_AT_STAGE_4,
} from "@/lib/avatars/MiniMeLatentLanguageLaw";
export {
  FIXED_FIVE_SECOND_IDLE_LOOP_FORBIDDEN,
  AUTONOMOUS_IDLE_OVERRIDES_OWNER_INPUT,
  decideIdleBehavior,
} from "@/lib/avatars/MiniMeIdlePersonalityLaw";
export {
  HARD_DEVELOPMENT_CEILING,
  FORGETFULNESS_PERMANENTLY_DELETES_MEMORY,
  RUST_ONSET_IDLE_DAYS,
  RUST_NOTICEABLE_IDLE_DAYS,
  RUST_STRONG_IDLE_DAYS,
  lifelongLearningRate,
  applyPlayfulRust,
  practiceSkill,
  buildOwnerReturnWelcome,
  rustSeverityForIdleDays,
} from "@/lib/avatars/MiniMeForgetfulnessAndLifelongLaw";
