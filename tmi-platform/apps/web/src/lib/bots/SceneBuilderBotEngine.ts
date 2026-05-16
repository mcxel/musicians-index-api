import { generateAiScene } from "../ai-visuals/AiSceneGeneratorEngine";

export function buildSceneForRoute(input: {
  subject: string;
  ownerSystem: string;
  targetRoute: string;
  targetComponent: string;
}) {
  return generateAiScene({
    subject: input.subject,
    ownerSystem: input.ownerSystem,
    targetRoute: input.targetRoute,
    targetComponent: input.targetComponent,
    include: ["background", "stage-scene", "prop", "instrument", "billboard-scene"],
  });
}
