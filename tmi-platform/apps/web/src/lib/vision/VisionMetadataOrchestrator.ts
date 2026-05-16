/**
 * VisionMetadataOrchestrator
 * Receives vision scan output and orchestrates metadata into the registry ecosystem.
 * Routes entity metadata to the correct downstream systems.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { registerFragment } from "@/lib/avatar/IdentityFragmentRegistry";

export type EntityClass = "person" | "avatar" | "venue" | "prop" | "text" | "billboard" | "magazine-panel" | "stage-element" | "crowd" | "unknown";

export interface DetectedEntity {
  entityClass: EntityClass;
  confidence: number;
  boundingBox: { x: number; y: number; w: number; h: number };
  attributes: Record<string, string | number | boolean>;
  subEntities: DetectedEntity[];
}

export interface VisionScanOutput {
  jobId: string;
  sourceAssetId: string;
  entityId: string;
  scannedAt: number;
  entities: DetectedEntity[];
  dominantColors: string[];
  estimatedResolution: { w: number; h: number };
  hasMotion: boolean;
  rawMetadata: Record<string, unknown>;
}

export interface OrchestrationResult {
  jobId: string;
  registeredAssets: string[];
  registeredFragments: string[];
  routedTo: string[];
  errors: string[];
}

const orchestrationLog = new Map<string, OrchestrationResult>();

export function orchestrateScanOutput(output: VisionScanOutput): OrchestrationResult {
  const result: OrchestrationResult = {
    jobId: output.jobId,
    registeredAssets: [],
    registeredFragments: [],
    routedTo: [],
    errors: [],
  };

  for (const entity of output.entities) {
    try {
      routeEntity(entity, output, result);
    } catch (err) {
      result.errors.push(`Failed to route ${entity.entityClass}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  // Register the scan output itself as a metadata asset
  const metaAssetId = `vision_meta_${output.jobId}`;
  registerAsset(metaAssetId, "overlay", output.entityId, {
    generatorId: "VisionMetadataOrchestrator",
    metadata: {
      entityCount: output.entities.length,
      dominantColors: output.dominantColors,
      hasMotion: output.hasMotion,
    },
    tags: ["vision-metadata", output.entityId],
  });
  setHydrationStatus(metaAssetId, "hydrated");
  result.registeredAssets.push(metaAssetId);

  recordLineage(metaAssetId, "vision-scan", "VisionMetadataOrchestrator", {
    parentAssetId: output.sourceAssetId,
    transforms: ["segment"],
    metadata: { entityCount: output.entities.length },
  });

  orchestrationLog.set(output.jobId, result);
  return result;
}

function routeEntity(entity: DetectedEntity, output: VisionScanOutput, result: OrchestrationResult): void {
  const { entityId, jobId } = output;

  if (entity.entityClass === "person" || entity.entityClass === "avatar") {
    const fragType = entity.attributes["bodyPart"] === "face" ? "face" as const
      : entity.attributes["bodyPart"] === "body" ? "body-skeleton" as const
      : "expression-base" as const;

    const fragment = registerFragment(entityId, "avatar", fragType, {
      confidence: entity.confidence,
      sourceAssetId: output.sourceAssetId,
      metadata: {
        boundingBox: entity.boundingBox,
        dominantColor: output.dominantColors[0],
      },
    });
    result.registeredFragments.push(fragment.fragmentId);
    result.routedTo.push("IdentityFragmentRegistry");

  } else if (entity.entityClass === "billboard" || entity.entityClass === "magazine-panel") {
    const panelAssetId = `panel_${jobId}_${result.registeredAssets.length}`;
    registerAsset(panelAssetId, "billboard", entityId, {
      generatorId: "VisionMetadataOrchestrator",
      metadata: { boundingBox: entity.boundingBox, confidence: entity.confidence },
      tags: ["billboard", "vision-detected"],
    });
    setHydrationStatus(panelAssetId, "hydrated");
    result.registeredAssets.push(panelAssetId);
    result.routedTo.push("BillboardRegistry");

  } else if (entity.entityClass === "venue" || entity.entityClass === "stage-element") {
    const venueAssetId = `venue_element_${jobId}_${result.registeredAssets.length}`;
    registerAsset(venueAssetId, "venue-surface", entityId, {
      generatorId: "VisionMetadataOrchestrator",
      metadata: { boundingBox: entity.boundingBox, entityClass: entity.entityClass },
      tags: ["venue", "vision-detected"],
    });
    setHydrationStatus(venueAssetId, "hydrated");
    result.registeredAssets.push(venueAssetId);
    result.routedTo.push("VenueRegistry");

  } else if (entity.entityClass === "prop") {
    const propAssetId = `prop_${jobId}_${result.registeredAssets.length}`;
    registerAsset(propAssetId, "venue-prop", entityId, {
      generatorId: "VisionMetadataOrchestrator",
      metadata: { boundingBox: entity.boundingBox },
      tags: ["prop", "vision-detected"],
    });
    setHydrationStatus(propAssetId, "hydrated");
    result.registeredAssets.push(propAssetId);
    result.routedTo.push("PropRegistry");
  }
}

export function getOrchestrationResult(jobId: string): OrchestrationResult | null {
  return orchestrationLog.get(jobId) ?? null;
}

export function getOrchestrationStats(): { total: number; totalAssets: number; totalFragments: number; totalErrors: number } {
  let totalAssets = 0, totalFragments = 0, totalErrors = 0;
  for (const r of orchestrationLog.values()) {
    totalAssets += r.registeredAssets.length;
    totalFragments += r.registeredFragments.length;
    totalErrors += r.errors.length;
  }
  return { total: orchestrationLog.size, totalAssets, totalFragments, totalErrors };
}
