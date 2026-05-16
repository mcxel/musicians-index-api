import { evolveAiVisualAsset } from "@/lib/ai-visuals/AiVisualEvolutionEngine";

export function evolveVisualMotion(assetId: string, signal: string) {
  return evolveAiVisualAsset(assetId, `motion evolution:${signal}`);
}
