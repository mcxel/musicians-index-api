/**
 * PersonaAnalyticsEngine.ts
 *
 * Central analytics telemetry layer for persona-separated metrics.
 *
 * Every analytics event on the platform MUST flow through emitEvent() so that:
 *   - activePersona is always tagged
 *   - analytics separation is preserved (fan XP ≠ artist XP ≠ producer XP)
 *   - group affiliation is included when applicable
 *   - capability source is traceable
 *
 * The engine is intentionally thin:
 *   - No external dependencies
 *   - Can be replaced with a real analytics provider (Mixpanel, PostHog, Amplitude)
 *     by swapping the _dispatch() function
 *   - All tagged events are stored in-memory for dashboard replay / diagnostics
 */

import {
  getActivePersonaFromCookie,
  getUserPersonas,
  type PersonaType,
  type Capability,
} from '@/lib/identity/MultiPersonaEngine';

// ── Event Schema ──────────────────────────────────────────────────────────────

export type AnalyticsDomain =
  | 'xp'           // XP earned, milestones
  | 'revenue'      // purchases, tips, subscriptions
  | 'storefront'   // product views, beat plays, NFT mints
  | 'engagement'   // votes, watches, reactions, comments
  | 'moderation'   // reports, bans, escalations
  | 'livestream'   // stream start/stop, viewer counts, cam changes
  | 'ranking'      // crown points, chart moves
  | 'group'        // group actions, split events
  | 'session'      // persona switch, login, logout
  | 'diagnostics'  // internal platform health events
  | 'advertiser'   // ad impressions, clicks, conversions
  | 'sponsor'      // sponsor actions, campaign metrics
  | 'contest';     // battle entries, votes, results

export interface PersonaAnalyticsEvent {
  eventId:       string;
  eventName:     string;
  domain:        AnalyticsDomain;
  ts:            number;

  // Persona context — always attached
  activePersona: PersonaType;
  allPersonas:   PersonaType[];

  // Optional enrichment
  userId?:       string;
  groupId?:      string;        // if action happened under group context
  capability?:   Capability;    // which capability triggered this event
  assetId?:      string;        // release, beat, NFT, ticket being acted on
  value?:        number;        // XP delta, revenue amount, vote count etc.
  currency?:     string;
  sessionId?:    string;

  // Arbitrary extra data
  meta?:         Record<string, string | number | boolean>;
}

export interface PersonaEventSummary {
  totalEvents:    number;
  byPersona:      Record<string, number>;
  byDomain:       Record<string, number>;
  lastEventAt:    number | null;
}

// ── In-Memory Store ───────────────────────────────────────────────────────────

const EVENT_LOG: PersonaAnalyticsEvent[] = [];
const MAX_LOG_SIZE = 2000;

// ── Core Emitter ──────────────────────────────────────────────────────────────

export function emitEvent(input: {
  eventName:  string;
  domain:     AnalyticsDomain;
  userId?:    string;
  groupId?:   string;
  capability?: Capability;
  assetId?:   string;
  value?:     number;
  currency?:  string;
  sessionId?: string;
  meta?:      Record<string, string | number | boolean>;
  // Override persona detection (for server-side emission where cookies unavailable)
  activePersonaOverride?: PersonaType;
  allPersonasOverride?:   PersonaType[];
}): PersonaAnalyticsEvent {
  const activePersona = input.activePersonaOverride ?? getActivePersonaFromCookie() ?? 'fan';
  const allPersonas   = input.allPersonasOverride   ?? getUserPersonas();

  const event: PersonaAnalyticsEvent = {
    eventId:       `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    eventName:     input.eventName,
    domain:        input.domain,
    ts:            Date.now(),
    activePersona,
    allPersonas,
    userId:        input.userId,
    groupId:       input.groupId,
    capability:    input.capability,
    assetId:       input.assetId,
    value:         input.value,
    currency:      input.currency,
    sessionId:     input.sessionId,
    meta:          input.meta,
  };

  // Append to in-memory log (rolling window)
  EVENT_LOG.push(event);
  if (EVENT_LOG.length > MAX_LOG_SIZE) EVENT_LOG.shift();

  // Dispatch to external provider (no-op in dev; replace with real provider)
  _dispatch(event);

  return event;
}

// ── Domain-Specific Shortcuts ─────────────────────────────────────────────────

export const Analytics = {

  xp: (params: { userId?: string; delta: number; source: string; groupId?: string; activePersona?: PersonaType }) =>
    emitEvent({
      eventName:  'xp.earned',
      domain:     'xp',
      userId:     params.userId,
      groupId:    params.groupId,
      value:      params.delta,
      meta:       { source: params.source },
      activePersonaOverride: params.activePersona,
    }),

  revenue: (params: { userId?: string; amount: number; currency?: string; product: string; activePersona?: PersonaType }) =>
    emitEvent({
      eventName:  'revenue.received',
      domain:     'revenue',
      userId:     params.userId,
      value:      params.amount,
      currency:   params.currency ?? 'usd',
      meta:       { product: params.product },
      activePersonaOverride: params.activePersona,
    }),

  storefrontView: (params: { userId?: string; assetId: string; assetType: string; activePersona?: PersonaType }) =>
    emitEvent({
      eventName:  'storefront.view',
      domain:     'storefront',
      userId:     params.userId,
      assetId:    params.assetId,
      meta:       { assetType: params.assetType },
      activePersonaOverride: params.activePersona,
    }),

  vote: (params: { userId?: string; targetId: string; context: string; activePersona?: PersonaType }) =>
    emitEvent({
      eventName:  'engagement.vote',
      domain:     'engagement',
      userId:     params.userId,
      assetId:    params.targetId,
      meta:       { context: params.context },
      activePersonaOverride: params.activePersona,
    }),

  personaSwitch: (params: { userId?: string; from: PersonaType; to: PersonaType }) =>
    emitEvent({
      eventName:  'session.persona_switch',
      domain:     'session',
      userId:     params.userId,
      meta:       { from: params.from, to: params.to },
      activePersonaOverride: params.to,
    }),

  livestreamEvent: (params: { userId?: string; eventType: string; streamId?: string; viewers?: number; activePersona?: PersonaType; meta?: Record<string, string | number | boolean> }) =>
    emitEvent({
      eventName:  `livestream.${params.eventType}`,
      domain:     'livestream',
      userId:     params.userId,
      sessionId:  params.streamId,
      value:      params.viewers,
      meta:       params.meta,
      activePersonaOverride: params.activePersona,
    }),

  ranking: (params: { userId?: string; points: number; rankDelta: number; category: string; activePersona?: PersonaType }) =>
    emitEvent({
      eventName:  'ranking.update',
      domain:     'ranking',
      userId:     params.userId,
      value:      params.points,
      meta:       { rankDelta: params.rankDelta, category: params.category },
      activePersonaOverride: params.activePersona,
    }),

  groupAction: (params: { userId?: string; groupId: string; action: string; activePersona?: PersonaType }) =>
    emitEvent({
      eventName:  `group.${params.action}`,
      domain:     'group',
      userId:     params.userId,
      groupId:    params.groupId,
      activePersonaOverride: params.activePersona,
    }),

  contestEntry: (params: { userId?: string; contestId: string; entryType: string; activePersona?: PersonaType }) =>
    emitEvent({
      eventName:  'contest.entry',
      domain:     'contest',
      userId:     params.userId,
      assetId:    params.contestId,
      meta:       { entryType: params.entryType },
      activePersonaOverride: params.activePersona,
    }),
};

// ── Query / Diagnostics ───────────────────────────────────────────────────────

export function getEventLog(filters?: {
  domain?:       AnalyticsDomain;
  personaType?:  PersonaType;
  userId?:       string;
  limit?:        number;
}): PersonaAnalyticsEvent[] {
  let result = [...EVENT_LOG];

  if (filters?.domain)      result = result.filter((e) => e.domain === filters.domain);
  if (filters?.personaType) result = result.filter((e) => e.activePersona === filters.personaType);
  if (filters?.userId)      result = result.filter((e) => e.userId === filters.userId);

  result = result.slice(-(filters?.limit ?? 200));
  return result.reverse(); // most recent first
}

export function getEventSummary(): PersonaEventSummary {
  const byPersona: Record<string, number> = {};
  const byDomain:  Record<string, number> = {};

  for (const evt of EVENT_LOG) {
    byPersona[evt.activePersona] = (byPersona[evt.activePersona] ?? 0) + 1;
    byDomain[evt.domain]         = (byDomain[evt.domain]         ?? 0) + 1;
  }

  return {
    totalEvents:  EVENT_LOG.length,
    byPersona,
    byDomain,
    lastEventAt:  EVENT_LOG.at(-1)?.ts ?? null,
  };
}

export function getPersonaEventBreakdown(userId: string): Record<PersonaType, number> {
  const breakdown = {} as Record<PersonaType, number>;
  for (const evt of EVENT_LOG) {
    if (evt.userId !== userId) continue;
    breakdown[evt.activePersona] = (breakdown[evt.activePersona] ?? 0) + 1;
  }
  return breakdown;
}

// ── Dispatch (replace this stub with PostHog / Mixpanel / Amplitude) ──────────

function _dispatch(event: PersonaAnalyticsEvent): void {
  // Server-side: forward to external analytics endpoint if configured
  if (typeof window === 'undefined') {
    // TODO: POST to /api/telemetry/ingest when that route is wired
    return;
  }

  // Client-side: push to window.tmiAnalytics for debugging + future SDK
  if (typeof window !== 'undefined') {
    // @ts-expect-error intentional global for analytics debugging
    window.tmiAnalytics ??= [];
    // @ts-expect-error intentional global for analytics debugging
    window.tmiAnalytics.push(event);
  }
}
