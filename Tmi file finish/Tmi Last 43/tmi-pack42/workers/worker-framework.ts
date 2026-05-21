// apps/workers/src/worker-framework.ts
// Base worker class for all background jobs.
// Workers run outside the API server in separate processes.
// Queue system: BullMQ + Redis

import { Queue, Worker, Job, QueueEvents } from "bullmq";

// ── ALL QUEUE NAMES ────────────────────────────────────
export const QUEUE_NAMES = {
  MEDIA:         "tmi:media",           // image resize, video transcode
  EMAIL:         "tmi:email",           // email sending
  PUSH:          "tmi:push",            // push notifications
  POINTS:        "tmi:points",          // point calculations (bulk)
  ANALYTICS:     "tmi:analytics",       // event ingestion
  BOTS:          "tmi:bots",            // bot task scheduling
  NOTIFICATIONS: "tmi:notifications",   // notification dispatch
  SEARCH_INDEX:  "tmi:search",          // search index updates
  MODERATION:    "tmi:moderation",      // content review queue
  PAYOUTS:       "tmi:payouts",         // payout processing (Big Ace reviews)
  CLIPS:         "tmi:clips",           // highlight clip generation
  ARCHIVE:       "tmi:archive",         // weekly snapshots
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

// ── REDIS CONNECTION ──────────────────────────────────
export const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || "redispassword",
};

// ── BASE JOB TYPES ────────────────────────────────────
export interface BaseJobData {
  jobId: string;
  createdAt: string;
  retryCount?: number;
  priority?: number;
}

// MEDIA WORKER JOBS
export interface MediaTranscodeJob extends BaseJobData {
  type: "VIDEO_TRANSCODE" | "IMAGE_RESIZE" | "AUDIO_ENCODE" | "THUMBNAIL" | "MOTION_CLIP";
  uploadId: string;
  userId: string;
  sourcePath: string;
  outputFormats: string[];
  options?: Record<string, unknown>;
}

// EMAIL WORKER JOBS
export interface EmailJob extends BaseJobData {
  type: "WELCOME" | "TICKET_CONFIRMED" | "PAYOUT_APPROVED" | "SPONSOR_RENEWAL" | "WEEKLY_DIGEST" | "PASSWORD_RESET" | "VERIFY_EMAIL" | "CROWN_WON" | "LIVE_ALERT";
  to: string;
  subject: string;
  templateData: Record<string, unknown>;
}

// PUSH NOTIFICATION JOBS
export interface PushJob extends BaseJobData {
  type: "IN_APP" | "FCM" | "WEB_PUSH" | "APNS";
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionUrl?: string;
}

// ANALYTICS JOBS
export interface AnalyticsJob extends BaseJobData {
  type: "PAGE_VIEW" | "CLICK" | "IMPRESSION" | "PURCHASE" | "STREAM_START" | "STREAM_END" | "VOTE" | "GAME_EVENT" | "REWARD_EARNED";
  userId?: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  properties: Record<string, unknown>;
}

// BOT TASK JOBS
export interface BotTaskJob extends BaseJobData {
  botId: string;
  taskType: string;
  payload: Record<string, unknown>;
  scheduleId?: string;
}

// PAYOUT JOBS (Big Ace review required)
export interface PayoutJob extends BaseJobData {
  type: "ARTIST_PAYOUT" | "OWNER_DISTRIBUTION" | "REFUND_PROCESS";
  recipientId: string;
  amountCents: number;
  requiresBigAceApproval: true;  // ALWAYS true — Platform Law #5
  approvedByBigAce: boolean;
  stripeConnectId?: string;
  paypalEmail?: string;
}

// CLIP GENERATION JOBS
export interface ClipJob extends BaseJobData {
  type: "HIGHLIGHT_CLIP" | "REPLAY_PACKAGE" | "MOMENT_CAPTURE";
  livestreamId: string;
  startSeconds: number;
  endSeconds: number;
  title?: string;
}

// ── BASE WORKER CLASS ─────────────────────────────────
export abstract class BaseWorker<T extends BaseJobData> {
  protected queue: Queue;
  protected worker: Worker;
  abstract queueName: QueueName;
  abstract concurrency: number;

  async init(): Promise<void> {
    this.queue = new Queue(this.queueName, { connection: REDIS_CONNECTION });
    this.worker = new Worker(this.queueName, async (job: Job<T>) => {
      const start = Date.now();
      try {
        await this.process(job.data);
        console.log(`[${this.queueName}] ✓ ${job.name} in ${Date.now()-start}ms`);
      } catch (err) {
        console.error(`[${this.queueName}] ✗ ${job.name}:`, err);
        throw err; // BullMQ handles retry
      }
    }, { connection: REDIS_CONNECTION, concurrency: this.concurrency });
  }

  abstract process(data: T): Promise<void>;

  async add(name: string, data: T, opts?: { delay?: number; priority?: number }): Promise<void> {
    await this.queue.add(name, data, {
      delay: opts?.delay,
      priority: opts?.priority,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    });
  }
}

// ── WORKER PROCESS ENTRIES ────────────────────────────
// Each worker runs as a separate process:
// node dist/workers/media.worker.js
// node dist/workers/email.worker.js
// node dist/workers/push.worker.js
// node dist/workers/analytics.worker.js
// node dist/workers/bots.worker.js
// node dist/workers/payouts.worker.js
// node dist/workers/clips.worker.js
// node dist/workers/moderation.worker.js
