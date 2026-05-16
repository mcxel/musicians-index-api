import {
  LobbyFeedState,
  LobbyMonitorSlot,
  VenueAdSlot,
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  deriveMonitorSlots,
  deriveVenueAdSlots,
} from "@/lib/lobby/LobbyFeedBus";

export type MonitorZone = "stage" | "lobby" | "entrance" | "bar" | "balcony" | "vip";

export interface StageMirrorFrame {
  performerName: string;
  currentEvent: string;
  nextUp: string;
  heat: number;
  battleHeat: number;
  status: "LIVE" | "PRE-SHOW" | "STANDBY" | "QUEUE OPEN";
  updatedAtMs: number;
}

export interface SeatOccupancyStatus {
  total: number;
  occupied: number;
  pct: number;
  updatedAtMs: number;
}

export interface TipFeedEntry {
  fromName: string;
  amount: number;
  message?: string;
  ts: number;
}

export interface VenueMonitorState {
  slug: string;
  zone: MonitorZone;
  stage: StageMirrorFrame;
  seats: SeatOccupancyStatus;
  monitorSlots: LobbyMonitorSlot[];
  adSlots: VenueAdSlot[];
  recentTips: TipFeedEntry[];
  activeSponsorName: string;
  promoTitle: string;
  upcomingEventTitle: string;
  upcomingCountdownSeconds: number;
  ticketsAvailable: boolean;
  updatedAtMs: number;
}

type MonitorSubscriber = (state: VenueMonitorState) => void;

// ── Per-venue monitor state ───────────────────────────────────────────────────

const _monitors: Map<string, VenueMonitorState> = new Map();
const _subs: Map<string, Set<MonitorSubscriber>> = new Map();
const _feedUnsubscribers: Map<string, () => void> = new Map();

function getOrCreateMonitor(slug: string, zone: MonitorZone): VenueMonitorState {
  if (_monitors.has(slug)) return _monitors.get(slug)!;

  const feed = getLobbyFeedSnapshot();
  const state: VenueMonitorState = buildMonitorState(slug, zone, feed, [], []);
  _monitors.set(slug, state);
  return state;
}

function buildMonitorState(
  slug: string,
  zone: MonitorZone,
  feed: LobbyFeedState,
  tips: TipFeedEntry[],
  existingTips: TipFeedEntry[],
): VenueMonitorState {
  return {
    slug,
    zone,
    stage: {
      performerName: feed.performer,
      currentEvent: feed.currentEvent,
      nextUp: feed.nextPerformer,
      heat: feed.heat,
      battleHeat: feed.battleHeat,
      status: feed.status,
      updatedAtMs: Date.now(),
    },
    seats: {
      total: Math.max(feed.occupancy, 1),
      occupied: feed.occupancy,
      pct: feed.occupancyPct,
      updatedAtMs: Date.now(),
    },
    monitorSlots: deriveMonitorSlots(feed),
    adSlots: deriveVenueAdSlots(feed),
    recentTips: [...existingTips, ...tips].slice(-10),
    activeSponsorName: feed.activeSponsor.name,
    promoTitle: feed.venuePromo.title,
    upcomingEventTitle: feed.upcomingEvent.title,
    upcomingCountdownSeconds: feed.upcomingEvent.countdownSeconds,
    ticketsAvailable: feed.upcomingEvent.ticketsAvailable,
    updatedAtMs: Date.now(),
  };
}

function notify(slug: string): void {
  const state = _monitors.get(slug);
  if (!state) return;
  const subs = _subs.get(slug);
  if (!subs) return;
  for (const fn of subs) fn(state);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function activateVenueMonitor(slug: string, zone: MonitorZone = "lobby"): () => void {
  getOrCreateMonitor(slug, zone);

  const unsub = subscribeLobbyFeed((feed) => {
    const existing = _monitors.get(slug);
    if (!existing) return;
    const updated = buildMonitorState(slug, zone, feed, [], existing.recentTips);
    _monitors.set(slug, updated);
    notify(slug);
  });

  _feedUnsubscribers.set(slug, unsub);

  return () => {
    unsub();
    _feedUnsubscribers.delete(slug);
  };
}

export function getMonitorState(slug: string): VenueMonitorState | null {
  return _monitors.get(slug) ?? null;
}

export function subscribeVenueMonitor(slug: string, fn: MonitorSubscriber): () => void {
  if (!_subs.has(slug)) _subs.set(slug, new Set());
  _subs.get(slug)!.add(fn);

  const current = _monitors.get(slug);
  if (current) fn(current);

  return () => _subs.get(slug)?.delete(fn);
}

export function pushSeatUpdate(slug: string, occupied: number, total: number): void {
  const state = _monitors.get(slug);
  if (!state) return;
  const updated: VenueMonitorState = {
    ...state,
    seats: {
      total,
      occupied,
      pct: total > 0 ? Math.round((occupied / total) * 100) : 0,
      updatedAtMs: Date.now(),
    },
    updatedAtMs: Date.now(),
  };
  _monitors.set(slug, updated);
  notify(slug);
}

export function pushTip(slug: string, entry: Omit<TipFeedEntry, "ts">): void {
  const state = _monitors.get(slug);
  if (!state) return;
  const tip: TipFeedEntry = { ...entry, ts: Date.now() };
  const updated: VenueMonitorState = {
    ...state,
    recentTips: [...state.recentTips, tip].slice(-10),
    updatedAtMs: Date.now(),
  };
  _monitors.set(slug, updated);
  notify(slug);
}

export function pushStageUpdate(
  slug: string,
  patch: Partial<Pick<StageMirrorFrame, "performerName" | "currentEvent" | "nextUp" | "heat" | "battleHeat" | "status">>
): void {
  const state = _monitors.get(slug);
  if (!state) return;
  const updated: VenueMonitorState = {
    ...state,
    stage: { ...state.stage, ...patch, updatedAtMs: Date.now() },
    updatedAtMs: Date.now(),
  };
  _monitors.set(slug, updated);
  notify(slug);
}

export function getAllActiveMonitors(): VenueMonitorState[] {
  return Array.from(_monitors.values());
}

export function getMonitorsByZone(zone: MonitorZone): VenueMonitorState[] {
  return Array.from(_monitors.values()).filter((m) => m.zone === zone);
}
