/**
 * RevenuePulseEngine
 * Live earnings tracker for the active performer.
 * Aggregates tips, ticket sales, merch, sponsor drops, and battle prizes.
 */
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

export type RevenueStream = "tip" | "ticket" | "merch" | "sponsor" | "battle_prize" | "subscription" | "nft";

export interface RevenueEvent {
  id: string;
  stream: RevenueStream;
  amountCents: number;
  fromUserId: string | null;
  fromDisplayName: string | null;
  note: string | null;
  receivedAt: number;
}

export interface RevenuePulseState {
  roomId: string;
  performerId: string;
  sessionTotalCents: number;
  byStream: Record<RevenueStream, number>;
  recentEvents: RevenueEvent[];      // last 20
  peakMinuteCents: number;
  currentMinuteCents: number;
  minuteWindowStart: number;
  ticketsSold: number;
  merchUnitsSold: number;
  uniqueTippers: Set<string>;
  topTipperName: string | null;
  topTipAmountCents: number;
}

const MAX_RECENT = 20;

const pulseStates = new Map<string, RevenuePulseState>();
type PulseListener = (state: RevenuePulseState) => void;
const pulseListeners = new Map<string, Set<PulseListener>>();

const STREAMS: RevenueStream[] = ["tip", "ticket", "merch", "sponsor", "battle_prize", "subscription", "nft"];

function defaultByStream(): Record<RevenueStream, number> {
  return Object.fromEntries(STREAMS.map(s => [s, 0])) as Record<RevenueStream, number>;
}

export function initRevenuePulse(roomId: string, performerId: string): RevenuePulseState {
  const state: RevenuePulseState = {
    roomId, performerId, sessionTotalCents: 0, byStream: defaultByStream(),
    recentEvents: [], peakMinuteCents: 0, currentMinuteCents: 0,
    minuteWindowStart: Date.now(), ticketsSold: 0, merchUnitsSold: 0,
    uniqueTippers: new Set(), topTipperName: null, topTipAmountCents: 0,
  };
  pulseStates.set(roomId, state);
  return state;
}

export function recordRevenue(roomId: string, event: Omit<RevenueEvent, "id" | "receivedAt">): RevenuePulseState {
  const current = pulseStates.get(roomId);
  if (!current) return initRevenuePulse(roomId, "");

  const now = Date.now();
  const fullEvent: RevenueEvent = {
    ...event,
    id: `rev_${now}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: now,
  };

  const windowAge = now - current.minuteWindowStart;
  const inWindow = windowAge < 60_000;
  const currentMinuteCents = inWindow
    ? current.currentMinuteCents + event.amountCents
    : event.amountCents;
  const minuteWindowStart = inWindow ? current.minuteWindowStart : now;
  const peakMinuteCents = Math.max(current.peakMinuteCents, currentMinuteCents);

  const byStream = { ...current.byStream, [event.stream]: current.byStream[event.stream] + event.amountCents };
  const recentEvents = [fullEvent, ...current.recentEvents].slice(0, MAX_RECENT);

  const uniqueTippers = new Set(current.uniqueTippers);
  if (event.stream === "tip" && event.fromUserId) uniqueTippers.add(event.fromUserId);

  const ticketsSold = event.stream === "ticket" ? current.ticketsSold + 1 : current.ticketsSold;
  const merchUnitsSold = event.stream === "merch" ? current.merchUnitsSold + 1 : current.merchUnitsSold;

  let topTipperName = current.topTipperName;
  let topTipAmountCents = current.topTipAmountCents;
  if (event.stream === "tip" && event.amountCents > topTipAmountCents) {
    topTipAmountCents = event.amountCents;
    topTipperName = event.fromDisplayName;
  }

  const updated: RevenuePulseState = {
    ...current,
    sessionTotalCents: current.sessionTotalCents + event.amountCents,
    byStream, recentEvents, peakMinuteCents, currentMinuteCents, minuteWindowStart,
    ticketsSold, merchUnitsSold, uniqueTippers, topTipperName, topTipAmountCents,
  };
  pulseStates.set(roomId, updated);
  pulseListeners.get(roomId)?.forEach(l => l(updated));

  Analytics.revenue({
    amount:   event.amountCents / 100,
    currency: 'usd',
    product:  event.stream,
    userId:   event.fromUserId ?? undefined,
    activePersona: 'performer',
  });

  return updated;
}

export function getRevenuePulse(roomId: string): RevenuePulseState | null {
  return pulseStates.get(roomId) ?? null;
}

export function subscribeToRevenuePulse(roomId: string, listener: PulseListener): () => void {
  if (!pulseListeners.has(roomId)) pulseListeners.set(roomId, new Set());
  pulseListeners.get(roomId)!.add(listener);
  const current = pulseStates.get(roomId);
  if (current) listener(current);
  return () => pulseListeners.get(roomId)?.delete(listener);
}

export function getSessionRevenueFormatted(roomId: string): string {
  const state = pulseStates.get(roomId);
  if (!state) return "$0.00";
  return `$${(state.sessionTotalCents / 100).toFixed(2)}`;
}
