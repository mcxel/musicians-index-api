export type RevenueEventType =
  | "artist-signup" | "subscription-conversion" | "tip-facilitated" | "beat-licensed"
  | "nft-sale" | "ticket-sold" | "sponsor-placed" | "ad-click" | "event-created";

export interface BotRevenueEvent {
  eventId: string;
  botId: string;
  eventType: RevenueEventType;
  amount: number;
  currency: "USD" | "XP" | "POINTS";
  description: string;
  linkedEntityId?: string;
  recordedAt: string;
}

export interface BotRevenueReport {
  botId: string;
  totalUSD: number;
  totalXP: number;
  eventCount: number;
  byType: Partial<Record<RevenueEventType, number>>;
  topEvent: RevenueEventType | null;
}

const events: BotRevenueEvent[] = [];
const botIndex = new Map<string, BotRevenueEvent[]>();

function gen(): string {
  return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function recordRevenueEvent(
  botId: string,
  eventType: RevenueEventType,
  amount: number,
  description: string,
  opts: { currency?: BotRevenueEvent["currency"]; linkedEntityId?: string } = {},
): BotRevenueEvent {
  const event: BotRevenueEvent = {
    eventId: gen(),
    botId,
    eventType,
    amount,
    currency: opts.currency ?? "USD",
    description,
    linkedEntityId: opts.linkedEntityId,
    recordedAt: new Date().toISOString(),
  };
  events.unshift(event);
  const botEvents = botIndex.get(botId) ?? [];
  botEvents.unshift(event);
  botIndex.set(botId, botEvents.slice(0, 500));
  return event;
}

export function getBotRevenueReport(botId: string): BotRevenueReport {
  const botEvents = botIndex.get(botId) ?? [];
  const totalUSD = botEvents.filter((e) => e.currency === "USD").reduce((s, e) => s + e.amount, 0);
  const totalXP  = botEvents.filter((e) => e.currency === "XP" || e.currency === "POINTS").reduce((s, e) => s + e.amount, 0);
  const byType: Partial<Record<RevenueEventType, number>> = {};
  for (const e of botEvents) {
    byType[e.eventType] = (byType[e.eventType] ?? 0) + (e.currency === "USD" ? e.amount : 0);
  }
  const topEvent = (Object.entries(byType).sort(([, a], [, b]) => b - a)[0]?.[0] as RevenueEventType) ?? null;
  return { botId, totalUSD, totalXP, eventCount: botEvents.length, byType, topEvent };
}

export function getPlatformRevenueTotal(): number {
  return events.filter((e) => e.currency === "USD").reduce((s, e) => s + e.amount, 0);
}

export function getRevenueByType(eventType: RevenueEventType): number {
  return events.filter((e) => e.eventType === eventType && e.currency === "USD").reduce((s, e) => s + e.amount, 0);
}

export function getTopRevenueBots(limit = 5): Array<{ botId: string; totalUSD: number }> {
  const totals = new Map<string, number>();
  for (const e of events) {
    if (e.currency === "USD") totals.set(e.botId, (totals.get(e.botId) ?? 0) + e.amount);
  }
  return [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([botId, totalUSD]) => ({ botId, totalUSD }));
}
