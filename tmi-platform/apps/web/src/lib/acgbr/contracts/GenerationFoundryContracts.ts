/**
 * GenerationFoundryContracts — typed interfaces + certified procedural templates ONLY.
 *
 * Honesty: ACGBR Generation Foundry is NOT proof of neural lip-sync / unconstrained
 * live AI 3D. Live path uses certified templates + deterministic seeds + HOT fallbacks.
 * Never block live with "AI generating…".
 */

import type { GenerationFoundryMode } from "./AcgbrLaws";

export type CertifiedProceduralTemplateId =
  | "challenge.intro.contract_lock.v1"
  | "challenge.attempt.active.v1"
  | "challenge.judgment.open.v1"
  | "challenge.result.winner.v1"
  | "challenge.result.tie.v1"
  | "challenge.result.void.v1"
  | "challenge.hot_fallback.static_contract.v1";

export interface CertifiedProceduralTemplate {
  templateId: CertifiedProceduralTemplateId;
  experienceKind: "CHALLENGE";
  mode: GenerationFoundryMode;
  /** Deterministic seed input labels — never live model inference. */
  seedInputs: readonly string[];
  /** If template cannot run, use this HOT fallback immediately (no live wait). */
  hotFallbackTemplateId: CertifiedProceduralTemplateId;
  blocksLiveWhileGenerating: false;
}

export const CHALLENGE_CERTIFIED_TEMPLATE_REGISTRY: readonly CertifiedProceduralTemplate[] =
  Object.freeze([
    {
      templateId: "challenge.intro.contract_lock.v1",
      experienceKind: "CHALLENGE",
      mode: "CERTIFIED_TEMPLATE",
      seedInputs: ["sessionId", "sceneSequence", "presentationRevision"],
      hotFallbackTemplateId: "challenge.hot_fallback.static_contract.v1",
      blocksLiveWhileGenerating: false,
    },
    {
      templateId: "challenge.attempt.active.v1",
      experienceKind: "CHALLENGE",
      mode: "CERTIFIED_TEMPLATE",
      seedInputs: ["sessionId", "sceneSequence", "activeParticipantId"],
      hotFallbackTemplateId: "challenge.hot_fallback.static_contract.v1",
      blocksLiveWhileGenerating: false,
    },
    {
      templateId: "challenge.judgment.open.v1",
      experienceKind: "CHALLENGE",
      mode: "CERTIFIED_TEMPLATE",
      seedInputs: ["sessionId", "judgingPolicy"],
      hotFallbackTemplateId: "challenge.hot_fallback.static_contract.v1",
      blocksLiveWhileGenerating: false,
    },
    {
      templateId: "challenge.result.winner.v1",
      experienceKind: "CHALLENGE",
      mode: "CERTIFIED_TEMPLATE",
      seedInputs: ["sessionId", "winnerId"],
      hotFallbackTemplateId: "challenge.hot_fallback.static_contract.v1",
      blocksLiveWhileGenerating: false,
    },
    {
      templateId: "challenge.result.tie.v1",
      experienceKind: "CHALLENGE",
      mode: "CERTIFIED_TEMPLATE",
      seedInputs: ["sessionId"],
      hotFallbackTemplateId: "challenge.hot_fallback.static_contract.v1",
      blocksLiveWhileGenerating: false,
    },
    {
      templateId: "challenge.result.void.v1",
      experienceKind: "CHALLENGE",
      mode: "CERTIFIED_TEMPLATE",
      seedInputs: ["sessionId"],
      hotFallbackTemplateId: "challenge.hot_fallback.static_contract.v1",
      blocksLiveWhileGenerating: false,
    },
    {
      templateId: "challenge.hot_fallback.static_contract.v1",
      experienceKind: "CHALLENGE",
      mode: "HOT_FALLBACK",
      seedInputs: ["sessionId"],
      hotFallbackTemplateId: "challenge.hot_fallback.static_contract.v1",
      blocksLiveWhileGenerating: false,
    },
  ]);

export function resolveChallengeTemplate(
  templateId: CertifiedProceduralTemplateId
): CertifiedProceduralTemplate {
  const found = CHALLENGE_CERTIFIED_TEMPLATE_REGISTRY.find(
    (t) => t.templateId === templateId
  );
  if (!found) {
    return CHALLENGE_CERTIFIED_TEMPLATE_REGISTRY.find(
      (t) => t.templateId === "challenge.hot_fallback.static_contract.v1"
    )!;
  }
  return found;
}

/** Neural lip-sync / TTS production surfaces are OUT OF SCOPE — typed as unavailable. */
export interface NeuralGenerationSurfaceStub {
  lipSyncNeuralNetAvailable: false;
  unconstrainedLiveAi3dAvailable: false;
  ttsProductionAvailable: false;
  reason: "OUT_OF_SCOPE_ACGBR_HONESTY";
}

export const NEURAL_GENERATION_UNAVAILABLE: NeuralGenerationSurfaceStub =
  Object.freeze({
    lipSyncNeuralNetAvailable: false as const,
    unconstrainedLiveAi3dAvailable: false as const,
    ttsProductionAvailable: false as const,
    reason: "OUT_OF_SCOPE_ACGBR_HONESTY" as const,
  });
