import { composeAiVisualPrompt } from "./AiPromptComposer";
import { judgeAiVisualQuality } from "./AiVisualQualityJudge";
import {
  registerGeneratedAsset,
  updateGeneratedAssetStatus,
  type AiGeneratedAssetRecord,
  type AiGeneratedAssetType,
} from "./AiGeneratedAssetRegistry";

export type AiVisualCreateRequest = {
  assetType: AiGeneratedAssetType;
  subject: string;
  ownerSystem: string;
  targetRoute: string;
  targetComponent: string;
  style?: string;
  references?: string[];
  outputRef?: string;
};

export function createAiVisual(request: AiVisualCreateRequest): AiGeneratedAssetRecord {
  const prompt = composeAiVisualPrompt({
    assetType: request.assetType,
    subject: request.subject,
    ownerSystem: request.ownerSystem,
    targetRoute: request.targetRoute,
    style: request.style,
    references: request.references,
  });

  const draft = registerGeneratedAsset({
    assetType: request.assetType,
    prompt,
    style: request.style ?? "tmi-canon",
    ownerSystem: request.ownerSystem,
    targetRoute: request.targetRoute,
    targetComponent: request.targetComponent,
    qualityScore: 0,
    replacementOf: undefined,
    status: "draft",
    outputRef: request.outputRef,
    generated: true,
    source: "ai_visual_runtime",
    synthetic: true,
    tags: [request.ownerSystem, request.assetType, "ai-generated"],
  });

  const quality = judgeAiVisualQuality({
    assetType: draft.assetType,
    prompt: draft.prompt,
    style: draft.style,
    usageCount: draft.usageCount,
  });

  const approved = registerGeneratedAsset({
    ...draft,
    assetType: draft.assetType,
    prompt: draft.prompt,
    style: draft.style,
    ownerSystem: draft.ownerSystem,
    targetRoute: draft.targetRoute,
    targetComponent: draft.targetComponent,
    qualityScore: quality.qualityScore,
    replacementOf: draft.assetId,
    status: quality.qualityScore >= 70 ? "approved" : "draft",
    outputRef: draft.outputRef,
    generated: true,
    source: "ai_visual_runtime",
    synthetic: true,
    tags: [...draft.tags, quality.qualityScore >= 70 ? "quality-pass" : "quality-rework"],
  });

  updateGeneratedAssetStatus(draft.assetId, "replaced");
  return approved;
}
