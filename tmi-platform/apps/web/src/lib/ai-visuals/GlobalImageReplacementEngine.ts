/**
 * GlobalImageReplacementEngine.ts
 *
 * Replaces static stock images with AI-generated, identity-locked, scene-generated, or motion-ready images.
 * Purpose: Transform detected weak/stock images into dynamic, personalized assets.
 */

export interface ImageReplacementJob {
  replacementJobId: string;
  originalImageId: string;
  replacementType: 'ai-generated' | 'identity-locked' | 'scene-generated' | 'motion-ready';
  sourceRoute: string;
  targetSlot: string;
  entityId: string;
  entityType:
    | 'artist'
    | 'performer'
    | 'fan'
    | 'venue'
    | 'event'
    | 'article'
    | 'ticket'
    | 'sponsor'
    | 'advertiser'
    | 'generic';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  generatedImageId?: string;
  queuedAt: number;
  completedAt?: number;
  failureReason?: string;
}

export interface ReplacementSummary {
  totalQueued: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  byType: Record<string, number>;
  byRoute: Record<string, number>;
}

// In-memory registry of replacement jobs (ephemeral)
const replacementJobs = new Map<string, ImageReplacementJob>();
let jobCounter = 0;

/**
 * Queues an image for replacement.
 * Returns job ID without executing replacement.
 */
export function queueImageForReplacement(input: {
  originalImageId: string;
  replacementType: 'ai-generated' | 'identity-locked' | 'scene-generated' | 'motion-ready';
  sourceRoute: string;
  targetSlot: string;
  entityId: string;
  entityType: ImageReplacementJob['entityType'];
}): string {
  const replacementJobId = `img-replace-${jobCounter++}-${Date.now()}`;

  const job: ImageReplacementJob = {
    replacementJobId,
    originalImageId: input.originalImageId,
    replacementType: input.replacementType,
    sourceRoute: input.sourceRoute,
    targetSlot: input.targetSlot,
    entityId: input.entityId,
    entityType: input.entityType,
    status: 'queued',
    queuedAt: Date.now(),
  };

  replacementJobs.set(replacementJobId, job);
  return replacementJobId;
}

/**
 * Marks a replacement job as processing (without actually running generation).
 */
export function markReplacementProcessing(replacementJobId: string): void {
  const job = replacementJobs.get(replacementJobId);
  if (job) {
    job.status = 'processing';
  }
}

/**
 * Marks a replacement job as completed with generated image ID.
 */
export function markReplacementCompleted(replacementJobId: string, generatedImageId: string): void {
  const job = replacementJobs.get(replacementJobId);
  if (job) {
    job.status = 'completed';
    job.generatedImageId = generatedImageId;
    job.completedAt = Date.now();
  }
}

/**
 * Marks a replacement job as failed.
 */
export function markReplacementFailed(replacementJobId: string, failureReason: string): void {
  const job = replacementJobs.get(replacementJobId);
  if (job) {
    job.status = 'failed';
    job.failureReason = failureReason;
    job.completedAt = Date.now();
  }
}

/**
 * Lists all replacement jobs (non-mutating).
 */
export function listAllReplacements(): ImageReplacementJob[] {
  return Array.from(replacementJobs.values());
}

/**
 * Lists queued replacements (waiting to be processed).
 */
export function listQueuedReplacements(): ImageReplacementJob[] {
  return Array.from(replacementJobs.values()).filter((job) => job.status === 'queued');
}

/**
 * Lists replacements by status.
 */
export function listReplacementsByStatus(
  status: ImageReplacementJob['status']
): ImageReplacementJob[] {
  return Array.from(replacementJobs.values()).filter((job) => job.status === status);
}

/**
 * Gets replacement summary (non-mutating).
 */
export function getReplacementSummary(): ReplacementSummary {
  const all = Array.from(replacementJobs.values());

  const byType: Record<string, number> = {};
  const byRoute: Record<string, number> = {};

  all.forEach((job) => {
    byType[job.replacementType] = (byType[job.replacementType] ?? 0) + 1;
    byRoute[job.sourceRoute] = (byRoute[job.sourceRoute] ?? 0) + 1;
  });

  return {
    totalQueued: all.filter((j) => j.status === 'queued').length,
    totalProcessing: all.filter((j) => j.status === 'processing').length,
    totalCompleted: all.filter((j) => j.status === 'completed').length,
    totalFailed: all.filter((j) => j.status === 'failed').length,
    byType,
    byRoute,
  };
}

/**
 * Gets all replacements for a specific route.
 */
export function listReplacementsByRoute(sourceRoute: string): ImageReplacementJob[] {
  return Array.from(replacementJobs.values()).filter((job) => job.sourceRoute === sourceRoute);
}

/**
 * Gets replacement report for admin dashboard.
 */
export function getReplacementReport(): {
  summary: ReplacementSummary;
  queued: ImageReplacementJob[];
  processing: ImageReplacementJob[];
  completed: ImageReplacementJob[];
  failed: ImageReplacementJob[];
} {
  return {
    summary: getReplacementSummary(),
    queued: listReplacementsByStatus('queued'),
    processing: listReplacementsByStatus('processing'),
    completed: listReplacementsByStatus('completed'),
    failed: listReplacementsByStatus('failed'),
  };
}
