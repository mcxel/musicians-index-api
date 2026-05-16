import { createAiVisual, type AiVisualCreateRequest } from "./AiVisualCreatorEngine";
import type { AiGeneratedAssetRecord } from "./AiGeneratedAssetRegistry";

export type AiSceneRequest = {
  subject: string;
  ownerSystem: string;
  targetRoute: string;
  targetComponent: string;
  include: Array<"background" | "stage-scene" | "prop" | "instrument" | "billboard-scene" | "venue-skin">;
};

export function generateAiScene(request: AiSceneRequest): AiGeneratedAssetRecord[] {
  const outputs: AiGeneratedAssetRecord[] = [];

  for (const item of request.include) {
    const visualRequest: AiVisualCreateRequest = {
      assetType: item,
      subject: `${request.subject} ${item}`,
      ownerSystem: request.ownerSystem,
      targetRoute: request.targetRoute,
      targetComponent: request.targetComponent,
      style: "realistic neon live-magazine",
    };
    outputs.push(createAiVisual(visualRequest));
  }

  return outputs;
}
