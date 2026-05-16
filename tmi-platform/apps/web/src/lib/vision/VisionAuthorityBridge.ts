/**
 * VisionAuthorityBridge
 * TypeScript authority layer over the Python AI Vision microservice.
 * All vision scan jobs must pass through here — no direct Python calls from pages.
 * Pipeline: request → authority claim → job queue → Python → metadata → registry
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";

export type VisionJobType =
  // Core scan types
  | "avatar-scan" | "venue-scene-scan" | "pdf-decompose"
  | "performer-portrait" | "magazine-layout" | "prop-extract"
  | "billboard-detect" | "crowd-density-map" | "motion-capture"
  // Phase 7 — pipeline stages
  | "universal-ingest" | "layer-isolate" | "mask-extract"
  | "material-tag" | "skeletal-hint" | "clothing-segment"
  | "environment-parse" | "reconstruction-build" | "authority-bind"
  | "generator-route" | "validation-run"
  // Phase 8 — file type decomposition
  | "png-decompose" | "jpg-decompose" | "webp-decompose"
  | "psd-decompose" | "svg-decompose" | "sprite-decompose"
  | "texture-atlas-parse" | "host-render-parse" | "nft-preview-parse"
  | "ui-capture-parse" | "background-env-parse";

export type VisionJobStatus = "pending" | "claimed" | "dispatched" | "processing" | "complete" | "failed" | "timeout";

export interface VisionScanRequest {
  jobId: string;
  jobType: VisionJobType;
  sourceAssetId: string;         // asset to scan (PDF id, image id, video id)
  sourceUri: string;             // path or URL passed to Python
  entityId: string;              // what entity this scan is for
  priority: "critical" | "high" | "normal" | "deferred";
  requestedAt: number;
  ttlMs: number;
  metadata: Record<string, unknown>;
}

export interface VisionJobRecord {
  request: VisionScanRequest;
  status: VisionJobStatus;
  startedAt: number | null;
  completedAt: number | null;
  outputAssetId: string | null;
  errorMessage: string | null;
  retryCount: number;
}

const MAX_JOBS = 500;
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_RETRIES = 2;

const visionJobs = new Map<string, VisionJobRecord>();
type VisionListener = (record: VisionJobRecord) => void;
const visionListeners = new Set<VisionListener>();

function notify(record: VisionJobRecord): void {
  visionListeners.forEach(l => l(record));
}

function purgeOldJobs(): void {
  if (visionJobs.size < MAX_JOBS) return;
  const now = Date.now();
  for (const [id, job] of visionJobs) {
    if (job.status === "complete" || job.status === "failed") {
      if (now - (job.completedAt ?? 0) > 10 * 60 * 1000) {
        visionJobs.delete(id);
        if (visionJobs.size < MAX_JOBS * 0.8) break;
      }
    }
  }
}

export function submitVisionJob(
  jobType: VisionJobType,
  sourceUri: string,
  entityId: string,
  opts: {
    sourceAssetId?: string;
    priority?: VisionScanRequest["priority"];
    ttlMs?: number;
    metadata?: Record<string, unknown>;
  } = {}
): VisionJobRecord {
  purgeOldJobs();

  const jobId = `vision_${jobType}_${entityId}_${Date.now()}`;
  const request: VisionScanRequest = {
    jobId, jobType, sourceUri, entityId,
    sourceAssetId: opts.sourceAssetId ?? entityId,
    priority: opts.priority ?? "normal",
    requestedAt: Date.now(),
    ttlMs: opts.ttlMs ?? DEFAULT_TTL_MS,
    metadata: opts.metadata ?? {},
  };

  const outputAssetId = `vision_output_${jobId}`;
  registerAsset(outputAssetId, "overlay", entityId, {
    generatorId: "VisionAuthorityBridge",
    metadata: { jobType, sourceUri },
    tags: ["vision", jobType],
  });

  const claim = claimAuthority(outputAssetId, "VisionAuthorityBridge", "generator", {
    exclusive: true, priority: 4, ttlMs: request.ttlMs,
  });

  const record: VisionJobRecord = {
    request, status: claim.granted ? "claimed" : "failed",
    startedAt: null, completedAt: null,
    outputAssetId: claim.granted ? outputAssetId : null,
    errorMessage: claim.granted ? null : (claim.reason ?? "Authority denied"),
    retryCount: 0,
  };

  visionJobs.set(jobId, record);
  notify(record);

  if (claim.granted) void dispatchToPython(jobId);
  return record;
}

async function dispatchToPython(jobId: string): Promise<void> {
  const record = visionJobs.get(jobId);
  if (!record) return;

  const dispatched = { ...record, status: "dispatched" as VisionJobStatus, startedAt: Date.now() };
  visionJobs.set(jobId, dispatched);
  notify(dispatched);

  try {
    // In production this calls the Python microservice at API_BASE_URL/vision/scan
    // For now, simulate processing by registering the output asset
    const processing = { ...dispatched, status: "processing" as VisionJobStatus };
    visionJobs.set(jobId, processing);
    notify(processing);

    if (record.outputAssetId) {
      setHydrationStatus(record.outputAssetId, "hydrating");
      recordLineage(record.outputAssetId, "vision-scan", "VisionAuthorityBridge", {
        parentAssetId: record.request.sourceAssetId,
        transforms: ["segment"],
        reconstructable: false,
        metadata: { jobType: record.request.jobType, entityId: record.request.entityId },
      });
      setHydrationStatus(record.outputAssetId, "hydrated");
    }

    const complete = { ...processing, status: "complete" as VisionJobStatus, completedAt: Date.now() };
    visionJobs.set(jobId, complete);
    notify(complete);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    const failed = { ...dispatched, status: "failed" as VisionJobStatus, completedAt: Date.now(), errorMessage: errMsg };
    visionJobs.set(jobId, failed);
    if (record.outputAssetId) setHydrationStatus(record.outputAssetId, "failed");
    notify(failed);
  }
}

export function retryVisionJob(jobId: string): VisionJobRecord | null {
  const record = visionJobs.get(jobId);
  if (!record || record.status !== "failed" || record.retryCount >= MAX_RETRIES) return null;
  const retrying = { ...record, status: "pending" as VisionJobStatus, retryCount: record.retryCount + 1, errorMessage: null };
  visionJobs.set(jobId, retrying);
  notify(retrying);
  void dispatchToPython(jobId);
  return retrying;
}

export function getVisionJob(jobId: string): VisionJobRecord | null {
  return visionJobs.get(jobId) ?? null;
}

export function getVisionJobsByEntity(entityId: string): VisionJobRecord[] {
  return [...visionJobs.values()].filter(r => r.request.entityId === entityId);
}

export function subscribeToVisionBridge(listener: VisionListener): () => void {
  visionListeners.add(listener);
  return () => visionListeners.delete(listener);
}

export function getVisionBridgeStats(): { total: number; pending: number; complete: number; failed: number } {
  let pending = 0, complete = 0, failed = 0;
  for (const r of visionJobs.values()) {
    if (r.status === "pending" || r.status === "claimed" || r.status === "dispatched" || r.status === "processing") pending++;
    else if (r.status === "complete") complete++;
    else if (r.status === "failed") failed++;
  }
  return { total: visionJobs.size, pending, complete, failed };
}
