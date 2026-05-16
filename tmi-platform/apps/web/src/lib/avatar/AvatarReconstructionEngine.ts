/**
 * AvatarReconstructionEngine
 * Rebuilds a fully hydrated avatar from metadata fragments.
 * Coordinates skeletal data, clothing layers, accessories, expression base, and motion rig.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { addDependency } from "@/lib/registry/HydrationDependencyGraph";
import { getFragments, hasCompleteIdentity } from "@/lib/avatar/IdentityFragmentRegistry";

export type ReconstructionQuality = "full" | "reduced" | "silhouette" | "placeholder";

export interface AvatarReconstructionSpec {
  entityId: string;
  entityType: "avatar" | "host" | "performer" | "npc";
  displayName: string;
  targetQuality: ReconstructionQuality;
  includeMotionRig: boolean;
  includeExpressions: boolean;
  includeAccessories: boolean;
  backgroundVariant: string | null;
  lightingPreset: string | null;
}

export interface ReconstructedAvatar {
  reconstructionId: string;
  entityId: string;
  quality: ReconstructionQuality;
  fragments: string[];          // fragmentIds used
  assetId: string;              // registered asset ID
  reconstructedAt: number;
  complete: boolean;
  missingFragments: string[];
  metadata: Record<string, unknown>;
}

export type ReconstructionStatus = "queued" | "reconstructing" | "complete" | "degraded" | "failed";

export interface ReconstructionJob {
  jobId: string;
  spec: AvatarReconstructionSpec;
  status: ReconstructionStatus;
  startedAt: number;
  completedAt: number | null;
  result: ReconstructedAvatar | null;
  error: string | null;
}

const jobs = new Map<string, ReconstructionJob>();
const reconstructions = new Map<string, ReconstructedAvatar>();
type ReconstructionListener = (job: ReconstructionJob) => void;
const listeners = new Set<ReconstructionListener>();
const MAX_JOBS = 200;

function notify(job: ReconstructionJob): void {
  listeners.forEach(l => l(job));
}

export function queueReconstruction(spec: AvatarReconstructionSpec): ReconstructionJob {
  if (jobs.size >= MAX_JOBS) {
    const oldest = [...jobs.values()].filter(j => j.status === "complete" || j.status === "failed")[0];
    if (oldest) jobs.delete(oldest.jobId);
  }

  const jobId = `recon_${spec.entityId}_${Date.now()}`;
  const job: ReconstructionJob = {
    jobId, spec, status: "queued", startedAt: Date.now(), completedAt: null, result: null, error: null,
  };
  jobs.set(jobId, job);
  notify(job);

  void processReconstruction(jobId);
  return job;
}

async function processReconstruction(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  const running: ReconstructionJob = { ...job, status: "reconstructing" };
  jobs.set(jobId, running);
  notify(running);

  const { spec } = running;
  const assetId = `avatar_asset_${spec.entityId}`;

  registerAsset(assetId, "avatar", spec.entityId, {
    generatorId: "AvatarReconstructionEngine",
    motionCompatible: spec.includeMotionRig,
    metadata: { entityId: spec.entityId, quality: spec.targetQuality },
    tags: [spec.entityType, spec.targetQuality],
  });

  const claim = claimAuthority(assetId, "AvatarReconstructionEngine", "generator", {
    exclusive: true, priority: 4, ttlMs: 30_000,
  });

  if (!claim.granted) {
    const failed: ReconstructionJob = { ...running, status: "failed", error: claim.reason ?? "Authority denied", completedAt: Date.now() };
    jobs.set(jobId, failed);
    notify(failed);
    return;
  }

  setHydrationStatus(assetId, "hydrating");

  const fragments = getFragments(spec.entityId);
  const usedFragments = fragments.map(f => f.fragmentId);
  const hasAll = hasCompleteIdentity(spec.entityId);
  const missingFragments: string[] = [];

  if (!hasAll) {
    if (!fragments.find(f => f.fragmentType === "face")) missingFragments.push("face");
    if (!fragments.find(f => f.fragmentType === "body-skeleton")) missingFragments.push("body-skeleton");
    if (!fragments.find(f => f.fragmentType === "expression-base")) missingFragments.push("expression-base");
  }

  // Register dependency edges
  usedFragments.forEach(fragId => addDependency(assetId, fragId, true, 8));

  recordLineage(assetId, "runtime-reconstruction", "AvatarReconstructionEngine", {
    ancestorIds: usedFragments,
    transforms: spec.includeMotionRig ? ["animate", "blend"] : ["blend"],
    reconstructable: true,
    reconstructionInstructions: JSON.stringify(spec),
    metadata: { quality: spec.targetQuality, fragmentCount: usedFragments.length },
  });

  const quality = missingFragments.length > 0 && spec.targetQuality === "full"
    ? "reduced" : spec.targetQuality;

  const result: ReconstructedAvatar = {
    reconstructionId: jobId,
    entityId: spec.entityId,
    quality,
    fragments: usedFragments,
    assetId,
    reconstructedAt: Date.now(),
    complete: missingFragments.length === 0,
    missingFragments,
    metadata: { displayName: spec.displayName, lightingPreset: spec.lightingPreset },
  };

  setHydrationStatus(assetId, missingFragments.length === 0 ? "hydrated" : "degraded");
  reconstructions.set(spec.entityId, result);

  const done: ReconstructionJob = { ...running, status: missingFragments.length === 0 ? "complete" : "degraded", completedAt: Date.now(), result };
  jobs.set(jobId, done);
  notify(done);
}

export function getReconstruction(entityId: string): ReconstructedAvatar | null {
  return reconstructions.get(entityId) ?? null;
}

export function getJob(jobId: string): ReconstructionJob | null {
  return jobs.get(jobId) ?? null;
}

export function subscribeToReconstruction(listener: ReconstructionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getReconstructionStats(): { total: number; complete: number; degraded: number; failed: number } {
  let complete = 0, degraded = 0, failed = 0;
  for (const j of jobs.values()) {
    if (j.status === "complete") complete++;
    else if (j.status === "degraded") degraded++;
    else if (j.status === "failed") failed++;
  }
  return { total: jobs.size, complete, degraded, failed };
}
