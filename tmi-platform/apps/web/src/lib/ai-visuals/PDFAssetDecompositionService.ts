/**
 * PDFAssetDecompositionService
 * TypeScript coordination layer for PDF-to-asset decomposition jobs.
 * Schedules work for the Python pipeline in apps/asset-reconstruction/.
 * No direct PDF parsing — this layer creates and tracks job metadata.
 */

export type DecompositionTarget =
  | "artist-portrait"
  | "wardrobe"
  | "prop"
  | "environment"
  | "avatar-pose"
  | "expression"
  | "voice-identity";

export type DecompositionStatus = "scheduled" | "processing" | "complete" | "failed" | "cancelled";

export interface DecompositionJob {
  jobId: string;
  pdfPath: string;
  targets: DecompositionTarget[];
  entityId: string;
  entityType: "artist" | "host" | "avatar" | "venue";
  status: DecompositionStatus;
  scheduledAt: number;
  startedAt: number | null;
  completedAt: number | null;
  outputPaths: string[];
  failureReason: string | null;
  extractedAssetCount: number;
}

const jobStore = new Map<string, DecompositionJob>();
let jobSeq = 0;

function nextJobId(): string {
  return `pdf-decomp-${Date.now()}-${(jobSeq++).toString(36)}`;
}

const TARGET_SCRIPTS: Record<DecompositionTarget, string> = {
  "artist-portrait":  "host_face_scanner.py",
  "wardrobe":         "wardrobe_extractor.py",
  "prop":             "prop_extractor.py",
  "environment":      "environment_piece_extractor.py",
  "avatar-pose":      "avatar_pose_library.py",
  "expression":       "avatar_expression_library.py",
  "voice-identity":   "host_voice_identity_mapper.py",
};

export function scheduleDecomposition(input: {
  pdfPath: string;
  entityId: string;
  entityType: DecompositionJob["entityType"];
  targets: DecompositionTarget[];
}): DecompositionJob {
  const job: DecompositionJob = {
    jobId: nextJobId(),
    pdfPath: input.pdfPath,
    targets: input.targets,
    entityId: input.entityId,
    entityType: input.entityType,
    status: "scheduled",
    scheduledAt: Date.now(),
    startedAt: null,
    completedAt: null,
    outputPaths: [],
    failureReason: null,
    extractedAssetCount: 0,
  };

  jobStore.set(job.jobId, job);
  return job;
}

export function getDecompositionScripts(targets: DecompositionTarget[]): string[] {
  return targets.map(t => TARGET_SCRIPTS[t]).filter(Boolean);
}

export function markJobStarted(jobId: string): DecompositionJob | null {
  const job = jobStore.get(jobId);
  if (!job) return null;
  job.status = "processing";
  job.startedAt = Date.now();
  return job;
}

export function markJobComplete(jobId: string, outputPaths: string[], extractedCount: number): DecompositionJob | null {
  const job = jobStore.get(jobId);
  if (!job) return null;
  job.status = "complete";
  job.completedAt = Date.now();
  job.outputPaths = outputPaths;
  job.extractedAssetCount = extractedCount;
  return job;
}

export function markJobFailed(jobId: string, reason: string): DecompositionJob | null {
  const job = jobStore.get(jobId);
  if (!job) return null;
  job.status = "failed";
  job.failureReason = reason;
  job.completedAt = Date.now();
  return job;
}

export function getJobStatus(jobId: string): DecompositionJob | null {
  return jobStore.get(jobId) ?? null;
}

export function getJobsByEntity(entityId: string): DecompositionJob[] {
  return [...jobStore.values()].filter(j => j.entityId === entityId);
}

export function getPipelineMetrics(): Record<DecompositionStatus, number> & { total: number } {
  const counts: Record<DecompositionStatus, number> & { total: number } = {
    scheduled: 0, processing: 0, complete: 0, failed: 0, cancelled: 0, total: 0,
  };
  for (const j of jobStore.values()) {
    counts[j.status]++;
    counts.total++;
  }
  return counts;
}
