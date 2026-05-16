import type { AiGeneratedAssetRecord } from "./AiGeneratedAssetRegistry";

export type AiVisualQualityScore = {
  qualityScore: number;
  conversionReadiness: number;
  canonCompliance: number;
  notes: string[];
};

function clamp(input: number): number {
  return Math.max(0, Math.min(100, Math.round(input)));
}

export function judgeAiVisualQuality(asset: Pick<AiGeneratedAssetRecord, "assetType" | "prompt" | "style" | "usageCount">): AiVisualQualityScore {
  const notes: string[] = [];

  const promptQuality = asset.prompt.length > 80 ? 30 : 18;
  if (promptQuality < 25) notes.push("Prompt depth is low; add composition detail.");

  const styleQuality = /neon|realistic|cinematic|magazine/i.test(asset.style) ? 25 : 14;
  if (styleQuality < 20) notes.push("Style is weak against TMI canon.");

  const typeQuality = /poster|venue|battle|ticket|nft|billboard|avatar/.test(asset.assetType) ? 25 : 20;
  const usageQuality = Math.min(20, asset.usageCount);

  const qualityScore = clamp(promptQuality + styleQuality + typeQuality + usageQuality);
  const conversionReadiness = clamp((qualityScore * 0.7) + usageQuality);
  const canonCompliance = clamp(styleQuality * 3.4);

  if (qualityScore < 70) notes.push("Needs upgrade iteration.");
  if (qualityScore >= 85) notes.push("Approved for active placement.");

  return { qualityScore, conversionReadiness, canonCompliance, notes };
}
