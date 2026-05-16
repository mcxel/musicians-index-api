import type { AiGeneratedAssetType } from "./AiGeneratedAssetRegistry";

export type AiPromptInput = {
  assetType: AiGeneratedAssetType;
  subject: string;
  ownerSystem: string;
  targetRoute: string;
  style?: string;
  mood?: string;
  references?: string[];
};

const TMI_CANON = [
  "realistic",
  "neon",
  "1980s digital magazine energy",
  "cinematic lighting",
  "live-game-engine feel",
  "not flat",
  "not generic",
];

export function composeAiVisualPrompt(input: AiPromptInput): string {
  const style = input.style ?? "tmi-canon";
  const mood = input.mood ?? "energetic";
  const refs = input.references?.length ? ` References: ${input.references.join(", ")}.` : "";
  return [
    `Create ${input.assetType} for ${input.subject}.`,
    `System: ${input.ownerSystem}.`,
    `Target route: ${input.targetRoute}.`,
    `Style profile: ${style}.`,
    `Mood: ${mood}.`,
    `Canon: ${TMI_CANON.join(", ")}.`,
    refs,
  ].join(" ");
}

export function composeVariationPrompt(basePrompt: string, variationHint: string): string {
  return `${basePrompt} Variation request: ${variationHint}. Keep canon integrity and improve detail, clarity, and conversion-readiness.`;
}
