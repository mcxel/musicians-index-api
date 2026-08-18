export const dynamic = "force-dynamic";
/**
 * GET /api/yo/collection
 *
 * Returns the authenticated user's owned YoArtifact records.
 * Backed by the YoArtifactOwnership Prisma table.
 *
 * Rule 20: returns only real DB records — no fabricated ownership.
 */

import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";

export async function GET() {
  const auth = await getTmiAuth();
  if (!auth?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.yoArtifactOwnership.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { purchasedAt: "desc" },
    select: {
      id: true,
      artifactId: true,
      releaseVersion: true,
      ownershipType: true,
      purchaseId: true,
      stripePaymentIntentId: true,
      manifestHashAtPurchase: true,
      purchasedAt: true,
      buyerAccentOverride: true,
      offlineLicenseExpiresAt: true,
    },
  });

  return NextResponse.json({ collection: records });
}
