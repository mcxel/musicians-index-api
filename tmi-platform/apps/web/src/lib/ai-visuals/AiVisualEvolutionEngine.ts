import { composeVariationPrompt } from "./AiPromptComposer";
import { getGeneratedAsset, registerGeneratedAsset, updateGeneratedAssetStatus } from "./AiGeneratedAssetRegistry";
import { getVisualLearningState } from "./AiVisualLearningEngine";
import { judgeAiVisualQuality } from "./AiVisualQualityJudge";

export function evolveAiVisualAsset(assetId: string, variationHint: string) {
  const current = getGeneratedAsset(assetId);
  if (!current) return null;

  const learning = getVisualLearningState(assetId);
  const evolvedPrompt = composeVariationPrompt(current.prompt, variationHint);

  const draft = registerGeneratedAsset({
    assetType: current.assetType,
    prompt: evolvedPrompt,
    style: current.style,
    ownerSystem: current.ownerSystem,
    targetRoute: current.targetRoute,
    targetComponent: current.targetComponent,
    qualityScore: 0,
    replacementOf: current.assetId,
    status: "draft",
    outputRef: current.outputRef,
    tags: [...current.tags, "evolution-pass"],
  });

  const quality = judgeAiVisualQuality({
    assetType: draft.assetType,
    prompt: draft.prompt,
    style: draft.style,
    usageCount: learning?.engagementScore ?? draft.usageCount,
  });

  const evolved = registerGeneratedAsset({
    ...draft,
    qualityScore: quality.qualityScore,
    replacementOf: current.assetId,
    status: quality.qualityScore >= current.qualityScore ? "approved" : "draft",
    tags: [...draft.tags, quality.qualityScore >= current.qualityScore ? "improved" : "needs-more-evolution"],
  });

  if (quality.qualityScore >= current.qualityScore) {
    updateGeneratedAssetStatus(current.assetId, "replaced");
  }

  return evolved;
}
