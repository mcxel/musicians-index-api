/**
 * AssetIngestionGateway — Stage A
 * Universal entry point for ALL assets entering the TMI ecosystem.
 * Every imported asset (image, PDF, render, sprite, etc.) passes through here.
 * Assigns UUID, ownership, lineage, reconstruction eligibility, and authority claim.
 * Then dispatches to VisionAuthorityBridge for decomposition.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { submitVisionJob } from "@/lib/vision/VisionAuthorityBridge";
import type { VisionJobType } from "@/lib/vision/VisionAuthorityBridge";

export type AssetFileType =
  | "png" | "jpg" | "webp" | "psd" | "svg" | "pdf"
  | "sprite-sheet" | "texture-atlas" | "layered-render"
  | "motion-still" | "host-render" | "performer-render"
  | "environment-screenshot" | "nft-preview" | "ui-capture"
  | "ticket-graphic" | "billboard-image" | "sponsor-graphic"
  | "fan-upload" | "avatar-sheet" | "magazine-spread"
  | "unknown";

export type AssetOwnerClass =
  | "platform" | "performer" | "host" | "sponsor" | "fan"
  | "venue" | "magazine" | "nft-creator" | "advertiser" | "system";

export type ReconstructionEligibility =
  | "full"      // can be fully decomposed and reconstructed
  | "partial"   // some layers reconstructable
  | "reference" // source-only, not decomposable
  | "unknown";

export interface IngestedAsset {
  ingestId: string;
  assetId: string;
  fileType: AssetFileType;
  sourcePath: string;
  sourceUri: string;
  ownerId: string;
  ownerClass: AssetOwnerClass;
  displayName: string;
  fileSize: number | null;
  mimeType: string | null;
  reconstructionEligibility: ReconstructionEligibility;
  visionJobId: string | null;
  ingestedAt: number;
  authorityGranted: boolean;
  pipelineStage: "ingested" | "decomposing" | "reconstructing" | "bound" | "routed" | "complete" | "failed";
  metadata: Record<string, unknown>;
}

export type IngestionListener = (asset: IngestedAsset) => void;

const FILE_TYPE_JOB_MAP: Partial<Record<AssetFileType, VisionJobType>> = {
  "png":                   "png-decompose",
  "jpg":                   "jpg-decompose",
  "webp":                  "webp-decompose",
  "psd":                   "psd-decompose",
  "svg":                   "svg-decompose",
  "pdf":                   "pdf-decompose",
  "sprite-sheet":          "sprite-decompose",
  "texture-atlas":         "texture-atlas-parse",
  "host-render":           "host-render-parse",
  "performer-render":      "performer-portrait",
  "environment-screenshot":"background-env-parse",
  "nft-preview":           "nft-preview-parse",
  "ui-capture":            "ui-capture-parse",
  "avatar-sheet":          "avatar-scan",
  "billboard-image":       "billboard-detect",
  "magazine-spread":       "magazine-layout",
  "unknown":               "universal-ingest",
};

const RECONSTRUCTABLE_TYPES = new Set<AssetFileType>([
  "png", "jpg", "webp", "psd", "sprite-sheet", "texture-atlas",
  "layered-render", "host-render", "performer-render", "avatar-sheet",
]);

const ingestionLog = new Map<string, IngestedAsset>();
const ingestionListeners = new Set<IngestionListener>();

function notify(asset: IngestedAsset): void {
  ingestionListeners.forEach(l => l(asset));
}

function deriveEligibility(fileType: AssetFileType): ReconstructionEligibility {
  if (RECONSTRUCTABLE_TYPES.has(fileType)) return "full";
  if (fileType === "svg" || fileType === "pdf" || fileType === "magazine-spread") return "partial";
  if (fileType === "motion-still" || fileType === "ui-capture") return "partial";
  return "reference";
}

export function ingestAsset(
  sourcePath: string,
  sourceUri: string,
  fileType: AssetFileType,
  ownerId: string,
  ownerClass: AssetOwnerClass,
  opts: {
    displayName?: string;
    fileSize?: number;
    mimeType?: string;
    priority?: "critical" | "high" | "normal" | "deferred";
    metadata?: Record<string, unknown>;
  } = {}
): IngestedAsset {
  const ingestId = `ingest_${ownerId}_${fileType}_${Date.now()}`;
  const assetId = `ingested_${ingestId}`;
  const displayName = opts.displayName ?? sourcePath.split("/").pop() ?? "unknown";
  const eligibility = deriveEligibility(fileType);

  registerAsset(assetId, "overlay", ownerId, {
    generatorId: "AssetIngestionGateway",
    recoveryEligible: eligibility !== "reference",
    metadata: {
      ingestId, fileType, sourcePath, ownerClass, displayName,
      reconstructionEligibility: eligibility,
    },
    tags: ["ingested", fileType, ownerClass, ownerId],
  });

  const claim = claimAuthority(assetId, "AssetIngestionGateway", "generator", {
    exclusive: true, priority: 5, ttlMs: 5 * 60 * 1000,
  });

  if (claim.granted) {
    setHydrationStatus(assetId, "hydrating");
    recordLineage(assetId, "user-upload", "AssetIngestionGateway", {
      reconstructable: eligibility === "full" || eligibility === "partial",
      metadata: { sourcePath, fileType, ownerClass, ownerId },
    });
  }

  // Submit vision job for decomposition
  const jobType = FILE_TYPE_JOB_MAP[fileType] ?? "universal-ingest";
  let visionJobId: string | null = null;
  if (claim.granted) {
    const job = submitVisionJob(jobType, sourceUri, ownerId, {
      sourceAssetId: assetId,
      priority: opts.priority ?? "normal",
      metadata: { fileType, ownerClass, displayName, ...opts.metadata },
    });
    visionJobId = job.request.jobId;
    setHydrationStatus(assetId, "hydrated");
  }

  const ingestedAsset: IngestedAsset = {
    ingestId, assetId, fileType, sourcePath, sourceUri,
    ownerId, ownerClass, displayName,
    fileSize: opts.fileSize ?? null,
    mimeType: opts.mimeType ?? null,
    reconstructionEligibility: eligibility,
    visionJobId,
    ingestedAt: Date.now(),
    authorityGranted: claim.granted,
    pipelineStage: claim.granted ? "decomposing" : "failed",
    metadata: opts.metadata ?? {},
  };

  ingestionLog.set(ingestId, ingestedAsset);
  notify(ingestedAsset);
  return ingestedAsset;
}

export function updateIngestionStage(
  ingestId: string,
  stage: IngestedAsset["pipelineStage"]
): IngestedAsset | null {
  const asset = ingestionLog.get(ingestId);
  if (!asset) return null;
  const updated = { ...asset, pipelineStage: stage };
  ingestionLog.set(ingestId, updated);
  notify(updated);
  return updated;
}

export function getIngestedAsset(ingestId: string): IngestedAsset | null {
  return ingestionLog.get(ingestId) ?? null;
}

export function getIngestionsByOwner(ownerId: string): IngestedAsset[] {
  return [...ingestionLog.values()].filter(a => a.ownerId === ownerId);
}

export function getIngestionsByType(fileType: AssetFileType): IngestedAsset[] {
  return [...ingestionLog.values()].filter(a => a.fileType === fileType);
}

export function subscribeToIngestion(listener: IngestionListener): () => void {
  ingestionListeners.add(listener);
  return () => ingestionListeners.delete(listener);
}

export function getIngestionStats(): {
  total: number;
  byStage: Record<IngestedAsset["pipelineStage"], number>;
  byType: Record<string, number>;
  authorityDenied: number;
  reconstructableCount: number;
} {
  const byStage: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let authorityDenied = 0, reconstructableCount = 0;

  for (const a of ingestionLog.values()) {
    byStage[a.pipelineStage] = (byStage[a.pipelineStage] ?? 0) + 1;
    byType[a.fileType] = (byType[a.fileType] ?? 0) + 1;
    if (!a.authorityGranted) authorityDenied++;
    if (a.reconstructionEligibility === "full") reconstructableCount++;
  }

  return {
    total: ingestionLog.size,
    byStage: byStage as Record<IngestedAsset["pipelineStage"], number>,
    byType,
    authorityDenied,
    reconstructableCount,
  };
}
