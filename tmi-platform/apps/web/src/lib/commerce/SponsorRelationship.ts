/**
 * Artist / show sponsorship relationship glue — maps to PerformerSponsorship (Prisma)
 * and feed-backed show/product records. No fake payment UI (Rule 20).
 */
import { prisma } from "@/lib/prisma";

export type SponsorRelationshipType = "show" | "artist" | "product_prize";

export type SponsorRelationship = {
  id: string;
  sponsorType: SponsorRelationshipType;
  performerId?: string;
  campaignId?: string;
  startDate: string;
  endDate?: string;
  placementRights: string[];
  compensationTerms?: string;
  status: "draft" | "pending" | "active" | "expired" | "cancelled";
  revenueShareRule?: string;
  sponsorUserId: string;
  createdAt: string;
};

const FEED_TYPE = "SPONSOR_RELATIONSHIP";

function mapPrismaStatus(status: string): SponsorRelationship["status"] {
  if (status === "active") return "active";
  if (status === "cancelled") return "cancelled";
  if (status === "expired") return "expired";
  if (status === "payment_failed") return "pending";
  return "pending";
}

export const SponsorRelationshipStore = {
  async createArtistRelationship(params: {
    sponsorUserId: string;
    performerSlug: string;
    tier?: string;
    monthlyPriceCents?: number;
    placementRights?: string[];
    compensationTerms?: string;
    revenueShareRule?: string;
  }): Promise<SponsorRelationship> {
    const row = await prisma.performerSponsorship.create({
      data: {
        sponsorUserId: params.sponsorUserId,
        performerSlug: params.performerSlug,
        sponsorClass: "local",
        tier: params.tier ?? "solo",
        monthlyPriceCents: params.monthlyPriceCents ?? 0,
        status: "active",
        sponsorMessage: params.compensationTerms ?? null,
      },
    });
    return {
      id: row.id,
      sponsorType: "artist",
      performerId: params.performerSlug,
      startDate: row.startedAt.toISOString(),
      endDate: row.endsAt?.toISOString(),
      placementRights: params.placementRights ?? ["live_overlay", "profile_canister"],
      compensationTerms: params.compensationTerms,
      status: mapPrismaStatus(row.status),
      revenueShareRule: params.revenueShareRule,
      sponsorUserId: params.sponsorUserId,
      createdAt: row.createdAt.toISOString(),
    };
  },

  async createShowOrProductRelationship(params: {
    sponsorUserId: string;
    sponsorType: "show" | "product_prize";
    campaignId?: string;
    placementRights?: string[];
    compensationTerms?: string;
    revenueShareRule?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SponsorRelationship> {
    const id = `srel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: SponsorRelationship = {
      id,
      sponsorType: params.sponsorType,
      campaignId: params.campaignId,
      startDate: params.startDate ?? new Date().toISOString(),
      endDate: params.endDate,
      placementRights: params.placementRights ?? [],
      compensationTerms: params.compensationTerms,
      status: "draft",
      revenueShareRule: params.revenueShareRule,
      sponsorUserId: params.sponsorUserId,
      createdAt: new Date().toISOString(),
    };
    await prisma.feedItem.create({
      data: {
        userId: params.sponsorUserId,
        type: FEED_TYPE,
        entityId: params.campaignId ?? id,
        entityType: params.sponsorType,
        data: record as object,
        expiresAt: new Date("2040-01-01T00:00:00Z"),
      },
    });
    return record;
  },

  async listBySponsor(sponsorUserId: string): Promise<SponsorRelationship[]> {
    const [artistRows, feedRows] = await Promise.all([
      prisma.performerSponsorship.findMany({
        where: { sponsorUserId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.feedItem.findMany({
        where: { userId: sponsorUserId, type: FEED_TYPE },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    const artist: SponsorRelationship[] = artistRows.map((row) => ({
      id: row.id,
      sponsorType: "artist",
      performerId: row.performerSlug,
      startDate: row.startedAt.toISOString(),
      endDate: row.endsAt?.toISOString(),
      placementRights: ["live_overlay", "profile_canister"],
      compensationTerms: row.sponsorMessage ?? undefined,
      status: mapPrismaStatus(row.status),
      sponsorUserId: row.sponsorUserId,
      createdAt: row.createdAt.toISOString(),
    }));

    const other = feedRows.map((r) => r.data as unknown as SponsorRelationship);
    return [...artist, ...other].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
};
