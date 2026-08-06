export const dynamic = "force-dynamic";

/**
 * GET /api/beats/[canonicalId]
 *
 * Returns the full beat record for a given canonical ID (B-XXXXXXXX),
 * including status, royalty splits, last provenance events, and
 * latest certification result.
 *
 * Auth: any authenticated user may view; creator and reviewer may see
 * private fields (failureReasons, reviewReason).
 */

import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { canonicalId: string } },
) {
  const auth = await getTmiAuth();
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { canonicalId } = params;
  if (!canonicalId?.startsWith("B-")) {
    return NextResponse.json({ error: "invalid_canonical_id" }, { status: 400 });
  }

  const beat = await prisma.beat.findUnique({
    where: { canonicalId },
    include: {
      royaltySplits: { orderBy: { percentage: "desc" } },
      provenanceEvents: { orderBy: { occurredAt: "desc" }, take: 20 },
      certificationResults: { orderBy: { createdAt: "desc" }, take: 1 },
      reviewRecords: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!beat) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const role = (auth.user.role ?? "").toLowerCase();
  const isOwner = beat.producerId === auth.user.id;
  const isReviewer = role === "beat_creator" || role === "admin";
  const canSeePrivate = isOwner || isReviewer;

  // Redact sensitive reviewer reasoning for non-owners/non-reviewers
  const reviewRecords = canSeePrivate
    ? beat.reviewRecords
    : beat.reviewRecords.map((r) => ({ ...r, reason: "[redacted]" }));

  // Redact cert failure reasons for non-owners
  const certResult = beat.certificationResults[0] ?? null;
  const certSafe = certResult && !isOwner
    ? { ...certResult, failureReasonsJson: "[]" }
    : certResult;

  return NextResponse.json({
    id: beat.id,
    canonicalId: beat.canonicalId,
    title: beat.title,
    producerId: beat.producerId,
    producerName: beat.producerName,
    status: beat.status,
    genre: beat.genre,
    genreJson: beat.genreJson,
    moodJson: beat.moodJson,
    energyLevel: beat.energyLevel,
    bpm: beat.bpm,
    key: beat.key,
    audioAssetUrl: isOwner ? beat.audioAssetUrl : null, // URL is private until LIVE
    audioFilename: isOwner ? beat.audioFilename : null,
    durationSeconds: beat.durationSeconds,
    eligiblePoolsJson: beat.eligiblePoolsJson,
    competitionEligible: beat.competitionEligible,
    licenseType: beat.licenseType,
    rightsDeclarationAccepted: beat.rightsDeclarationAccepted,
    submittedAt: beat.submittedAt,
    certifiedAt: beat.certifiedAt,
    approvedAt: beat.approvedAt,
    publishedAt: beat.publishedAt,
    royaltySplits: beat.royaltySplits,
    latestCertification: certSafe,
    recentProvenance: beat.provenanceEvents,
    reviewRecords,
    createdAt: beat.createdAt,
    updatedAt: beat.updatedAt,
  });
}
