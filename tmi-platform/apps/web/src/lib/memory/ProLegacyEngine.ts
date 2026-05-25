// ProLegacyEngine — verified-only ledger for sponsors, advertisers, promoters
// Items are ONLY created by system events. No public add() method.

import type { ProLegacyItem, ProLegacyKind, MetricImpact } from "@/types/memory";

const store = new Map<string, ProLegacyItem[]>(); // userId → items

function createItem(
  userId: string,
  kind: ProLegacyKind,
  title: string,
  impact: MetricImpact,
  opts: { eventId?: string; eventTitle?: string; visualProof?: string } = {}
): ProLegacyItem {
  const item: ProLegacyItem = {
    id: `${kind}-${userId}-${Date.now()}`,
    userId,
    kind,
    title,
    eventId: opts.eventId,
    eventTitle: opts.eventTitle,
    metricImpact: impact,
    visualProof: opts.visualProof,
    verified: true,
    showcaseMode: false,
    displayMode: "holographic-card",
    createdAt: new Date().toISOString(),
  };
  const existing = store.get(userId) ?? [];
  store.set(userId, [item, ...existing]);
  return item;
}

export const ProLegacyEngine = {
  /** Called by Stripe webhook on payment_intent.succeeded (role = sponsor) */
  addSponsorGift(userId: string, opts: {
    totalPaidOut: number;
    audienceReached?: number;
    eventId?: string;
    eventTitle?: string;
    prizesAwarded?: number;
  }): ProLegacyItem {
    const label = opts.eventTitle ? `Sponsored ${opts.eventTitle}` : "Sponsored a Live Event";
    return createItem(userId, "sponsor-gift", label, {
      totalPaidOut: opts.totalPaidOut,
      audienceReached: opts.audienceReached,
      prizesAwarded: opts.prizesAwarded,
    }, { eventId: opts.eventId, eventTitle: opts.eventTitle });
  },

  /** Called when promoter event reaches a ticket sales milestone */
  addPromoterWin(userId: string, opts: {
    ticketsSold: number;
    eventTitle: string;
    eventId?: string;
    conversionRate?: number;
  }): ProLegacyItem {
    return createItem(userId, "promoter-win", `Promoted: ${opts.eventTitle}`, {
      ticketsSold: opts.ticketsSold,
      conversionRate: opts.conversionRate,
      audienceReached: opts.ticketsSold,
    }, { eventId: opts.eventId, eventTitle: opts.eventTitle });
  },

  /** Called when an advertiser campaign completes with measurable results */
  addAdvertiserMilestone(userId: string, opts: {
    campaignName: string;
    audienceReached: number;
    engagementRate?: number;
    conversionRate?: number;
  }): ProLegacyItem {
    return createItem(userId, "advertiser-milestone", opts.campaignName, {
      audienceReached: opts.audienceReached,
      engagementRate: opts.engagementRate,
      conversionRate: opts.conversionRate,
    });
  },

  /** Called when a performer or event wins a crowd vote */
  addCrowdFavorite(userId: string, opts: {
    eventTitle: string;
    audienceReached: number;
    eventId?: string;
  }): ProLegacyItem {
    return createItem(userId, "crowd-favorite", `Crowd Favorite: ${opts.eventTitle}`, {
      audienceReached: opts.audienceReached,
    }, { eventId: opts.eventId, eventTitle: opts.eventTitle });
  },

  getItems(userId: string): ProLegacyItem[] {
    return store.get(userId) ?? [];
  },

  getShowcaseItems(userId: string): ProLegacyItem[] {
    return (store.get(userId) ?? []).filter((i) => i.showcaseMode);
  },

  toggleShowcase(userId: string, itemId: string): boolean {
    const items = store.get(userId) ?? [];
    const item = items.find((i) => i.id === itemId);
    if (!item) return false;
    item.showcaseMode = !item.showcaseMode;
    return item.showcaseMode;
  },
};

export default ProLegacyEngine;
