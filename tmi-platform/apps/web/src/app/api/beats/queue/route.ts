export const dynamic = "force-dynamic";

/**
 * GET /api/beats/queue
 *
 * Returns the reviewer queue — beats in CERTIFIED or IN_REVIEW status,
 * sorted by submittedAt ascending (oldest first, FIFO review order).
 *
 * Auth: beat_creator or admin only.
 *
 * Query params:
 *   status  string  optional  filter by status: CERTIFIED | IN_REVIEW | NEEDS_REVISION
 *   limit   number  optional  max results (default 50, max 100)
 *   offset  number  optional  pagination offset (default 0)
 *
 * Returns:
 *   { beats: BeatQueueItem[], total: number, pendingCount: number }
 */

import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";

const QUEUE_STATUSES = ["CERTIFIED", "IN_REVIEW", "NEEDS_REVISION"];

export async function GET(req: Request) {
  const auth = await getTmiAuth();
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const role = (auth.user.role ?? "").toLowerCase();
  if (role !== "beat_creator" && role !== "admin") {
    return NextResponse.json({ error: "role_required", requiredRole: "BEAT_CREATOR" }, { status: 403 });
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const whereStatus =
    statusFilter && QUEUE_STATUSES.includes(statusFilter)
      ? [statusFilter]
      : QUEUE_STATUSES;

  const [beats, total, pendingCount] = await prisma.$transaction([
    prisma.beat.findMany({
      where: { status: { in: whereStatus } },
      orderBy: { submittedAt: "asc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        canonicalId: true,
        title: true,
        producerId: true,
        producerName: true,
        status: true,
        genre: true,
        genreJson: true,
        bpm: true,
        key: true,
        audioAssetUrl: true,
        durationSeconds: true,
        eligiblePoolsJson: true,
        competitionEligible: true,
        licenseType: true,
        submittedAt: true,
        certifiedAt: true,
        rightsDeclarationAccepted: true,
        royaltySplits: { select: { recipientName: true, percentage: true, role: true } },
        certificationResults: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { passed: true, loudnessMeasuredLufs: true, failureReasonsJson: true, createdAt: true },
        },
        reviewRecords: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { reviewerId: true, decision: true, reason: true, createdAt: true },
        },
      },
    }),
    prisma.beat.count({ where: { status: { in: whereStatus } } }),
    prisma.beat.count({ where: { status: "CERTIFIED" } }),
  ]);

  return NextResponse.json({ beats, total, pendingCount, limit, offset });
}
