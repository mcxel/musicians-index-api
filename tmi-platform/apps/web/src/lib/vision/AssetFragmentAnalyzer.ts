/**
 * AssetFragmentAnalyzer
 * Decomposes detected entities from vision scans into registerable identity fragments.
 * Works downstream of VisionAuthorityBridge; upstream of IdentityFragmentRegistry.
 */

import { registerFragment, type FragmentType } from "@/lib/avatar/IdentityFragmentRegistry";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import type { DetectedEntity, VisionScanOutput } from "@/lib/vision/VisionMetadataOrchestrator";

export interface FragmentAnalysisResult {
  jobId: string;
  entityId: string;
  fragmentsProduced: string[];
  skipped: string[];
  errors: string[];
  analyzedAt: number;
}

export interface FragmentSpec {
  fragmentType: FragmentType;
  confidence: number;
  attributes: Record<string, string | number | boolean>;
  sourceEntityClass: string;
}

const BODY_PART_FRAGMENT_MAP: Record<string, FragmentType> = {
  face:       "face",
  body:       "body-skeleton",
  hand:       "body-skeleton",
  clothing:   "clothing-layer",
  hair:       "face",
  eyes:       "face",
  expression: "expression-base",
};

const MIN_CONFIDENCE = 0.45;

const analysisLog = new Map<string, FragmentAnalysisResult>();

export function analyzeEntityFragments(
  output: VisionScanOutput,
  entity: DetectedEntity
): FragmentSpec[] {
  const specs: FragmentSpec[] = [];

  if (entity.entityClass !== "person" && entity.entityClass !== "avatar") {
    return specs;
  }

  if (entity.confidence < MIN_CONFIDENCE) return specs;

  const bodyPart = String(entity.attributes["bodyPart"] ?? "");
  const mappedType = bodyPart ? BODY_PART_FRAGMENT_MAP[bodyPart] : null;

  if (mappedType) {
    specs.push({
      fragmentType: mappedType,
      confidence: entity.confidence,
      attributes: { ...entity.attributes, boundingBox: JSON.stringify(entity.boundingBox) },
      sourceEntityClass: entity.entityClass,
    });
  } else {
    // No bodyPart tag — emit expression-base as default
    specs.push({
      fragmentType: "expression-base",
      confidence: entity.confidence * 0.8,
      attributes: { ...entity.attributes },
      sourceEntityClass: entity.entityClass,
    });
  }

  // Sub-entities (e.g., face within a body scan)
  for (const sub of entity.subEntities ?? []) {
    if (sub.confidence >= MIN_CONFIDENCE) {
      const subPart = String(sub.attributes["bodyPart"] ?? "");
      const subType = subPart ? BODY_PART_FRAGMENT_MAP[subPart] : null;
      if (subType) {
        specs.push({
          fragmentType: subType,
          confidence: sub.confidence,
          attributes: { ...sub.attributes },
          sourceEntityClass: sub.entityClass,
        });
      }
    }
  }

  return specs;
}

export function runFragmentAnalysis(output: VisionScanOutput): FragmentAnalysisResult {
  const result: FragmentAnalysisResult = {
    jobId: output.jobId,
    entityId: output.entityId,
    fragmentsProduced: [],
    skipped: [],
    errors: [],
    analyzedAt: Date.now(),
  };

  const personEntities = output.entities.filter(
    e => e.entityClass === "person" || e.entityClass === "avatar"
  );

  for (const entity of personEntities) {
    if (entity.confidence < MIN_CONFIDENCE) {
      result.skipped.push(`${entity.entityClass}@conf=${entity.confidence.toFixed(2)}`);
      continue;
    }

    const specs = analyzeEntityFragments(output, entity);

    for (const spec of specs) {
      try {
        const fragment = registerFragment(output.entityId, "avatar", spec.fragmentType, {
          confidence: spec.confidence,
          sourceAssetId: output.sourceAssetId,
          metadata: {
            dominantColor: output.dominantColors[0] ?? null,
          },
        });

        recordLineage(fragment.fragmentId, "vision-scan", "AssetFragmentAnalyzer", {
          parentAssetId: output.sourceAssetId,
          transforms: ["segment", "fragment"],
          reconstructable: true,
          metadata: { jobId: output.jobId, fragmentType: spec.fragmentType },
        });

        result.fragmentsProduced.push(fragment.fragmentId);
      } catch (err) {
        result.errors.push(
          `Fragment ${spec.fragmentType}: ${err instanceof Error ? err.message : "unknown"}`
        );
      }
    }
  }

  analysisLog.set(output.jobId, result);
  return result;
}

export function getFragmentAnalysisResult(jobId: string): FragmentAnalysisResult | null {
  return analysisLog.get(jobId) ?? null;
}

export function getFragmentAnalysisStats(): {
  totalJobs: number;
  totalFragments: number;
  totalSkipped: number;
  totalErrors: number;
} {
  let totalFragments = 0, totalSkipped = 0, totalErrors = 0;
  for (const r of analysisLog.values()) {
    totalFragments += r.fragmentsProduced.length;
    totalSkipped += r.skipped.length;
    totalErrors += r.errors.length;
  }
  return { totalJobs: analysisLog.size, totalFragments, totalSkipped, totalErrors };
}
