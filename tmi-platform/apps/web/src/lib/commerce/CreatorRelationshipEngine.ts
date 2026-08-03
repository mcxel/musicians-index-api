/**
 * CreatorRelationshipEngine — thin fan↔creator event ledger (Phase 2B).
 *
 * Records Followed / CollectedYoPho / Tip only when real APIs fire.
 * Fan Lifetime Value aggregates from those real events only.
 * Honest empty when none. No ad-tech tracking pitch in UI.
 */

export type CreatorRelationshipEventType =
  | "Followed"
  | "CollectedYoPho"
  | "Tip";

export interface CreatorRelationshipEvent {
  id: string;
  type: CreatorRelationshipEventType;
  fanId: string;
  creatorId: string;
  /** Tip amount in cents when type=Tip; else 0. */
  amountCents: number;
  at: string;
  /** Optional real source tag (api route / command type). */
  source?: string;
}

export interface FanLifetimeValue {
  fanId: string;
  creatorId: string;
  /** Sum of Tip amountCents only — never invented. */
  lifetimeValueCents: number;
  tipCount: number;
  followed: boolean;
  yophoCollectedCount: number;
  eventCount: number;
}

const STORAGE_KEY = "tmi_creator_relationship_events_v1";

function loadAll(): CreatorRelationshipEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreatorRelationshipEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(events: CreatorRelationshipEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 500)));
  } catch {
    /* quota */
  }
}

/** In-memory mirror for SSR / same-tick reads. */
const _mem: CreatorRelationshipEvent[] = [];

function allEvents(): CreatorRelationshipEvent[] {
  const stored = loadAll();
  if (stored.length === 0) return [..._mem];
  return stored;
}

/**
 * Record a real relationship event. Call only from real API / command handlers
 * (follow mutation, YoPho collect, tip webhook) — never from UI impressions.
 */
export function recordRelationshipEvent(input: {
  type: CreatorRelationshipEventType;
  fanId: string;
  creatorId: string;
  amountCents?: number;
  source?: string;
}): CreatorRelationshipEvent {
  const event: CreatorRelationshipEvent = {
    id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: input.type,
    fanId: input.fanId,
    creatorId: input.creatorId,
    amountCents: input.type === "Tip" ? Math.max(0, input.amountCents ?? 0) : 0,
    at: new Date().toISOString(),
    source: input.source,
  };
  const next = [event, ...allEvents()].slice(0, 500);
  _mem.length = 0;
  _mem.push(...next);
  saveAll(next);
  return event;
}

export function listRelationshipEvents(filter?: {
  fanId?: string;
  creatorId?: string;
  type?: CreatorRelationshipEventType;
}): CreatorRelationshipEvent[] {
  return allEvents().filter((e) => {
    if (filter?.fanId && e.fanId !== filter.fanId) return false;
    if (filter?.creatorId && e.creatorId !== filter.creatorId) return false;
    if (filter?.type && e.type !== filter.type) return false;
    return true;
  });
}

/**
 * Fan Lifetime Value for one fan→creator pair — tips only, honest empty (0).
 */
export function getFanLifetimeValue(
  fanId: string,
  creatorId: string,
): FanLifetimeValue {
  const events = listRelationshipEvents({ fanId, creatorId });
  const tips = events.filter((e) => e.type === "Tip");
  return {
    fanId,
    creatorId,
    lifetimeValueCents: tips.reduce((s, e) => s + e.amountCents, 0),
    tipCount: tips.length,
    followed: events.some((e) => e.type === "Followed"),
    yophoCollectedCount: events.filter((e) => e.type === "CollectedYoPho").length,
    eventCount: events.length,
  };
}

/** Aggregate FLV for a creator across all fans who have real events. */
export function listCreatorFanValues(creatorId: string): FanLifetimeValue[] {
  const events = listRelationshipEvents({ creatorId });
  const fanIds = [...new Set(events.map((e) => e.fanId))];
  return fanIds.map((fanId) => getFanLifetimeValue(fanId, creatorId));
}
