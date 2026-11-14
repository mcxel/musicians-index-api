export const dynamic = "force-dynamic";

/**
 * POST /api/beats/submit
 *
 * Canonical Beat Submission Route.
 * Reconciled via BeatIngestionAuthority (Batch 1 Convergence).
 * Accepts multipart/form-data and application/json from all authorized producer/performer roles.
 */

import { ingestBeatSubmission } from "@/lib/beats/BeatIngestionAuthority";

export async function POST(req: Request) {
  return ingestBeatSubmission(req);
}
