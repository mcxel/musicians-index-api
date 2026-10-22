export const dynamic = "force-dynamic";

/**
 * POST /api/beats/locker-submit
 *
 * Compact Beat Locker Submission Route for Performers & Producers.
 * Reconciled via BeatIngestionAuthority (Batch 1 Convergence).
 * Maintains exact backward-compatibility with all frontend callers.
 */

import { ingestBeatSubmission } from "@/lib/beats/BeatIngestionAuthority";

export async function POST(req: Request) {
  return ingestBeatSubmission(req);
}
