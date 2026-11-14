/**
 * FanSponsorRegistry — sponsor → fan public-page relationships.
 * Pattern-matched to PerformerSponsorRegistry (feedItem-backed).
 * Distinct from platform-wide SponsorRegistry / ad_purchase products.
 *
 * Does not invent live sponsorships. Empty lists are honest.
 */

import prisma from "@/lib/prisma";
import { getPlanLocalSponsorSlots, getPlanMajorSponsorSlots } from "@/lib/subscriptions/SubscriptionPlanEngine";
import type { SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";
import { normalizeCreatorSubscriptionTier } from "@/lib/sponsors/CreatorSponsorshipCreditAuthority";

const FEED_TYPE = "FAN_SPONSOR";
const FAR_FUTURE = new Date("2040-01-01T00:00:00Z");

export type FanSponsorshipStatus = "active" | "pending" | "expired" | "cancelled" | "payment_failed";

export interface FanSponsorship {
  relationId: string;
  fanId: string;
  fanSlug: string;
  fanDisplayName: string;
  sponsorId: string;
  sponsorName: string;
  packageId: string;
  sponsorClass: "local" | "major";
  monthlyAmountCents: number;
  placementId: string | null;
  stripeSubscriptionId: string | null;
  status: FanSponsorshipStatus;
  startDate: string;
  endDate?: string;
  createdAt: number;
}

export const FanSponsorRegistry = {
  async create(
    params: Omit<FanSponsorship, "relationId" | "createdAt" | "status"> & {
      userId?: string;
      status?: FanSponsorshipStatus;
    },
  ): Promise<FanSponsorship> {
    const relationId = `fspon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: FanSponsorship = {
      relationId,
      fanId: params.fanId,
      fanSlug: params.fanSlug,
      fanDisplayName: params.fanDisplayName,
      sponsorId: params.sponsorId,
      sponsorName: params.sponsorName,
      packageId: params.packageId,
      sponsorClass: params.sponsorClass,
      monthlyAmountCents: params.monthlyAmountCents,
      placementId: params.placementId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      status: params.status ?? "active",
      startDate: params.startDate,
      endDate: params.endDate,
      createdAt: Date.now(),
    };

    await prisma.feedItem.create({
      data: {
        userId: params.userId ?? params.fanId,
        type: FEED_TYPE,
        entityId: params.fanSlug || params.fanId,
        entityType: "fan",
        data: record as object,
        expiresAt: FAR_FUTURE,
      },
    });

    return record;
  },

  async listByFan(fanIdOrSlug: string): Promise<FanSponsorship[]> {
    const rows = await prisma.feedItem.findMany({
      where: {
        type: FEED_TYPE,
        entityType: "fan",
        OR: [{ entityId: fanIdOrSlug }, { userId: fanIdOrSlug }],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((r) => r.data as unknown as FanSponsorship);
  },

  async listActiveByFan(fanIdOrSlug: string): Promise<FanSponsorship[]> {
    const all = await FanSponsorRegistry.listByFan(fanIdOrSlug);
    return all.filter((r) => r.status === "active");
  },

  /**
   * Public fan-page placements only: status === active, positive commitment.
   * Excludes pending / expired / cancelled / payment_failed. Never fabricates rows.
   */
  async listEligiblePublicPlacements(fanId: string, fanSlug?: string | null): Promise<FanSponsorship[]> {
    const keys = Array.from(
      new Set([fanId, fanSlug].filter((k): k is string => Boolean(k && k.trim()))),
    );
    const batches = await Promise.all(
      keys.map((k) => FanSponsorRegistry.listByFan(k).catch(() => [] as FanSponsorship[])),
    );
    const byRelation = new Map<string, FanSponsorship>();
    for (const row of batches.flat()) {
      if (row.status !== "active") continue;
      if (!Number.isFinite(row.monthlyAmountCents) || row.monthlyAmountCents <= 0) continue;
      byRelation.set(row.relationId, row);
    }
    return Array.from(byRelation.values());
  },

  async markStatusBySubscription(
    stripeSubscriptionId: string,
    status: FanSponsorshipStatus,
  ): Promise<number> {
    const rows = await prisma.feedItem.findMany({
      where: { type: FEED_TYPE, entityType: "fan" },
      take: 500,
    });
    let updated = 0;
    for (const row of rows) {
      const data = row.data as unknown as FanSponsorship;
      if (data.stripeSubscriptionId !== stripeSubscriptionId) continue;
      const next = { ...data, status, endDate: status === "cancelled" || status === "expired" ? new Date().toISOString() : data.endDate };
      await prisma.feedItem.update({
        where: { id: row.id },
        data: { data: next as object },
      });
      updated += 1;
    }
    return updated;
  },

  slotCapacity(tierRaw: string | null | undefined): {
    localSlots: number;
    majorSlots: number;
    tier: SubscriptionTier;
  } {
    const tier = normalizeCreatorSubscriptionTier(tierRaw);
    return {
      tier,
      localSlots: getPlanLocalSponsorSlots(tier),
      majorSlots: getPlanMajorSponsorSlots(tier),
    };
  },
};
