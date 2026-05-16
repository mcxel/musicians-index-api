import { createAiVisual } from "../ai-visuals/AiVisualCreatorEngine";
import type { AiGeneratedAssetType } from "../ai-visuals/AiGeneratedAssetRegistry";

export type VisualNeed = {
  ownerSystem: string;
  targetRoute: string;
  targetComponent: string;
  subject: string;
  assetType: AiGeneratedAssetType;
};

export function detectAndCreateVisual(need: VisualNeed) {
  return createAiVisual({
    assetType: need.assetType,
    subject: need.subject,
    ownerSystem: need.ownerSystem,
    targetRoute: need.targetRoute,
    targetComponent: need.targetComponent,
    style: "realistic neon 1980s digital magazine",
  });
}
