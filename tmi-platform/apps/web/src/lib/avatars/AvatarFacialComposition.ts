/**
 * AvatarFacialComposition — layers identity + mood + speech on ONE ARKit-compatible face.
 *
 * FINAL = BASE IDENTITY MORPH + TEMPORAL SPEECH + EXPRESSION/MOOD + BLINK
 * Speech must NOT replace personal lip fullness / mouth width.
 */

import type { FaceIdentityShapeCoefficients } from "@/lib/avatar/AvatarFaceIdentityContract";
import type { AvatarMoodId } from "@/lib/avatars/AvatarMoodPresentation";
import { getAvatarMoodSpec } from "@/lib/avatars/AvatarMoodPresentation";
import {
  getPhonemeFrame,
  type PhonemeGroup,
  type LipSyncFrame,
} from "@/lib/avatar/AvatarLipSyncDirectiveEngine";
import { HostLipSyncEngine, type Viseme } from "@/lib/hosts/HostLipSyncEngine";

export type ArkitWeightMap = Record<string, number>;

export type FacialCompositionInput = {
  identity: FaceIdentityShapeCoefficients;
  mood: AvatarMoodId;
  /** Active speech phoneme — null = silence */
  phoneme?: PhonemeGroup | null;
  /** 0–1 blink */
  blink?: number;
  talking?: boolean;
};

export type FacialCompositionResult = {
  /** Additive ARKit-style weights for Foundry morph targets */
  arkitWeights: ArkitWeightMap;
  /** Identity lip scale retained during speech (never overwritten to generic) */
  lipIdentityScale: { upper: number; lower: number; width: number };
  foundryExpression: ReturnType<typeof getAvatarMoodSpec>["foundryExpression"];
  speechActive: boolean;
};

const VISEME_TO_PHONEME: Record<Viseme, PhonemeGroup> = {
  silence: "rest",
  open: "vowel-open",
  round: "vowel-round",
  wide: "vowel-close",
  bilabial: "bilabial",
  dental: "labiodental",
  alveolar: "alveolar",
  velar: "velar",
  fricative: "dental",
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Map identity lip fullness (−1..1) → scale multiplier around 1.0 */
export function lipFullnessToScale(fullness: number): number {
  return 1 + fullness * 0.35;
}

export function composeFacialPresentation(input: FacialCompositionInput): FacialCompositionResult {
  const mood = getAvatarMoodSpec(input.mood);
  const upper = lipFullnessToScale(input.identity.upperLipFullness);
  const lower = lipFullnessToScale(input.identity.lowerLipFullness);
  const width = 1 + input.identity.mouthWidth * 0.2 + input.identity.lipWidth * 0.1;

  const weights: ArkitWeightMap = {};
  // Mood / expression layer (bounded)
  if (mood.foundryExpression === "smile") {
    weights.mouthSmileLeft = 0.7;
    weights.mouthSmileRight = 0.7;
    weights.cheekSquintLeft = 0.2;
    weights.cheekSquintRight = 0.2;
  } else if (mood.foundryExpression === "hype") {
    weights.jawOpen = 0.28;
    weights.mouthSmileLeft = 0.45;
    weights.mouthSmileRight = 0.45;
    weights.browInnerUp = 0.35;
  } else if (input.mood === "SAD") {
    weights.mouthFrownLeft = 0.35;
    weights.mouthFrownRight = 0.35;
    weights.browDownLeft = 0.25;
    weights.browDownRight = 0.25;
  }

  // Speech layer — additive, scaled by personal lip morphology
  const speechActive = Boolean(input.talking && input.phoneme && input.phoneme !== "rest");
  if (speechActive && input.phoneme) {
    const frame: LipSyncFrame = getPhonemeFrame(input.phoneme);
    const open = (frame.mouthOpenPct / 100) * 0.55;
    const round = (frame.lipRoundPct / 100) * 0.4;
    weights.jawOpen = Math.max(weights.jawOpen ?? 0, open);
    weights.mouthFunnel = round;
    weights.mouthPucker = round * 0.6;
    // Preserve fuller lips: scale mouthClose / funnel intensity, never reset to thin default
    weights.mouthClose = clamp01((1 - open) * (2 - upper) * 0.15);
  }

  const blink = input.blink ?? 0;
  if (blink > 0.02) {
    weights.eyeBlinkLeft = blink;
    weights.eyeBlinkRight = blink;
  }

  return {
    arkitWeights: weights,
    lipIdentityScale: { upper, lower, width },
    foundryExpression: mood.foundryExpression,
    speechActive,
  };
}

/** Build timed speech frames from authorized text — reuses HostLipSyncEngine (ONE path). */
export function speechTextToPhonemeTimeline(text: string): Array<{ phoneme: PhonemeGroup; durationMs: number }> {
  return HostLipSyncEngine.buildVisemeFrames(text).map((f) => ({
    phoneme: VISEME_TO_PHONEME[f.viseme],
    durationMs: f.durationMs,
  }));
}

/**
 * Apply composed ARKit weights onto a Foundry root without wiping identity morphs.
 * Callers pass identity baseline separately; this only sets temporal speech/expression keys.
 */
export function applyComposedArkitWeights(
  morphDict: Record<string, number>,
  morphInfluences: number[],
  composition: FacialCompositionResult,
): void {
  for (const [name, w] of Object.entries(composition.arkitWeights)) {
    const idx = morphDict[name];
    if (idx == null || idx >= morphInfluences.length) continue;
    morphInfluences[idx] = w;
  }
}
