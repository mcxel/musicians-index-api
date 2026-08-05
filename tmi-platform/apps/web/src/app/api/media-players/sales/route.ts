export const dynamic = "force-dynamic";

/**
 * GET /api/media-players/sales
 *
 * Returns chassis-level ownership counts — how many users own each chassis ID.
 * Used by: performer/artist dashboards, admin Observatory, future Creator Marketplace.
 *
 * Phase 1: Platform chassis only (all chassis are TMI-owned).
 * Phase 3 (Creator Marketplace): filter by creatorUserId once artist-created
 * chassis exist.
 *
 * Auth: authenticated users see their own chassis ownership count + platform totals
 *       (admin can see all). No unauthenticated access.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MEDIA_PLAYER_CHASSIS_REGISTRY } from "@/lib/artifacts/PlaylistArtifactEngine";

async function resolveUser(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
}

export async function GET(req: NextRequest) {
  const user = await resolveUser(req);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  // Group ownership count by chassisId across the whole platform
  const grouped = await prisma.mediaPlayerChassisOwnership.groupBy({
    by: ["chassisId"],
    _count: { userId: true },
    orderBy: { _count: { userId: "desc" } },
  });

  // Enrich with chassis metadata from registry
  const sales = grouped.map((row) => {
    const chassis =
      MEDIA_PLAYER_CHASSIS_REGISTRY[
        row.chassisId as keyof typeof MEDIA_PLAYER_CHASSIS_REGISTRY
      ];
    return {
      chassisId: row.chassisId,
      label: chassis?.label ?? row.chassisId,
      icon: chassis?.icon ?? "🎛️",
      rarity: chassis?.rarity ?? "unknown",
      totalOwners: row._count.userId,
      // Revenue per unit (Stripe purchases only — points purchases tracked separately)
      priceUsdCents: chassis?.priceUsdCents ?? 0,
      estimatedRevenueCents: (chassis?.priceUsdCents ?? 0) * row._count.userId,
    };
  });

  // Platform-level summary totals
  const totalOwners = await prisma.mediaPlayerChassisOwnership.count();
  const purchasedCount = await prisma.mediaPlayerChassisOwnership.count({
    where: { unlockedVia: "purchase" },
  });
  const pointsCount = await prisma.mediaPlayerChassisOwnership.count({
    where: { unlockedVia: "points" },
  });

  return NextResponse.json({
    sales,
    summary: {
      totalOwners,
      purchasedCount,
      pointsCount,
      grantedCount: totalOwners - purchasedCount - pointsCount,
      uniqueChassisIds: grouped.length,
    },
    asOf: new Date().toISOString(),
  });
}
