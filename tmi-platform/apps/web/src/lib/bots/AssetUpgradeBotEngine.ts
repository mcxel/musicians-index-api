import { evolveAiVisualAsset } from "../ai-visuals/AiVisualEvolutionEngine";
import { getGeneratedAsset } from "../ai-visuals/AiGeneratedAssetRegistry";

export function detectWeakAndUpgradeAsset(assetId: string) {
  const asset = getGeneratedAsset(assetId);
  if (!asset) return null;

  const weak = asset.qualityScore < 70 || asset.status === "draft";
  if (!weak) return asset;

  return evolveAiVisualAsset(
    assetId,
    "Increase realism, scene depth, material detail, and conversion-oriented composition while preserving TMI neon canon."
  );
}
