/**
 * IdentityFragmentRegistry
 * Registers and retrieves identity fragments for avatars, hosts, and performers.
 * Each entity's visual identity is decomposed into reconstructable fragments.
 */

import { registerAsset, type AssetKind } from "@/lib/registry/RuntimeAssetRegistry";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";

export type FragmentType =
  | "face" | "body-skeleton" | "clothing-layer" | "accessory"
  | "hair" | "background" | "lighting-map" | "shadow-map"
  | "expression-base" | "motion-rig" | "pose-anchor" | "prop";

export interface IdentityFragment {
  fragmentId: string;
  entityId: string;
  entityType: "avatar" | "host" | "performer" | "npc" | "venue-character";
  fragmentType: FragmentType;
  sourceAssetId: string | null;        // original asset this was segmented from
  segmentationConfidence: number;      // 0-1
  metadata: {
    boundingBox?: { x: number; y: number; w: number; h: number };
    colorPalette?: string[];
    dominantColor?: string;
    hasTransparency?: boolean;
    estimatedScale?: number;
    styleVector?: number[];
  };
  createdAt: number;
  version: number;
}

const fragments = new Map<string, IdentityFragment[]>();  // entityId → fragments

export function registerFragment(
  entityId: string,
  entityType: IdentityFragment["entityType"],
  fragmentType: FragmentType,
  opts: {
    sourceAssetId?: string;
    confidence?: number;
    metadata?: IdentityFragment["metadata"];
  } = {}
): IdentityFragment {
  const fragmentId = `frag_${entityId}_${fragmentType}_${Date.now()}`;
  const assetKind: AssetKind = entityType === "venue-character" ? "venue-prop" : "avatar";

  registerAsset(fragmentId, assetKind, entityId, {
    generatorId: "IdentityFragmentRegistry",
    motionCompatible: ["face", "body-skeleton", "expression-base", "motion-rig"].includes(fragmentType),
    metadata: { entityId, fragmentType, entityType },
    tags: [entityType, fragmentType],
  });

  recordLineage(fragmentId, "vision-scan", "IdentityFragmentRegistry", {
    parentAssetId: opts.sourceAssetId,
    ancestorIds: opts.sourceAssetId ? [opts.sourceAssetId] : [],
    metadata: { entityId, fragmentType },
  });

  const existing = fragments.get(entityId) ?? [];
  const version = existing.filter(f => f.fragmentType === fragmentType).length + 1;

  const fragment: IdentityFragment = {
    fragmentId, entityId, entityType, fragmentType,
    sourceAssetId: opts.sourceAssetId ?? null,
    segmentationConfidence: opts.confidence ?? 0.8,
    metadata: opts.metadata ?? {},
    createdAt: Date.now(),
    version,
  };

  fragments.set(entityId, [...existing.filter(f => f.fragmentType !== fragmentType), fragment]);
  return fragment;
}

export function getFragments(entityId: string, type?: FragmentType): IdentityFragment[] {
  const all = fragments.get(entityId) ?? [];
  return type ? all.filter(f => f.fragmentType === type) : all;
}

export function getFragment(entityId: string, type: FragmentType): IdentityFragment | null {
  return fragments.get(entityId)?.find(f => f.fragmentType === type) ?? null;
}

export function hasCompleteIdentity(entityId: string): boolean {
  const required: FragmentType[] = ["face", "body-skeleton", "expression-base"];
  return required.every(t => getFragment(entityId, t) !== null);
}

export function getFragmentStats(): { entities: number; totalFragments: number; complete: number } {
  let totalFragments = 0, complete = 0;
  for (const [entityId, frags] of fragments) {
    totalFragments += frags.length;
    if (hasCompleteIdentity(entityId)) complete++;
  }
  return { entities: fragments.size, totalFragments, complete };
}
