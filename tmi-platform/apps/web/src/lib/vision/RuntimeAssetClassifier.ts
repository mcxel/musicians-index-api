/**
 * RuntimeAssetClassifier
 * Classifies raw vision scan entities into typed AssetKind records and
 * registers them with full authority + lineage in the registry ecosystem.
 */

import { registerAsset, setHydrationStatus, type AssetKind } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import type { DetectedEntity, EntityClass, VisionScanOutput } from "@/lib/vision/VisionMetadataOrchestrator";

export interface ClassifiedAsset {
  assetId: string;
  kind: AssetKind;
  entityClass: EntityClass;
  confidence: number;
  authorityGranted: boolean;
  registeredAt: number;
}

export interface ClassificationResult {
  jobId: string;
  sourceAssetId: string;
  classified: ClassifiedAsset[];
  unclassified: string[];
  errors: string[];
  classifiedAt: number;
}

const ENTITY_TO_KIND: Partial<Record<EntityClass, AssetKind>> = {
  "avatar":          "avatar",
  "person":          "performer-portrait",
  "venue":           "venue-surface",
  "stage-element":   "stage-element",
  "billboard":       "billboard",
  "magazine-panel":  "magazine-panel",
  "prop":            "venue-prop",
  "crowd":           "venue-surface",
  "text":            "overlay",
};

const CLASSIFIER_PRIORITY = 3;
const CLASSIFIER_TTL_MS = 15_000;

const classificationLog = new Map<string, ClassificationResult>();

function buildAssetId(jobId: string, entityClass: EntityClass, index: number): string {
  return `classified_${entityClass}_${jobId}_${index}`;
}

function classifyEntity(
  entity: DetectedEntity,
  output: VisionScanOutput,
  index: number
): ClassifiedAsset | null {
  const kind = ENTITY_TO_KIND[entity.entityClass];
  if (!kind) return null;

  const assetId = buildAssetId(output.jobId, entity.entityClass, index);

  registerAsset(assetId, kind, output.entityId, {
    generatorId: "RuntimeAssetClassifier",
    motionCompatible: entity.entityClass === "avatar" || entity.entityClass === "person",
    recoveryEligible: true,
    metadata: {
      entityClass: entity.entityClass,
      boundingBox: entity.boundingBox,
      confidence: entity.confidence,
      attributes: entity.attributes,
      dominantColor: output.dominantColors[0] ?? null,
    },
    tags: ["vision-classified", entity.entityClass, output.entityId],
  });

  const claim = claimAuthority(assetId, "RuntimeAssetClassifier", "generator", {
    exclusive: false,
    priority: CLASSIFIER_PRIORITY,
    ttlMs: CLASSIFIER_TTL_MS,
  });

  if (claim.granted) {
    setHydrationStatus(assetId, "hydrating");

    recordLineage(assetId, "vision-scan", "RuntimeAssetClassifier", {
      parentAssetId: output.sourceAssetId,
      transforms: ["segment"],
      reconstructable: entity.entityClass !== "crowd" && entity.entityClass !== "text",
      metadata: {
        jobId: output.jobId,
        entityClass: entity.entityClass,
        confidence: entity.confidence,
      },
    });

    setHydrationStatus(assetId, "hydrated");
  }

  return {
    assetId,
    kind,
    entityClass: entity.entityClass,
    confidence: entity.confidence,
    authorityGranted: claim.granted,
    registeredAt: Date.now(),
  };
}

export function classifyScanOutput(output: VisionScanOutput): ClassificationResult {
  const result: ClassificationResult = {
    jobId: output.jobId,
    sourceAssetId: output.sourceAssetId,
    classified: [],
    unclassified: [],
    errors: [],
    classifiedAt: Date.now(),
  };

  output.entities.forEach((entity, i) => {
    try {
      const classified = classifyEntity(entity, output, i);
      if (classified) {
        result.classified.push(classified);
      } else {
        result.unclassified.push(entity.entityClass);
      }
    } catch (err) {
      result.errors.push(
        `${entity.entityClass}[${i}]: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  });

  classificationLog.set(output.jobId, result);
  return result;
}

export function getClassificationResult(jobId: string): ClassificationResult | null {
  return classificationLog.get(jobId) ?? null;
}

export function getClassificationStats(): {
  totalJobs: number;
  totalClassified: number;
  totalUnclassified: number;
  authorityDenied: number;
} {
  let totalClassified = 0, totalUnclassified = 0, authorityDenied = 0;
  for (const r of classificationLog.values()) {
    totalClassified += r.classified.length;
    totalUnclassified += r.unclassified.length;
    authorityDenied += r.classified.filter(c => !c.authorityGranted).length;
  }
  return {
    totalJobs: classificationLog.size,
    totalClassified,
    totalUnclassified,
    authorityDenied,
  };
}

export function getClassifiedByKind(kind: AssetKind): ClassifiedAsset[] {
  const assets: ClassifiedAsset[] = [];
  for (const r of classificationLog.values()) {
    assets.push(...r.classified.filter(c => c.kind === kind));
  }
  return assets;
}
