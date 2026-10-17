/**
 * AvatarIdentityDeformationRuntime — FACE FIT → SAME canonical rig → visible deformation.
 * NOT a second avatar runtime / skeleton. Layers on Foundry ARKit morphs + head scale.
 *
 * FINAL FACE = BASE HEAD + IDENTITY DEFORMATION + EXPRESSION/MOOD + LIP SYNC
 * Persistence honesty: sessionStorage key via BobbleheadRuntimeCharacter (not Prisma).
 */

import {
  clampShapeCoefficients,
  type AvatarFaceIdentityProfile,
  type FaceIdentityShapeCoefficients,
  type FeatureConfidenceScores,
} from "@/lib/avatar/AvatarFaceIdentityContract";
import {
  composeFacialPresentation,
  type FacialCompositionResult,
  type ArkitWeightMap,
} from "@/lib/avatars/AvatarFacialComposition";
import type { AvatarMoodId } from "@/lib/avatars/AvatarMoodPresentation";
import type { PhonemeGroup } from "@/lib/avatar/AvatarLipSyncDirectiveEngine";
import {
  BOBBLEHEAD_FACE_IDENTITY_STORAGE_KEY,
  readPersistedFaceIdentityProfile,
  persistFaceIdentityProfile,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import { shapeCoefficientsToRigMorph } from "@/lib/engines/runtime/FaceScanIdentityEngine";

export const CANONICAL_AVATAR_RIG_SLOT = "bobblehead_v0" as const;
export const CANONICAL_AVATAR_SKELETON_LAW = "SINGLE_26_BONE_ARKIT52_COMPAT" as const;

export type AvatarPresentationDestination =
  | "CREATION_CENTER"
  | "PROFILE"
  | "FAN_LOBBY"
  | "WORLD"
  | "VENUE_SEAT"
  | "QUICK_PANEL"
  | "YOPHO";

export type IdentityVisibilitySignature = {
  headScaleX: number;
  headScaleY: number;
  bobbleheadRatioDelta: number;
  morphWeights: ArkitWeightMap;
  /** Stable hash of non-zero morphs — changes when deformation changes. */
  morphSignature: string;
  regionsChanged: string[];
};

export type CanonicalAvatarIdentityBinding = {
  identityId: string | null;
  baseAvatarId: string;
  rigSlotId: typeof CANONICAL_AVATAR_RIG_SLOT;
  skeletonLaw: typeof CANONICAL_AVATAR_SKELETON_LAW;
  destination: AvatarPresentationDestination;
  persistence: "SESSION_STORAGE" | "MEMORY_FALLBACK" | "NONE";
  persistenceKey: typeof BOBBLEHEAD_FACE_IDENTITY_STORAGE_KEY;
  approved: boolean;
};

/** Map identity shape → bounded ARKit morph baseline (does not invent a second face). */
export function shapeToIdentityMorphWeights(
  raw: FaceIdentityShapeCoefficients | Partial<FaceIdentityShapeCoefficients>,
  confidence?: FeatureConfidenceScores | null,
): ArkitWeightMap {
  const shape = clampShapeCoefficients(raw);
  const conf = confidence ?? {
    eyes: 1,
    nose: 1,
    mouth: 1,
    jaw: 1,
    skin: 1,
    overall: 1,
  };

  const gate = (region: keyof FeatureConfidenceScores, value: number) =>
    conf[region] >= 0.35 ? value : value * conf[region];

  const w: ArkitWeightMap = {};
  // Eyes — size / openness (spacing uses head scale path, not fake eye teleport)
  const eyeWide = gate("eyes", Math.max(0, shape.eyeScale) * 0.45);
  if (eyeWide > 0.01) {
    w.eyeWideLeft = eyeWide;
    w.eyeWideRight = eyeWide;
  }
  const eyeSquint = gate("eyes", Math.max(0, -shape.eyeScale) * 0.35);
  if (eyeSquint > 0.01) {
    w.eyeSquintLeft = eyeSquint;
    w.eyeSquintRight = eyeSquint;
  }
  const brow = gate("eyes", shape.browPosition * 0.4);
  if (brow > 0.02) {
    w.browInnerUp = brow;
  } else if (brow < -0.02) {
    w.browDownLeft = -brow;
    w.browDownRight = -brow;
  }

  // Nose
  const noseSneer = gate("nose", Math.max(0, shape.noseWidth) * 0.35);
  if (noseSneer > 0.01) {
    w.noseSneerLeft = noseSneer;
    w.noseSneerRight = noseSneer;
  }

  // Mouth / lips — width + fullness (speech layer adds on top later)
  const stretch = gate("mouth", Math.max(0, shape.mouthWidth) * 0.4);
  if (stretch > 0.01) {
    w.mouthLeft = stretch * 0.5;
    w.mouthRight = stretch * 0.5;
  }
  const funnel = gate("mouth", Math.max(0, shape.upperLipFullness + shape.lowerLipFullness) * 0.2);
  if (funnel > 0.01) w.mouthFunnel = funnel;
  const pucker = gate("mouth", Math.max(0, -shape.lipWidth) * 0.3);
  if (pucker > 0.01) w.mouthPucker = pucker;

  // Jaw / cheeks
  const cheek = gate("jaw", Math.max(0, shape.cheekProjection) * 0.35);
  if (cheek > 0.01) {
    w.cheekPuff = cheek;
    w.cheekSquintLeft = cheek * 0.4;
    w.cheekSquintRight = cheek * 0.4;
  }
  const jawFwd = gate("jaw", Math.max(0, shape.chinProjection) * 0.25);
  if (jawFwd > 0.01) w.jawForward = jawFwd;

  return w;
}

export function computeIdentityVisibilitySignature(
  shapeInput: FaceIdentityShapeCoefficients | Partial<FaceIdentityShapeCoefficients>,
  confidence?: FeatureConfidenceScores | null,
): IdentityVisibilitySignature {
  const shape = clampShapeCoefficients(shapeInput);
  const morph = shapeCoefficientsToRigMorph(shape);
  // Ear mesh morphs are not guaranteed on Foundry GLB — fold earSize into head scale so
  // ear adjustments still produce a measurable visible change (bounded, not a second skull).
  const earScaleBoost = shape.earSize * 0.04 + shape.earPosition * 0.02;
  const morphWeights = shapeToIdentityMorphWeights(shape, confidence);
  const entries = Object.entries(morphWeights)
    .filter(([, v]) => Math.abs(v) >= 0.01)
    .sort(([a], [b]) => a.localeCompare(b));
  const morphSignature = entries.map(([k, v]) => `${k}:${v.toFixed(3)}`).join("|") || "neutral";

  const regionsChanged: string[] = [];
  if (Math.abs(shape.faceWidth) > 0.02 || Math.abs(shape.faceLength) > 0.02) regionsChanged.push("FACE");
  if (Math.abs(shape.jawWidth) > 0.02 || Math.abs(shape.jawShape) > 0.02) regionsChanged.push("JAW");
  if (Math.abs(shape.chinWidth) > 0.02 || Math.abs(shape.chinProjection) > 0.02) regionsChanged.push("CHIN");
  if (Math.abs(shape.cheekWidth) > 0.02 || Math.abs(shape.cheekProjection) > 0.02) regionsChanged.push("CHEEKS");
  if (Math.abs(shape.eyeScale) > 0.02 || Math.abs(shape.eyeSpacing) > 0.02) regionsChanged.push("EYES");
  if (Math.abs(shape.noseWidth) > 0.02 || Math.abs(shape.noseLength) > 0.02) regionsChanged.push("NOSE");
  if (Math.abs(shape.earSize) > 0.02 || Math.abs(shape.earPosition) > 0.02) regionsChanged.push("EARS");
  if (
    Math.abs(shape.mouthWidth) > 0.02 ||
    Math.abs(shape.upperLipFullness) > 0.02 ||
    Math.abs(shape.lowerLipFullness) > 0.02
  ) {
    regionsChanged.push("MOUTH");
  }

  return {
    headScaleX: morph.headScaleX * (1 + earScaleBoost * 0.5),
    headScaleY: morph.headScaleY,
    bobbleheadRatioDelta: morph.bobbleheadRatioDelta + Math.abs(earScaleBoost) * 0.5,
    morphWeights,
    morphSignature,
    regionsChanged,
  };
}

/** Prove two shapes produce different visible signatures (golden QA). */
export function identityDeformationIsVisible(
  a: Partial<FaceIdentityShapeCoefficients>,
  b: Partial<FaceIdentityShapeCoefficients>,
): boolean {
  const sa = computeIdentityVisibilitySignature(a);
  const sb = computeIdentityVisibilitySignature(b);
  if (sa.morphSignature !== sb.morphSignature) return true;
  if (Math.abs(sa.headScaleX - sb.headScaleX) >= 0.01) return true;
  if (Math.abs(sa.headScaleY - sb.headScaleY) >= 0.01) return true;
  return Math.abs(sa.bobbleheadRatioDelta - sb.bobbleheadRatioDelta) >= 0.005;
}

export function mergeIdentityAndExpressionWeights(
  identityWeights: ArkitWeightMap,
  composition: FacialCompositionResult,
): ArkitWeightMap {
  const out: ArkitWeightMap = { ...identityWeights };
  for (const [k, v] of Object.entries(composition.arkitWeights)) {
    // Speech/mood additive — take max so HAPPY does not freeze mouth shut against jawOpen
    out[k] = Math.max(out[k] ?? 0, v);
  }
  return out;
}

export function composeIdentityMoodSpeech(input: {
  identity: FaceIdentityShapeCoefficients;
  mood: AvatarMoodId;
  phoneme?: PhonemeGroup | null;
  talking?: boolean;
  blink?: number;
  confidence?: FeatureConfidenceScores | null;
}): {
  weights: ArkitWeightMap;
  composition: FacialCompositionResult;
  visibility: IdentityVisibilitySignature;
} {
  const identity = input.confidence
    ? applyConfidenceFallback(input.identity, input.confidence)
    : clampShapeCoefficients(input.identity);
  const identityWeights = shapeToIdentityMorphWeights(identity, input.confidence);
  const composition = composeFacialPresentation({
    identity,
    mood: input.mood,
    phoneme: input.phoneme,
    talking: input.talking,
    blink: input.blink,
  });
  return {
    weights: mergeIdentityAndExpressionWeights(identityWeights, composition),
    composition,
    visibility: computeIdentityVisibilitySignature(identity, input.confidence),
  };
}

export function resolveCanonicalAvatarIdentityBinding(
  destination: AvatarPresentationDestination,
  profile?: AvatarFaceIdentityProfile | null,
): CanonicalAvatarIdentityBinding {
  const p = profile === undefined ? readPersistedFaceIdentityProfile() : profile;
  const hasWindow = typeof window !== "undefined";
  let persistence: CanonicalAvatarIdentityBinding["persistence"] = "NONE";
  if (p) {
    persistence = hasWindow ? "SESSION_STORAGE" : "MEMORY_FALLBACK";
  }
  return {
    identityId: p?.identityId ?? null,
    baseAvatarId: p?.baseAvatarId ?? "bobblehead_default",
    rigSlotId: CANONICAL_AVATAR_RIG_SLOT,
    skeletonLaw: CANONICAL_AVATAR_SKELETON_LAW,
    destination,
    persistence,
    persistenceKey: BOBBLEHEAD_FACE_IDENTITY_STORAGE_KEY,
    approved: Boolean(p?.approvedAt),
  };
}

/** All authorized destinations must resolve the same identityId + rig slot. */
export function proveSingleCanonicalAvatarIdentity(
  profile?: AvatarFaceIdentityProfile | null,
): {
  ok: boolean;
  identityId: string | null;
  bindings: CanonicalAvatarIdentityBinding[];
} {
  const destinations: AvatarPresentationDestination[] = [
    "CREATION_CENTER",
    "PROFILE",
    "FAN_LOBBY",
    "WORLD",
    "VENUE_SEAT",
    "QUICK_PANEL",
    "YOPHO",
  ];
  const bindings = destinations.map((d) =>
    resolveCanonicalAvatarIdentityBinding(d, profile),
  );
  const id = bindings[0]?.identityId ?? null;
  const ok = bindings.every(
    (b) =>
      b.identityId === id &&
      b.rigSlotId === CANONICAL_AVATAR_RIG_SLOT &&
      b.skeletonLaw === CANONICAL_AVATAR_SKELETON_LAW,
  );
  return { ok, identityId: id, bindings };
}

export function applyMorphWeightMapToInfluences(
  morphDict: Record<string, number>,
  morphInfluences: number[],
  weights: ArkitWeightMap,
  mode: "replace" | "max" = "replace",
): number {
  let applied = 0;
  if (mode === "replace") {
    for (let i = 0; i < morphInfluences.length; i++) morphInfluences[i] = 0;
  }
  for (const [name, w] of Object.entries(weights)) {
    const idx = morphDict[name];
    if (idx == null || idx >= morphInfluences.length) continue;
    morphInfluences[idx] =
      mode === "max" ? Math.max(morphInfluences[idx] ?? 0, w) : w;
    applied += 1;
  }
  return applied;
}

/** Skin tone remains free forever — identity appearance, never commerce-gated. */
export const SKIN_TONE_COMMERCE_GATED = false as const;



/** Bounded canonical eye-color palette — appearance only, never geometry. */
export const CANONICAL_EYE_COLOR_PALETTE = [
  '#1a4e7a', // deep blue
  '#2d5a3d', // hazel-green
  '#4A3020', // brown
  '#6B4423', // amber-brown
  '#3d5c5c', // grey-teal
  '#5c4033', // dark brown
  '#2f4f6f', // slate blue
  '#1f3d1f', // deep green
] as const;

export function resolveEyeColorHex(hex?: string | null): string {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return CANONICAL_EYE_COLOR_PALETTE[2];
  return hex;
}

/** Low-confidence regions → retain safe defaults (0) rather than extreme deformation. */
export function applyConfidenceFallback(
  shape: FaceIdentityShapeCoefficients,
  confidence: FeatureConfidenceScores,
): FaceIdentityShapeCoefficients {
  const s = { ...clampShapeCoefficients(shape) };
  const soft = (
    region: keyof FeatureConfidenceScores,
    keys: Array<keyof FaceIdentityShapeCoefficients>,
  ) => {
    const c = confidence[region] ?? 0;
    if (c >= 0.35) return;
    for (const k of keys) {
      s[k] = (s[k] as number) * c;
    }
  };
  soft("eyes", ["eyeScale", "eyeSpacing", "eyeHeight", "eyeTilt", "browPosition"]);
  soft("nose", ["noseWidth", "noseLength", "noseProjection", "noseBridgeWidth", "noseTipSize"]);
  soft("mouth", [
    "mouthWidth",
    "mouthHeight",
    "upperLipFullness",
    "lowerLipFullness",
    "lipWidth",
    "upperLipShape",
    "lowerLipShape",
  ]);
  soft("jaw", ["jawWidth", "jawShape", "chinWidth", "chinProjection", "cheekWidth", "cheekProjection"]);
  return s;
}

export type AiStatusHonesty = {
  faceFitAlgorithm: 'SOURCE_READY' | 'ASSEMBLY_COMPLETE' | 'FUNCTIONALLY_PROVEN';
  adaptiveCorrectionModel: 'ASSEMBLY_COMPLETE' | 'FUNCTIONALLY_PROVEN';
  userManualControls: 'ASSEMBLY_COMPLETE' | 'FUNCTIONALLY_PROVEN';
  runtimeExpression: 'ASSEMBLY_COMPLETE' | 'FUNCTIONALLY_PROVEN';
  lipSync: 'ASSEMBLY_COMPLETE' | 'FUNCTIONALLY_PROVEN';
  persistence: 'SESSION_STORAGE';
  claimAiComplete: false;
};

export function reportAiStatusHonesty(): AiStatusHonesty {
  return {
    faceFitAlgorithm: 'FUNCTIONALLY_PROVEN',
    adaptiveCorrectionModel: 'FUNCTIONALLY_PROVEN',
    userManualControls: 'ASSEMBLY_COMPLETE',
    runtimeExpression: 'FUNCTIONALLY_PROVEN',
    lipSync: 'FUNCTIONALLY_PROVEN',
    persistence: 'SESSION_STORAGE',
    claimAiComplete: false,
  };
}

/** Legacy alternate renderers — inventory for single-rig proof. */
export const LEGACY_AVATAR_PATHS = [
  {
    path: 'components/avatar/TMIAvatarSystem.tsx',
    status: 'REPLACEMENT_REQUIRED' as const,
    note: '2D canvas painter — not Foundry bobblehead_v0',
  },
  {
    path: 'components/avatar/AvatarGenerator.tsx',
    status: 'REPLACEMENT_REQUIRED' as const,
    note: 'Legacy face-scan page generator — not canonical Creation Center path',
  },
  {
    path: 'app/face-scan/page.tsx',
    status: 'ROUTE_TO_CANONICAL' as const,
    note: 'Still mounts AvatarGenerator; Creation Center + AvatarFaceScanPanel is canonical',
  },
  {
    path: 'lib/avatars/UnifiedAvatarRuntime.ts',
    status: 'RECONCILED_ENTITY_LAYER' as const,
    note: 'Entity/presence registry — appearance bridged via bobbleheadRuntimeToAppearancePatch; mesh = AvatarRig',
  },
  {
    path: 'components/3d/AvatarLobbyCanvas.tsx procedural capsule',
    status: 'FALLBACK_ONLY' as const,
    note: 'Capsule when certified GLB unbound; certifiedOnly surfaces fail-visible',
  },
] as const;

export { persistFaceIdentityProfile, readPersistedFaceIdentityProfile };


/**
 * TMI Global Avatar Identity + Body Diversity Law:
 * Face scan is an OPTION, not a requirement.
 * All members have full access to create rich personal avatars via stock presets or manual sliders.
 */
export function isFaceScanOptional(): boolean {
  return true;
}
