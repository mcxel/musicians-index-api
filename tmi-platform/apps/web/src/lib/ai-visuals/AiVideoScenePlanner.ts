export type AiVideoSceneShot = {
  shotId: string;
  durationSec: number;
  camera: "wide" | "medium" | "close" | "drone" | "tracking";
  action: string;
  overlay?: string;
};

export type AiVideoScenePlan = {
  planId: string;
  ownerSystem: string;
  targetRoute: string;
  title: string;
  shots: AiVideoSceneShot[];
  storyboardPrompt: string;
  createdAt: number;
};

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createVideoScenePlan(input: {
  ownerSystem: string;
  targetRoute: string;
  title: string;
  theme: string;
}): AiVideoScenePlan {
  const shots: AiVideoSceneShot[] = [
    { shotId: id("shot"), durationSec: 4, camera: "wide", action: `${input.theme} environment reveal` },
    { shotId: id("shot"), durationSec: 5, camera: "tracking", action: "main performer motion", overlay: "hud neon accent" },
    { shotId: id("shot"), durationSec: 4, camera: "close", action: "reaction + crowd pulse", overlay: "sponsor reactive strip" },
    { shotId: id("shot"), durationSec: 5, camera: "medium", action: "call-to-action loop close", overlay: "return path marker" },
  ];

  return {
    planId: id("vsp"),
    ownerSystem: input.ownerSystem,
    targetRoute: input.targetRoute,
    title: input.title,
    shots,
    storyboardPrompt: `Storyboard ${input.title} in realistic neon 1980s digital-magazine canon with cinematic continuity and clear entry/next/return loop.`,
    createdAt: Date.now(),
  };
}
