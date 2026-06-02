/**
 * MediaProcessingEngine — Staged job queue for TMI media assets.
 *
 * Stages per asset type:
 *   Audio (song/beat/entry):  upload_received → format_check → normalize → waveform → ready
 *   Video:                    upload_received → format_check → transcode → thumbnail → ready
 *   Image (sponsor/nft):      upload_received → format_check → optimize  → thumbnail → ready
 *
 * In production: replace setTimeout chains with Cloudflare Workers / queued jobs.
 * In soft launch: simulated pipeline with realistic stage durations.
 */

import type { MediaType } from "@/lib/media/MediaAssetEngine";

export type JobStageStatus = "pending" | "running" | "done" | "failed";

export type JobStageName =
  | "upload_received"
  | "format_check"
  | "normalize"
  | "transcode"
  | "thumbnail"
  | "waveform"
  | "optimize"
  | "cdn_push"
  | "ready";

export interface JobStage {
  name: JobStageName;
  label: string;
  status: JobStageStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export type ProcessingJobStatus = "queued" | "running" | "complete" | "failed";

export interface ProcessingJob {
  jobId: string;
  assetId: string;
  ownerId: string;
  assetType: MediaType;
  status: ProcessingJobStatus;
  stages: JobStage[];
  currentStage: JobStageName | null;
  progress: number;     // 0-100
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

// ── Stage pipelines by media category ────────────────────────────────────────
const AUDIO_STAGES: JobStageName[] = ["upload_received", "format_check", "normalize", "waveform", "cdn_push", "ready"];
const VIDEO_STAGES: JobStageName[] = ["upload_received", "format_check", "transcode", "thumbnail", "cdn_push", "ready"];
const IMAGE_STAGES: JobStageName[] = ["upload_received", "format_check", "optimize", "thumbnail", "cdn_push", "ready"];

const STAGE_LABELS: Record<JobStageName, string> = {
  upload_received: "Upload Received",
  format_check:    "Format Validation",
  normalize:       "Audio Normalization",
  transcode:       "Video Transcoding",
  thumbnail:       "Generating Thumbnail",
  waveform:        "Generating Waveform",
  optimize:        "Image Optimization",
  cdn_push:        "Pushing to CDN",
  ready:           "Ready",
};

// Simulated stage durations (ms) — video takes longer
const STAGE_DURATION_MS: Record<JobStageName, number> = {
  upload_received: 200,
  format_check:    400,
  normalize:       800,
  transcode:       2400,
  thumbnail:       600,
  waveform:        700,
  optimize:        500,
  cdn_push:        600,
  ready:           0,
};

function stagesForType(type: MediaType): JobStageName[] {
  if (type === "video" || type === "interview" || type === "livestream" || type === "venue_promo") return VIDEO_STAGES;
  if (type === "sponsor_asset" || type === "nft_asset" || type === "article_media") return IMAGE_STAGES;
  return AUDIO_STAGES;
}

function generateJobId(): string {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── In-memory store ────────────────────────────────────────────────────────
const JOBS = new Map<string, ProcessingJob>();
const ASSET_TO_JOB = new Map<string, string>(); // assetId → jobId

class MediaProcessingEngineClass {
  private static instance: MediaProcessingEngineClass | null = null;
  static getInstance(): MediaProcessingEngineClass {
    if (!this.instance) this.instance = new MediaProcessingEngineClass();
    return this.instance;
  }

  queueJob(assetId: string, ownerId: string, assetType: MediaType): ProcessingJob {
    const jobId = generateJobId();
    const stageNames = stagesForType(assetType);

    const stages: JobStage[] = stageNames.map(name => ({
      name,
      label: STAGE_LABELS[name],
      status: "pending",
    }));

    const job: ProcessingJob = {
      jobId,
      assetId,
      ownerId,
      assetType,
      status: "queued",
      stages,
      currentStage: null,
      progress: 0,
      queuedAt: new Date().toISOString(),
    };

    JOBS.set(jobId, job);
    ASSET_TO_JOB.set(assetId, jobId);

    // Start pipeline asynchronously
    this._runPipeline(jobId);

    return job;
  }

  private _runPipeline(jobId: string): void {
    const job = JOBS.get(jobId);
    if (!job) return;

    const now = new Date().toISOString();
    JOBS.set(jobId, { ...job, status: "running", startedAt: now });

    let cumulativeDelay = 0;
    const stages = job.stages;

    stages.forEach((stage, idx) => {
      const duration = STAGE_DURATION_MS[stage.name];
      const startDelay = cumulativeDelay;
      const endDelay = cumulativeDelay + Math.max(duration, 50);
      cumulativeDelay = endDelay;

      // Mark stage as running
      setTimeout(() => {
        const j = JOBS.get(jobId);
        if (!j || j.status === "failed") return;
        const updatedStages = j.stages.map((s, i) =>
          i === idx ? { ...s, status: "running" as JobStageStatus, startedAt: new Date().toISOString() } : s
        );
        JOBS.set(jobId, {
          ...j,
          currentStage: stage.name,
          stages: updatedStages,
          progress: Math.round((idx / stages.length) * 90),
        });
      }, startDelay);

      // Mark stage as done
      setTimeout(() => {
        const j = JOBS.get(jobId);
        if (!j || j.status === "failed") return;
        const completedAt = new Date().toISOString();
        const updatedStages = j.stages.map((s, i) =>
          i === idx ? { ...s, status: "done" as JobStageStatus, completedAt, durationMs: duration } : s
        );

        // If last stage: mark job complete
        const isLast = idx === stages.length - 1;
        JOBS.set(jobId, {
          ...j,
          stages: updatedStages,
          progress: isLast ? 100 : Math.round(((idx + 1) / stages.length) * 90),
          ...(isLast ? { status: "complete", currentStage: null, completedAt, progress: 100 } : {}),
        });
      }, endDelay);
    });
  }

  getJob(jobId: string): ProcessingJob | null {
    return JOBS.get(jobId) ?? null;
  }

  getJobByAsset(assetId: string): ProcessingJob | null {
    const jobId = ASSET_TO_JOB.get(assetId);
    return jobId ? (JOBS.get(jobId) ?? null) : null;
  }

  getJobsByOwner(ownerId: string): ProcessingJob[] {
    return [...JOBS.values()]
      .filter(j => j.ownerId === ownerId)
      .sort((a, b) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime());
  }

  getQueueStats(): { queued: number; running: number; complete: number; failed: number } {
    const all = [...JOBS.values()];
    return {
      queued:   all.filter(j => j.status === "queued").length,
      running:  all.filter(j => j.status === "running").length,
      complete: all.filter(j => j.status === "complete").length,
      failed:   all.filter(j => j.status === "failed").length,
    };
  }

  markFailed(jobId: string, reason: string): void {
    const j = JOBS.get(jobId);
    if (j) JOBS.set(jobId, { ...j, status: "failed", errorMessage: reason, completedAt: new Date().toISOString() });
  }
}

export const MediaProcessingEngine = MediaProcessingEngineClass.getInstance();
