/**
 * LogAggregatorSink
 *
 * Server-side persistence layer for engagement events.
 *
 * v1 (current): structured NDJSON to stdout — captured by any log
 *   aggregator (Vercel Logs, CloudWatch, Datadog, Logtail, etc.).
 *   One JSON object per line, prefixed with [engagement] for easy grep.
 *
 * v2 (when DB is ready): swap `writeToLog` with `writeToDatabase`.
 *   The engagement API route imports `sink.write()` — only one file changes.
 *
 * v3 (scale): swap with Redis XADD stream so multiple consumers
 *   (Observatory, Analytics, Notifications) drain independently.
 *
 * Rule 20: only real user-initiated events reach this sink.
 *          No synthetic events. No fake counts. No test data in prod.
 */

export interface EngagementLogEntry {
  ts: string;           // ISO 8601
  action: string;
  contentType: string;
  contentId: string;
  performerId: string;
  source: string | null;
  sessionId: string | null;
  venueId: string | null;
}

// ── v1: stdout NDJSON ─────────────────────────────────────────────────────────

function writeToLog(entry: EngagementLogEntry): void {
  // eslint-disable-next-line no-console
  console.log(`[engagement] ${JSON.stringify(entry)}`);
}

// ── v2 stub: uncomment and fill in when Supabase/Prisma is ready ─────────────

// import prisma from '@/lib/prisma';
// async function writeToDatabase(entry: EngagementLogEntry): Promise<void> {
//   await prisma.engagementEvent.create({
//     data: {
//       action:      entry.action,
//       contentType: entry.contentType,
//       contentId:   entry.contentId,
//       performerId: entry.performerId,
//       source:      entry.source,
//       sessionId:   entry.sessionId,
//       venueId:     entry.venueId,
//       recordedAt:  new Date(entry.ts),
//     },
//   });
// }

// ── v3 stub: uncomment when Redis stream is ready ─────────────────────────────

// import { redis } from '@/lib/redis';
// async function writeToStream(entry: EngagementLogEntry): Promise<void> {
//   await redis.xadd('engagement:events', '*',
//     'payload', JSON.stringify(entry)
//   );
// }

// ── Public API ────────────────────────────────────────────────────────────────

export const LogAggregatorSink = {
  /**
   * Persist one engagement event. Fire-and-forget for the API route.
   * In v1 this is synchronous (console.log). In v2/v3 it becomes async.
   */
  write(entry: EngagementLogEntry): void {
    writeToLog(entry);
  },
};
