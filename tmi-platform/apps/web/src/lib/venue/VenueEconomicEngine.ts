/**
 * VenueEconomicEngine
 * Tracks all revenue flows in a live venue session:
 * tickets, tips, bar, merch, sponsor injections, and battle prize pools.
 */

export type RevenueStream =
  | "ticket-general"
  | "ticket-vip"
  | "tip-direct"
  | "tip-battle-pool"
  | "bar-tab"
  | "merch"
  | "sponsor-slot"
  | "nft-drop"
  | "battle-prize"
  | "subscription-gate"
  | "ppv";

export interface RevenueEvent {
  eventId: string;
  venueId: string;
  stream: RevenueStream;
  amountCents: number;
  fromUserId: string | null;
  toPerformerId: string | null;
  note: string | null;
  processedAt: number;
}

export interface VenueEconomicState {
  venueId: string;
  totalRevenueCents: number;
  byStream: Record<RevenueStream, number>;
  tipPoolCents: number;
  battlePrizeCents: number;
  sponsorRevenueCents: number;
  uniquePayers: number;
  recentEvents: RevenueEvent[];
  peakRevenuePerMinuteCents: number;
  sessionStartedAt: number;
  lastUpdatedAt: number;
}

type EconomicListener = (state: VenueEconomicState) => void;

const MAX_RECENT_EVENTS = 100;
const REVENUE_WINDOW_MS = 60_000;

const economicStates = new Map<string, VenueEconomicState>();
const revenueHistory = new Map<string, RevenueEvent[]>();
const uniquePayerSets = new Map<string, Set<string>>();
const economicListeners = new Map<string, Set<EconomicListener>>();

function notify(venueId: string, state: VenueEconomicState): void {
  economicListeners.get(venueId)?.forEach(l => l(state));
}

function makeEmptyStreams(): Record<RevenueStream, number> {
  return {
    "ticket-general": 0,
    "ticket-vip": 0,
    "tip-direct": 0,
    "tip-battle-pool": 0,
    "bar-tab": 0,
    "merch": 0,
    "sponsor-slot": 0,
    "nft-drop": 0,
    "battle-prize": 0,
    "subscription-gate": 0,
    "ppv": 0,
  };
}

export function initVenueEconomy(venueId: string): VenueEconomicState {
  const state: VenueEconomicState = {
    venueId,
    totalRevenueCents: 0,
    byStream: makeEmptyStreams(),
    tipPoolCents: 0,
    battlePrizeCents: 0,
    sponsorRevenueCents: 0,
    uniquePayers: 0,
    recentEvents: [],
    peakRevenuePerMinuteCents: 0,
    sessionStartedAt: Date.now(),
    lastUpdatedAt: Date.now(),
  };
  economicStates.set(venueId, state);
  revenueHistory.set(venueId, []);
  uniquePayerSets.set(venueId, new Set());
  return state;
}

export function recordRevenueEvent(
  venueId: string,
  stream: RevenueStream,
  amountCents: number,
  opts: {
    fromUserId?: string;
    toPerformerId?: string;
    note?: string;
  } = {}
): VenueEconomicState | null {
  const state = economicStates.get(venueId);
  if (!state) return null;

  const event: RevenueEvent = {
    eventId: `rev_${venueId}_${stream}_${Date.now()}`,
    venueId, stream, amountCents,
    fromUserId: opts.fromUserId ?? null,
    toPerformerId: opts.toPerformerId ?? null,
    note: opts.note ?? null,
    processedAt: Date.now(),
  };

  const history = [...(revenueHistory.get(venueId) ?? []), event];
  revenueHistory.set(venueId, history);

  if (opts.fromUserId) {
    uniquePayerSets.get(venueId)!.add(opts.fromUserId);
  }

  // Revenue per minute
  const now = Date.now();
  const windowTotal = history
    .filter(e => now - e.processedAt < REVENUE_WINDOW_MS)
    .reduce((s, e) => s + e.amountCents, 0);

  const byStream = { ...state.byStream };
  byStream[stream] = (byStream[stream] ?? 0) + amountCents;

  const updated: VenueEconomicState = {
    ...state,
    totalRevenueCents: state.totalRevenueCents + amountCents,
    byStream,
    tipPoolCents: stream === "tip-battle-pool"
      ? state.tipPoolCents + amountCents : state.tipPoolCents,
    battlePrizeCents: stream === "battle-prize"
      ? state.battlePrizeCents + amountCents : state.battlePrizeCents,
    sponsorRevenueCents: stream === "sponsor-slot"
      ? state.sponsorRevenueCents + amountCents : state.sponsorRevenueCents,
    uniquePayers: uniquePayerSets.get(venueId)!.size,
    recentEvents: [...state.recentEvents, event].slice(-MAX_RECENT_EVENTS),
    peakRevenuePerMinuteCents: Math.max(state.peakRevenuePerMinuteCents, windowTotal),
    lastUpdatedAt: now,
  };

  economicStates.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function getEconomicState(venueId: string): VenueEconomicState | null {
  return economicStates.get(venueId) ?? null;
}

export function getRevenueByStream(venueId: string, stream: RevenueStream): number {
  return economicStates.get(venueId)?.byStream[stream] ?? 0;
}

export function subscribeToEconomy(venueId: string, listener: EconomicListener): () => void {
  if (!economicListeners.has(venueId)) economicListeners.set(venueId, new Set());
  economicListeners.get(venueId)!.add(listener);
  const current = economicStates.get(venueId);
  if (current) listener(current);
  return () => economicListeners.get(venueId)?.delete(listener);
}

export function getAllVenueRevenue(): { venueId: string; totalCents: number }[] {
  return [...economicStates.values()].map(s => ({ venueId: s.venueId, totalCents: s.totalRevenueCents }));
}
