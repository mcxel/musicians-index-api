/**
 * LayerIsolationEngine — Stage B Supplement
 * Isolates discrete visual layers from a decomposed asset:
 * foreground subjects, clothing/accessories, lighting zones, props,
 * environmental geometry, seating, display panels, UI overlays,
 * face regions, motion candidates.
 * Each isolated layer is registered, authority-claimed, and lineage-tracked.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import type { DecompositionArtifact } from "@/lib/vision/VisionDecompositionEngine";

export type IsolationCategory =
  | "foreground-subject"
  | "clothing"
  | "accessory"
  | "lighting-zone"
  | "prop"
  | "environmental-geometry"
  | "seating"
  | "display-panel"
  | "ui-overlay"
  | "face-region"
  | "motion-candidate"
  | "background-layer"
  | "crowd-segment"
  | "stage-geometry"
  | "sponsor-surface";

export interface IsolatedLayer {
  layerId: string;
  assetId: string;
  sourceAssetId: string;
  decompositionId: string;
  category: IsolationCategory;
  confidence: number;
  boundingBox: { x: number; y: number; w: number; h: number } | null;
  depthOrder: number;      // 0 = nearest to camera
  isAnimatable: boolean;
  hasTransparency: boolean;
  reconstructable: boolean;
  parentArtifactIds: string[];
  registeredAt: number;
}

export interface LayerIsolationResult {
  isolationId: string;
  sourceAssetId: string;
  decompositionId: string;
  layers: IsolatedLayer[];
  foregroundCount: number;
  faceRegionCount: number;
  motionCandidateCount: number;
  displayPanelCount: number;
  errors: string[];
  isolatedAt: number;
}

const ISOLATION_PRIORITY = 3;
const ISOLATION_TTL_MS = 30_000;

const isolationLog = new Map<string, LayerIsolationResult>();
type IsolationListener = (result: LayerIsolationResult) => void;
const isolationListeners = new Set<IsolationListener>();

function notify(result: LayerIsolationResult): void {
  isolationListeners.forEach(l => l(result));
}

const MATERIAL_TO_CATEGORY: Record<string, IsolationCategory> = {
  "skin":          "face-region",
  "fabric":        "clothing",
  "metal":         "prop",
  "glass":         "display-panel",
  "wood":          "environmental-geometry",
  "plastic":       "prop",
  "light-emitter": "lighting-zone",
  "particle":      "lighting-zone",
  "backdrop":      "background-layer",
  "liquid":        "environmental-geometry",
  "organic":       "environmental-geometry",
  "ui-element":    "ui-overlay",
  "text-surface":  "display-panel",
};

function categoryFromArtifact(artifact: DecompositionArtifact): IsolationCategory {
  if (artifact.kind === "skeletal-hint") return "foreground-subject";
  if (artifact.kind === "animation-candidate") return "motion-candidate";
  if (artifact.kind === "shadow-map") return "background-layer";
  if (artifact.kind === "highlight-zone") return "lighting-zone";
  if (artifact.kind === "motion-segment") return "motion-candidate";
  if (artifact.materialTag && artifact.materialTag in MATERIAL_TO_CATEGORY) {
    return MATERIAL_TO_CATEGORY[artifact.materialTag];
  }
  if (artifact.skeletalHints.includes("face") || artifact.skeletalHints.includes("head")) return "face-region";
  if (artifact.skeletalHints.includes("body") || artifact.skeletalHints.includes("spine")) return "foreground-subject";
  if (artifact.kind === "reusable-layer") return "foreground-subject";
  return "environmental-geometry";
}

function buildLayer(
  artifact: DecompositionArtifact,
  sourceAssetId: string,
  decompositionId: string,
  index: number
): IsolatedLayer | null {
  const category = categoryFromArtifact(artifact);
  const layerId = `layer_${decompositionId}_${category}_${index}`;
  const assetId = `isolated_layer_${layerId}`;

  registerAsset(assetId, "overlay", sourceAssetId, {
    generatorId: "LayerIsolationEngine",
    motionCompatible: artifact.isAnimatable,
    recoveryEligible: artifact.reconstructable,
    metadata: {
      category,
      decompositionId,
      artifactId: artifact.artifactId,
      depthLayer: artifact.depthLayer,
    },
    tags: ["isolated-layer", category, sourceAssetId],
  });

  const claim = claimAuthority(assetId, "LayerIsolationEngine", "generator", {
    exclusive: false,
    priority: ISOLATION_PRIORITY,
    ttlMs: ISOLATION_TTL_MS,
  });

  if (!claim.granted) return null;

  setHydrationStatus(assetId, "hydrating");
  recordLineage(assetId, "vision-scan", "LayerIsolationEngine", {
    parentAssetId: artifact.assetId,
    transforms: ["segment", "fragment"],
    reconstructable: artifact.reconstructable,
    metadata: { category, decompositionId, artifactKind: artifact.kind },
  });
  setHydrationStatus(assetId, "hydrated");

  return {
    layerId,
    assetId,
    sourceAssetId,
    decompositionId,
    category,
    confidence: artifact.confidence,
    boundingBox: artifact.boundingBox,
    depthOrder: artifact.depthLayer ?? index,
    isAnimatable: artifact.isAnimatable,
    hasTransparency: artifact.hasTransparency,
    reconstructable: artifact.reconstructable,
    parentArtifactIds: [artifact.artifactId],
    registeredAt: Date.now(),
  };
}

export function isolateLayers(
  sourceAssetId: string,
  decompositionId: string,
  artifacts: DecompositionArtifact[]
): LayerIsolationResult {
  const isolationId = `isolation_${sourceAssetId}_${Date.now()}`;
  const layers: IsolatedLayer[] = [];
  const errors: string[] = [];

  const sorted = [...artifacts].sort((a, b) => (a.depthLayer ?? 999) - (b.depthLayer ?? 999));

  sorted.forEach((artifact, i) => {
    try {
      const layer = buildLayer(artifact, sourceAssetId, decompositionId, i);
      if (layer) layers.push(layer);
    } catch (err) {
      errors.push(`artifact[${artifact.artifactId}]: ${err instanceof Error ? err.message : "unknown"}`);
    }
  });

  // Merge co-located layers of same category (face regions with skeletal hints)
  const merged = mergeFaceRegions(layers);

  const result: LayerIsolationResult = {
    isolationId,
    sourceAssetId,
    decompositionId,
    layers: merged,
    foregroundCount: merged.filter(l => l.category === "foreground-subject").length,
    faceRegionCount: merged.filter(l => l.category === "face-region").length,
    motionCandidateCount: merged.filter(l => l.category === "motion-candidate").length,
    displayPanelCount: merged.filter(l => l.category === "display-panel").length,
    errors,
    isolatedAt: Date.now(),
  };

  isolationLog.set(isolationId, result);
  notify(result);
  return result;
}

function mergeFaceRegions(layers: IsolatedLayer[]): IsolatedLayer[] {
  const faceRegions = layers.filter(l => l.category === "face-region");
  const others = layers.filter(l => l.category !== "face-region");

  if (faceRegions.length <= 1) return layers;

  // Merge overlapping face regions into one (highest confidence wins)
  const primary = faceRegions.reduce((best, l) => l.confidence > best.confidence ? l : best, faceRegions[0]);
  const merged: IsolatedLayer = {
    ...primary,
    parentArtifactIds: faceRegions.flatMap(l => l.parentArtifactIds),
  };

  return [...others, merged];
}

export function getIsolationResult(isolationId: string): LayerIsolationResult | null {
  return isolationLog.get(isolationId) ?? null;
}

export function getIsolationsByAsset(sourceAssetId: string): LayerIsolationResult[] {
  return [...isolationLog.values()].filter(r => r.sourceAssetId === sourceAssetId);
}

export function getLayersByCategory(category: IsolationCategory): IsolatedLayer[] {
  const out: IsolatedLayer[] = [];
  for (const r of isolationLog.values()) {
    out.push(...r.layers.filter(l => l.category === category));
  }
  return out;
}

export function subscribeToIsolation(listener: IsolationListener): () => void {
  isolationListeners.add(listener);
  return () => isolationListeners.delete(listener);
}

export function getLayerIsolationStats(): {
  totalIsolations: number;
  totalLayers: number;
  byCategory: Record<IsolationCategory, number>;
  totalErrors: number;
} {
  const byCategory = {} as Record<IsolationCategory, number>;
  let totalLayers = 0, totalErrors = 0;

  for (const r of isolationLog.values()) {
    totalLayers += r.layers.length;
    totalErrors += r.errors.length;
    for (const l of r.layers) {
      byCategory[l.category] = (byCategory[l.category] ?? 0) + 1;
    }
  }

  return { totalIsolations: isolationLog.size, totalLayers, byCategory, totalErrors };
}
