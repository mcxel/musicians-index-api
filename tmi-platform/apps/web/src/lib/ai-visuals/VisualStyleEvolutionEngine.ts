import { evolveAiVisualAsset } from "@/lib/ai-visuals/AiVisualEvolutionEngine";

export function evolveVisualStyle(assetId: string, styleDirection: string) {
  return evolveAiVisualAsset(assetId, `style evolution:${styleDirection}`);
}
