// ProLedgerEngine — verified Pro Legacy items only
// Items MUST be created by system events (Stripe, ticketing, analytics).
// There is intentionally no public create() function — only named system creators.

import type { ProLegacyItem, ProLegacyKind, MetricImpact } from "@/types/memory";

const store = new Map<string, ProLegacyItem[]>(); // userId → items

function makeItem(
  userId: string,
  kind: ProLegacyKind,
  title: string,
  metrics: MetricImpact,
  opts: { eventId?: string; eventTitle?: string; showcaseMode?: boolean } = {},
): ProLegacyItem {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    kind,
    title,
    eventId: opts.eventId,
    eventTitle: opts.eventTitle,
    metricImpact: metrics,
    verified: true,
    showcaseMode: opts.showcaseMode ?? true,
    displayMode: "holographic-card",
    createdAt: new Date().toISOString(),
  };
}

function save(item: ProLegacyItem): void {
  const list = store.get(item.userId) ?? [];
  store.set(item.userId, [item, ...list]);
}

// ─── System creators (only these may create verified items) ──────────────────

/** Called by Stripe webhook when a sponsor payment succeeds */
export function createSponsorGift(
  userId: string,
  opts: { totalPaidOut: number; eventId?: string; eventTitle?: string; audienceReached?: number },
): ProLegacyItem {
  const item = makeItem(
    userId,
    "sponsor-gift",
    opts.eventTitle ? `Sponsored ${opts.eventTitle}` : `Sponsorship — $${opts.totalPaidOut}`,
    { totalPaidOut: opts.totalPaidOut, audienceReached: opts.audienceReached },
    { eventId: opts.eventId, eventTitle: opts.eventTitle },
  );
  save(item);
  return item;
}

/** Called by ticketing engine when a promoter hits a sales milestone */
export function createPromoterWin(
  userId: string,
  opts: { ticketsSold: number; eventId?: string; eventTitle?: string; conversionRate?: number },
): ProLegacyItem {
  const item = makeItem(
    userId,
    "promoter-win",
    opts.eventTitle ? `Sold Out: ${opts.eventTitle}` : `${opts.ticketsSold} Tickets Sold`,
    { ticketsSold: opts.ticketsSold, conversionRate: opts.conversionRate },
    { eventId: opts.eventId, eventTitle: opts.eventTitle },
  );
  save(item);
  return item;
}

/** Called by analytics engine when an advertiser campaign completes */
export function createAdvertiserMilestone(
  userId: string,
  opts: { audienceReached: number; engagementRate?: number; eventTitle?: string },
): ProLegacyItem {
  const item = makeItem(
    userId,
    "advertiser-milestone",
    opts.eventTitle ? `Campaign: ${opts.eventTitle}` : `Reached ${opts.audienceReached.toLocaleString()} Fans`,
    { audienceReached: opts.audienceReached, engagementRate: opts.engagementRate },
    { eventTitle: opts.eventTitle },
  );
  save(item);
  return item;
}

/** Called when a business's sponsored prize is voted crowd favorite */
export function createCrowdFavorite(
  userId: string,
  opts: { prizesAwarded: number; eventTitle?: string; audienceReached?: number },
): ProLegacyItem {
  const item = makeItem(
    userId,
    "crowd-favorite",
    opts.eventTitle ? `Crowd Favorite: ${opts.eventTitle}` : `${opts.prizesAwarded} Prizes Awarded`,
    { prizesAwarded: opts.prizesAwarded, audienceReached: opts.audienceReached },
    { eventTitle: opts.eventTitle },
  );
  save(item);
  return item;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function getLedger(userId: string): ProLegacyItem[] {
  return store.get(userId) ?? [];
}

export function getShowcaseLedger(userId: string): ProLegacyItem[] {
  return (store.get(userId) ?? []).filter((i) => i.showcaseMode);
}

export function toggleShowcase(userId: string, itemId: string): void {
  const list = store.get(userId) ?? [];
  store.set(userId, list.map((i) => i.id === itemId ? { ...i, showcaseMode: !i.showcaseMode } : i));
}
