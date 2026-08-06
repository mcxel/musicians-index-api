export const dynamic = "force-dynamic";

/**
 * POST /api/beats/canonical/[canonicalId]/review
 *
 * Submit a reviewer decision for a beat.
 *
 * Body (JSON):
 *   decision  string  required  APPROVE | APPROVE_WITH_TAGS | NEEDS_REVISION | HOLD | REJECT
 *   reason    string  required  Human-readable justification (auditable)
 *   tagsJson  string  optional  JSON array of editorial tags (APPROVE_WITH_TAGS only)
 *
 * Authorization rules:
 *   - Requires beat_creator or admin role.
 *   - A creator cannot approve/reject their OWN beat (unless admin).
 *   - Only beats in CERTIFIED or IN_REVIEW status may be reviewed.
 *
 * Status transitions on decision:
 *   APPROVE / APPROVE_WITH_TAGS → APPROVED  (beat enters sandbox distribution queue)
 *   NEEDS_REVISION              → NEEDS_REVISION (beat returned to creator)
 *   HOLD                        → IN_REVIEW   (keep in queue, flag for discussion)
 *   REJECT                      → ARCHIVED   (permanently removed from active rotation)
 *
 * Moved 2026-08-05 from /api/beats/[canonicalId]/review — see route.ts
 * in the parent folder for why (Next.js dynamic-segment name collision
 * with /api/beats/[id] was failing the production build).
 */

import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";

const VALID_DECISIONS = new Set([
  "APPROVE",
  "APPROVE_WITH_TAGS",
  "NEEDS_REVISION",
  "HOLD",
  "REJECT",
]);

const REVIEWABLE_STATUSES = new Set(["CERTIFIED", "IN_REVIEW"]);

const STATUS_AFTER_DECISION: Record<string, string> = {
  APPROVE: "APPROVED",
  APPROVE_WITH_TAGS: "APPROVED",
  NEEDS_REVISION: "NEEDS_REVISION",
  HOLD: "IN_REVIEW",
  REJECT: "ARCHIVED",
};

export async function POST(
  req: Request,
  { params }: { params: { canonicalId: string } },
) {
  // 1. Auth
  const auth = await getTmiAuth();
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const role = (auth.user.role ?? "").toLowerCase();
  if (role !== "beat_creator" && role !== "admin") {
    return NextResponse.json({ error: "role_required", requiredRole: "BEAT_CREATOR" }, { status: 403 });
  }

  // 2. Parse body
  let body: { decision?: string; reason?: string; tagsJson?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "invalid_json_body" }, { status: 400 }); }

  const { decision, reason, tagsJson = "[]" } = body;

  if (!decision || !VALID_DECISIONS.has(decision)) {
    return NextResponse.json({
      error: "invalid_decision",
      valid: [...VALID_DECISIONS],
    }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: "reason_required" }, { status: 400 });
  }

  // 3. Load beat
  const { canonicalId } = params;
  const beat = await prisma.beat.findUnique({
    where: { canonicalId },
    select: { id: true, title: true, status: true, producerId: true },
  });
  if (!beat) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // 4. Enforce reviewable status
  if (!REVIEWABLE_STATUSES.has(beat.status)) {
    return NextResponse.json({
      error: "not_reviewable",
      currentStatus: beat.status,
      details: `Beat must be CERTIFIED or IN_REVIEW to be reviewed. Current status: ${beat.status}`,
    }, { status: 422 });
  }

  // 5. Enforce no self-approval (unless admin)
  if (beat.producerId === auth.user.id && role !== "admin") {
    return NextResponse.json({
      error: "self_review_not_permitted",
      details: "Creators cannot approve or reject their own beats. Assign a different reviewer.",
    }, { status: 403 });
  }

  const newStatus = STATUS_AFTER_DECISION[decision]!;

  // 6. Persist review record + status transition + provenance event (transaction)
  const [reviewRecord] = await prisma.$transaction([
    prisma.beatReviewRecord.create({
      data: {
        beatId: beat.id,
        reviewerId: auth.user.id,
        decision,
        reason: reason.trim(),
        tagsJson,
      },
    }),
    prisma.beat.update({
      where: { id: beat.id },
      data: {
        status: newStatus,
        ...(newStatus === "APPROVED" ? { approvedAt: new Date() } : {}),
      },
    }),
    prisma.beatProvenanceEvent.create({
      data: {
        beatId: beat.id,
        eventType: `BEAT_${decision === "NEEDS_REVISION" ? "NEEDS_REVISION" : decision.replace("_WITH_TAGS", "")}`,
        actorId: auth.user.id,
        contextJson: JSON.stringify({
          decision,
          reason: reason.trim(),
          reviewer: auth.user.name,
          previousStatus: beat.status,
          newStatus,
        }),
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    beatId: beat.id,
    canonicalId,
    title: beat.title,
    decision,
    newStatus,
    reviewRecordId: reviewRecord.id,
    message: `Decision recorded: ${decision}. Beat is now ${newStatus}.`,
  });
}
