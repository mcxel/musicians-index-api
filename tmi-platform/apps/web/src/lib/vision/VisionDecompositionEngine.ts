/**
 * VisionDecompositionEngine — Stage B (Core)
 * Receives raw vision scan output and extracts decomposition artifacts:
 * masks, vectors, transparency maps, depth estimates, material tags,
 * animation candidates, skeletal hints, motion segmentation.
 * Every artifact is registered, authority-claimed, and lineage-tracked.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";

export type DecompositionArtifactKind =
  | "mask"
  | "vector-outline"
  | "transparency-map"
  | "depth-estimate"
  | "material-tag"
  | "animation-candidate"
  | "skeletal-hint"
  | "motion-segment"
  | "reusable-layer"
  | "texture-region"
  | "shadow-map"
  | "highlight-zone";

export type MaterialTag =
  | "skin" | "fabric" | "metal" | "glass" | "wood" | "plastic"
  | "light-emitter" | "particle" | "backdrop" | "liquid" | "organic"
  | "ui-element" | "text-surface" | "unknown-material";

export interface DecompositionArtifact {
  artifactId: string;
  assetId: string;
  sourceAssetId: string;
  kind: DecompositionArtifactKind;
  confidence: number;
  boundingBox: { x: number; y: number; w: number; h: number } | null;
  materialTag: MaterialTag | null;
  isAnimatable: boolean;
  hasTransparency: boolean;
  depthLayer: number | null;   // 0 = foreground, higher = further back
  skeletalHints: string[];
  motionVector: { dx: number; dy: number } | null;
  reconstructable: boolean;
  registeredAt: number;
}

export interface DecompositionResult {
  decompositionId: string;
  sourceAssetId: string;
  jobId: string;
  artifacts: DecompositionArtifact[];
  maskCount: number;
  animatableCount: number;
  skeletalHintCount: number;
  dominantMaterial: MaterialTag | null;
  hasMotionCandidates: boolean;
  processingTimeMs: number;
  errors: string[];
  decomposedAt: number;
}

const DECOMPOSITION_PRIORITY = 4;
const DECOMPOSITION_TTL_MS = 30_000;

const decompositionLog = new Map<string, DecompositionResult>();
type DecompositionListener = (result: DecompositionResult) => void;
const decompositionListeners = new Set<DecompositionListener>();

function notify(result: DecompositionResult): void {
  decompositionListeners.forEach(l => l(result));
}

function inferMaterial(kind: DecompositionArtifactKind, hints: string[]): MaterialTag {
  if (hints.includes("face") || hints.includes("skin")) return "skin";
  if (hints.includes("clothing") || hints.includes("fabric")) return "fabric";
  if (hints.includes("light") || hints.includes("glow")) return "light-emitter";
  if (hints.includes("text") || hints.includes("billboard")) return "text-surface";
  if (hints.includes("ui") || hints.includes("hud")) return "ui-element";
  if (kind === "shadow-map") return "backdrop";
  return "unknown-material";
}

function buildArtifact(
  sourceAssetId: string,
  jobId: string,
  kind: DecompositionArtifactKind,
  index: number,
  opts: {
    confidence?: number;
    boundingBox?: DecompositionArtifact["boundingBox"];
    materialHints?: string[];
    depthLayer?: number;
    motionVector?: DecompositionArtifact["motionVector"];
    isAnimatable?: boolean;
    hasTransparency?: boolean;
  } = {}
): DecompositionArtifact | null {
  const artifactId = `artifact_${jobId}_${kind}_${index}`;
  const assetId = `decomp_artifact_${artifactId}`;
  const materialTag = inferMaterial(kind, opts.materialHints ?? []);
  const skeletalHints = (opts.materialHints ?? []).filter(h =>
    ["face", "body", "arm", "leg", "hand", "spine", "head"].includes(h)
  );

  registerAsset(assetId, "overlay", sourceAssetId, {
    generatorId: "VisionDecompositionEngine",
    motionCompatible: opts.isAnimatable ?? false,
    recoveryEligible: true,
    metadata: { kind, materialTag, depthLayer: opts.depthLayer ?? null },
    tags: ["decomp-artifact", kind, materialTag],
  });

  const claim = claimAuthority(assetId, "VisionDecompositionEngine", "generator", {
    exclusive: false, priority: DECOMPOSITION_PRIORITY, ttlMs: DECOMPOSITION_TTL_MS,
  });

  if (!claim.granted) return null;

  setHydrationStatus(assetId, "hydrating");
  recordLineage(assetId, "vision-scan", "VisionDecompositionEngine", {
    parentAssetId: sourceAssetId,
    transforms: ["segment"],
    reconstructable: kind !== "shadow-map" && kind !== "motion-segment",
    metadata: { kind, materialTag, jobId },
  });
  setHydrationStatus(assetId, "hydrated");

  return {
    artifactId, assetId, sourceAssetId, kind,
    confidence: opts.confidence ?? 0.75,
    boundingBox: opts.boundingBox ?? null,
    materialTag,
    isAnimatable: opts.isAnimatable ?? (kind === "animation-candidate" || kind === "skeletal-hint"),
    hasTransparency: opts.hasTransparency ?? (kind === "transparency-map" || kind === "mask"),
    depthLayer: opts.depthLayer ?? null,
    skeletalHints,
    motionVector: opts.motionVector ?? null,
    reconstructable: kind !== "shadow-map" && kind !== "motion-segment",
    registeredAt: Date.now(),
  };
}

export function decomposeAsset(
  sourceAssetId: string,
  jobId: string,
  rawData: {
    hasForegroundSubject: boolean;
    hasBackground: boolean;
    hasMotion: boolean;
    dominantColors: string[];
    estimatedLayers: number;
    materialHints: string[];
    boundingBoxes: Array<{ x: number; y: number; w: number; h: number; label: string }>;
    depthMap: number[];
    motionVectors?: Array<{ dx: number; dy: number; region: string }>;
  }
): DecompositionResult {
  const decompositionId = `decomp_${sourceAssetId}_${Date.now()}`;
  const startTime = Date.now();
  const artifacts: DecompositionArtifact[] = [];
  const errors: string[] = [];

  const artifactSpecs: Array<[DecompositionArtifactKind, object]> = [
    ["mask", { confidence: 0.9, hasTransparency: true }],
    ["vector-outline", { confidence: 0.8 }],
    ["transparency-map", { hasTransparency: true, confidence: 0.85 }],
    ["depth-estimate", { depthLayer: rawData.estimatedLayers, confidence: 0.7 }],
    ["material-tag", { materialHints: rawData.materialHints, confidence: 0.75 }],
    ...(rawData.hasMotion ? [["motion-segment", { confidence: 0.8 }]] as Array<[DecompositionArtifactKind, object]> : []),
    ...(rawData.hasForegroundSubject ? [
      ["animation-candidate", { isAnimatable: true, materialHints: rawData.materialHints, confidence: 0.85 }],
      ["skeletal-hint", { isAnimatable: true, materialHints: rawData.materialHints, confidence: 0.7 }],
    ] as Array<[DecompositionArtifactKind, object]> : []),
    ["shadow-map", { confidence: 0.65, depthLayer: rawData.estimatedLayers }],
    ["highlight-zone", { confidence: 0.7 }],
  ];

  rawData.boundingBoxes.forEach((box, i) => {
    try {
      const kind: DecompositionArtifactKind = "reusable-layer";
      const artifact = buildArtifact(sourceAssetId, jobId, kind, i, {
        confidence: 0.8,
        boundingBox: box,
        materialHints: [box.label, ...rawData.materialHints],
        depthLayer: i,
        isAnimatable: rawData.hasMotion,
      });
      if (artifact) artifacts.push(artifact);
    } catch (err) {
      errors.push(`bbox[${i}]: ${err instanceof Error ? err.message : "unknown"}`);
    }
  });

  artifactSpecs.forEach(([kind, opts], i) => {
    try {
      const artifact = buildArtifact(sourceAssetId, jobId, kind, rawData.boundingBoxes.length + i, {
        ...opts as object,
      });
      if (artifact) artifacts.push(artifact);
    } catch (err) {
      errors.push(`artifact[${kind}]: ${err instanceof Error ? err.message : "unknown"}`);
    }
  });

  const materialCounts: Record<string, number> = {};
  for (const a of artifacts) {
    if (a.materialTag) materialCounts[a.materialTag] = (materialCounts[a.materialTag] ?? 0) + 1;
  }
  const dominantMaterial = Object.entries(materialCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MaterialTag ?? null;

  const result: DecompositionResult = {
    decompositionId, sourceAssetId, jobId, artifacts,
    maskCount: artifacts.filter(a => a.kind === "mask").length,
    animatableCount: artifacts.filter(a => a.isAnimatable).length,
    skeletalHintCount: artifacts.filter(a => a.kind === "skeletal-hint").length,
    dominantMaterial,
    hasMotionCandidates: artifacts.some(a => a.kind === "motion-segment" || a.kind === "animation-candidate"),
    processingTimeMs: Date.now() - startTime,
    errors,
    decomposedAt: Date.now(),
  };

  decompositionLog.set(decompositionId, result);
  notify(result);
  return result;
}

export function getDecompositionResult(decompositionId: string): DecompositionResult | null {
  return decompositionLog.get(decompositionId) ?? null;
}

export function getDecompositionsByAsset(sourceAssetId: string): DecompositionResult[] {
  return [...decompositionLog.values()].filter(r => r.sourceAssetId === sourceAssetId);
}

export function subscribeToDecomposition(listener: DecompositionListener): () => void {
  decompositionListeners.add(listener);
  return () => decompositionListeners.delete(listener);
}

export function getDecompositionStats(): {
  totalDecompositions: number;
  totalArtifacts: number;
  totalAnimatable: number;
  totalErrors: number;
  avgProcessingMs: number;
} {
  let totalArtifacts = 0, totalAnimatable = 0, totalErrors = 0, totalMs = 0;
  for (const r of decompositionLog.values()) {
    totalArtifacts += r.artifacts.length;
    totalAnimatable += r.animatableCount;
    totalErrors += r.errors.length;
    totalMs += r.processingTimeMs;
  }
  const n = decompositionLog.size;
  return { totalDecompositions: n, totalArtifacts, totalAnimatable, totalErrors, avgProcessingMs: n ? totalMs / n : 0 };
}
