import { recordVisualLearningSignal } from "./AiVisualLearningEngine";
import { incrementGeneratedAssetUsage } from "./AiGeneratedAssetRegistry";

export type AiVisualFeedbackEvent = {
  assetId: string;
  eventType: "click" | "use" | "reject";
};

export function recordAiVisualFeedback(event: AiVisualFeedbackEvent) {
  const clicked = event.eventType === "click";
  const usedInRevenuePath = event.eventType === "use";
  const rejected = event.eventType === "reject";

  if (clicked || usedInRevenuePath) {
    incrementGeneratedAssetUsage(event.assetId);
  }

  return recordVisualLearningSignal({
    assetId: event.assetId,
    clicked,
    usedInRevenuePath,
    rejected,
    timestamp: Date.now(),
  });
}
