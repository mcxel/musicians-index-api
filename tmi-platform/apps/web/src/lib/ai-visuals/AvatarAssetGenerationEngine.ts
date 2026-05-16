/**
 * AvatarAssetGenerationEngine
 * Coordinator for avatar-specific visual generation.
 * Wraps AiVisualCreatorEngine + MotionPortraitEngine for a unified avatar asset API.
 */

import { createAiVisual } from "@/lib/ai-visuals/AiVisualCreatorEngine";
import type { AiGeneratedAssetRecord } from "@/lib/ai-visuals/AiGeneratedAssetRegistry";

export type AvatarVisualTrait = {
  skinTone?: string;
  hairStyle?: string;
  outfitPrimary?: string;
  accessory?: string;
  expression?: string;
  era?: "base" | "developed" | "refined" | "signature" | "iconic";
};

export interface AvatarAssetRequest {
  avatarId: string;
  displayName: string;
  genre?: string;
  traits?: AvatarVisualTrait;
  targetRoute: string;
  targetComponent: string;
}

export interface AvatarAssetResult {
  avatarId: string;
  referenceAsset: AiGeneratedAssetRecord;
  portraitAsset: AiGeneratedAssetRecord;
  generatedAt: number;
}

const assetCache = new Map<string, AvatarAssetResult>();

function traitSummary(traits?: AvatarVisualTrait): string {
  if (!traits) return "contemporary artist style";
  return [
    traits.skinTone && `skin:${traits.skinTone}`,
    traits.hairStyle && `hair:${traits.hairStyle}`,
    traits.outfitPrimary && `outfit:${traits.outfitPrimary}`,
    traits.accessory && `accessory:${traits.accessory}`,
    traits.expression && `expression:${traits.expression}`,
    traits.era && `era:${traits.era}`,
  ].filter(Boolean).join(", ") || "contemporary artist style";
}

export function generateAvatarAsset(req: AvatarAssetRequest): AvatarAssetResult {
  const cached = assetCache.get(req.avatarId);
  if (cached) return cached;

  const subject = `${req.displayName}${req.genre ? `, ${req.genre} artist` : ""}, ${traitSummary(req.traits)}`;

  const referenceAsset = createAiVisual({
    assetType: "avatar-reference",
    subject,
    ownerSystem: "avatar-generation",
    targetRoute: req.targetRoute,
    targetComponent: req.targetComponent,
    style: "tmi-neon-portrait",
    references: [req.avatarId],
  });

  const portraitAsset = createAiVisual({
    assetType: "poster",
    subject: `Motion portrait: ${subject}`,
    ownerSystem: "avatar-generation",
    targetRoute: req.targetRoute,
    targetComponent: `${req.targetComponent}__portrait`,
    style: "tmi-motion-portrait",
    references: [req.avatarId, referenceAsset.assetId],
  });

  const result: AvatarAssetResult = {
    avatarId: req.avatarId,
    referenceAsset,
    portraitAsset,
    generatedAt: Date.now(),
  };

  assetCache.set(req.avatarId, result);
  return result;
}

export function getAvatarAsset(avatarId: string): AvatarAssetResult | null {
  return assetCache.get(avatarId) ?? null;
}

export function invalidateAvatarAsset(avatarId: string): void {
  assetCache.delete(avatarId);
}

export function getAllAvatarAssets(): AvatarAssetResult[] {
  return [...assetCache.values()];
}
