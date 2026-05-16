import { evolveAiVisualAsset } from "@/lib/ai-visuals/AiVisualEvolutionEngine";

export function improveVisualAsset(assetId: string, reason: string) {
  return evolveAiVisualAsset(assetId, `improve for ${reason}`);
}
