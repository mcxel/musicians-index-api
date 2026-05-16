/**
 * DynamicMagazineImageResolver
 * Resolves magazine image slots to AI-generated or live assets.
 * Replaces static/placeholder magazine imagery at runtime.
 */

import { createAiVisual } from "@/lib/ai-visuals/AiVisualCreatorEngine";
import type { AiGeneratedAssetRecord } from "@/lib/ai-visuals/AiGeneratedAssetRegistry";

export type MagazineSlotType =
  | "cover"
  | "spread"
  | "article-hero"
  | "artist-feature"
  | "venue-scene"
  | "event-promo"
  | "editorial-photo"
  | "billboard-ad"
  | "pullquote-bg";

export interface MagazineSlot {
  slotId: string;
  slotType: MagazineSlotType;
  issueId: string;
  pageNumber: number;
  context: string;
  resolved: boolean;
  asset: AiGeneratedAssetRecord | null;
  resolvedAt: number | null;
}

const slotRegistry = new Map<string, MagazineSlot>();

export function registerMagazineSlot(input: Omit<MagazineSlot, "resolved" | "asset" | "resolvedAt">): MagazineSlot {
  const slot: MagazineSlot = { ...input, resolved: false, asset: null, resolvedAt: null };
  slotRegistry.set(input.slotId, slot);
  return slot;
}

export function resolveMagazineSlot(slotId: string, forceResolve = false): MagazineSlot | null {
  const slot = slotRegistry.get(slotId);
  if (!slot) return null;
  if (slot.resolved && !forceResolve) return slot;

  const assetTypeMap: Record<MagazineSlotType, Parameters<typeof createAiVisual>[0]["assetType"]> = {
    cover:           "magazine-spread",
    spread:          "magazine-spread",
    "article-hero":  "poster",
    "artist-feature": "poster",
    "venue-scene":   "venue-skin",
    "event-promo":   "poster",
    "editorial-photo": "image",
    "billboard-ad":  "billboard-scene",
    "pullquote-bg":  "background",
  };

  const asset = createAiVisual({
    assetType: assetTypeMap[slot.slotType],
    subject: slot.context,
    ownerSystem: "magazine-image-resolver",
    targetRoute: `/magazine/issue/${slot.issueId}`,
    targetComponent: `MagazinePage_${slot.pageNumber}_${slot.slotType}`,
    style: "tmi-magazine-editorial",
    references: [slot.issueId],
  });

  slot.asset = asset;
  slot.resolved = true;
  slot.resolvedAt = Date.now();
  return slot;
}

export function resolveAllUnfilledSlots(issueId?: string): MagazineSlot[] {
  const targets = [...slotRegistry.values()].filter(
    s => !s.resolved && (!issueId || s.issueId === issueId)
  );
  return targets.map(s => resolveMagazineSlot(s.slotId)!).filter(Boolean);
}

export function getMagazineSlotCoverage(issueId: string): {
  total: number;
  resolved: number;
  unresolved: number;
  coveragePercent: number;
} {
  const slots = [...slotRegistry.values()].filter(s => s.issueId === issueId);
  const resolved = slots.filter(s => s.resolved).length;
  return {
    total: slots.length,
    resolved,
    unresolved: slots.length - resolved,
    coveragePercent: slots.length > 0 ? Math.round((resolved / slots.length) * 100) : 0,
  };
}

export function getAllMagazineSlots(): MagazineSlot[] {
  return [...slotRegistry.values()];
}
