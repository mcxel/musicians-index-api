import {
  getVisualLearningState,
  recordVisualLearningSignal,
  startVisualLearning,
} from "@/lib/ai-visuals/AiVisualLearningEngine";

export function learnVisualPerformance(input: {
  assetId: string;
  clicked: boolean;
  usedInRevenuePath: boolean;
  rejected: boolean;
}) {
  return recordVisualLearningSignal({
    ...input,
    timestamp: Date.now(),
  });
}

export function getLearningState(assetId: string) {
  return getVisualLearningState(assetId) ?? startVisualLearning(assetId);
}
