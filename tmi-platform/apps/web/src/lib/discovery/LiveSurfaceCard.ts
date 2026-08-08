/**
 * LiveSurfaceCard — normalized projection DTO for Live Discovery / Lobby Wall.
 *
 * Projection layer over GlobalLiveSessionRegistry + LiveDiscoveryRecord.
 * Not a parallel live engine. Not a Canonical Event Registry fiction.
 *
 * Rule 20: never invent audience / heat / sponsor / prize signals.
 * Optional fields stay undefined unless a real publisher supplies them.
 */

import type { LiveSession, StageState, StreamCategory, StreamHealth } from "@/lib/broadcast/GlobalLiveSessionRegistry";
import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";

// ── State / runtime enums (validated — never blind `as`) ─────────────────────

export const LIVE_SURFACE_STATES = [
  "pre_show",
  "live",
  "intermission",
  "starting",
  "ended",
  "unknown",
] as const;

export type LiveSurfaceState = (typeof LIVE_SURFACE_STATES)[number];

export const LIVE_SURFACE_RUNTIME_TYPES = [
  "live",
  "battle",
  "cypher",
  "challenge",
  "concert",
  "game",
  "session",
  "fan_lobby",
  "dance",
  "comedy",
  "dj",
] as const;

export type LiveSurfaceRuntimeType = (typeof LIVE_SURFACE_RUNTIME_TYPES)[number];

export type LiveSurfaceJoinKind = "lobby_entry" | "watch" | "gated";

export interface LiveSurfaceJoinAction {
  href: string;
  kind: LiveSurfaceJoinKind;
}

export const OBSERVATORY_HEALTH_STATUSES = [
  "excellent",
  "good",
  "degraded",
  "critical",
  "unknown",
] as const;

export type ObservatoryHealthStatus = (typeof OBSERVATORY_HEALTH_STATUSES)[number];

/**
 * Normalized live tile for Lobby Wall / Live Discovery surfaces.
 * heatLevel / momentumScore / sponsorCampaignId / giveawayState are optional
 * and MUST remain unset unless a real upstream signal exists (deferred providers).
 */
export interface LiveSurfaceCard {
  eventId: string;
  runtimeType: LiveSurfaceRuntimeType;
  roomId: string;
  title: string;
  subtitle: string;
  hostAccountId: string;
  performerIds: string[];
  state: LiveSurfaceState;
  audienceCount: number;
  queueLength?: number;
  /** Deferred — only set when a real momentum publisher exists. */
  momentumScore?: number;
  /** Deferred — only set when a real heat publisher exists. */
  heatLevel?: number;
  country?: string;
  /** Deferred — only set when a real sponsor campaign is attached. */
  sponsorCampaignId?: string;
  /** Deferred — only set when a real giveaway runtime publishes state. */
  giveawayState?: string;
  previewMediaUrl: string | null;
  countdownSeconds?: number;
  joinAction: LiveSurfaceJoinAction;
  observatoryHealthStatus?: ObservatoryHealthStatus;
  /** Light discovery score from real signals only (isLive / audience / freshness). */
  discoveryScore?: number;
  accentColor?: string;
  startedAt?: number;
  updatedAt?: number;
}

/**
 * Thin alias — consolidates projection naming without inventing a new registry.
 * Prefer projecting from GlobalLiveSessionRegistry + DiscoveryBus publishers.
 */
export type CanonicalLiveEvent = LiveSurfaceCard;

// ── Deferred weight providers (documented — not invented) ────────────────────

/**
 * Weight providers intentionally NOT wired in Phase 5.3A:
 * - heatLevelProvider — no honest heat telemetry on discovery tiles yet
 * - prizePoolProvider — Rule 23 cash/prize gating; never fabricate prize labels
 * - sponsorCampaignProvider — requires real SponsorRegistry campaign ↔ room bind
 * - giveawayStateProvider — no giveaway runtime publishing into discovery yet
 * - momentumScoreProvider — SuperFanMomentumEngine is fan-scoped, not room discovery
 *
 * Until those publish real values, leave the optional fields undefined.
 */
export const DEFERRED_LIVE_SURFACE_WEIGHT_PROVIDERS = [
  "heatLevelProvider",
  "prizePoolProvider",
  "sponsorCampaignProvider",
  "giveawayStateProvider",
  "momentumScoreProvider",
] as const;

// ── Validators / mappers ─────────────────────────────────────────────────────

export function isLiveSurfaceState(value: unknown): value is LiveSurfaceState {
  return typeof value === "string" && (LIVE_SURFACE_STATES as readonly string[]).includes(value);
}

export function isLiveSurfaceRuntimeType(value: unknown): value is LiveSurfaceRuntimeType {
  return typeof value === "string" && (LIVE_SURFACE_RUNTIME_TYPES as readonly string[]).includes(value);
}

export function isObservatoryHealthStatus(value: unknown): value is ObservatoryHealthStatus {
  return typeof value === "string" && (OBSERVATORY_HEALTH_STATUSES as readonly string[]).includes(value);
}

/** Map GlobalLiveSessionRegistry StageState → LiveSurfaceState. */
export function mapStageStateToLiveSurface(stage: StageState | string | null | undefined): LiveSurfaceState {
  const s = String(stage ?? "").trim().toLowerCase().replace(/_/g, "-");
  if (s === "pre-show" || s === "preshow" || s === "pre_show") return "pre_show";
  if (s === "live") return "live";
  if (s === "intermission") return "intermission";
  if (s === "starting" || s === "starting-soon" || s === "starting_soon") return "starting";
  if (s === "post-show" || s === "postshow" || s === "post_show" || s === "ended" || s === "offline") {
    return "ended";
  }
  return "unknown";
}

/** Map stream / discovery category → LiveSurfaceRuntimeType. */
export function mapCategoryToRuntimeType(
  category: StreamCategory | string | null | undefined,
): LiveSurfaceRuntimeType {
  const c = String(category ?? "live").toLowerCase().replace(/_/g, "-");
  if (c === "battle" || c === "battles" || c === "mini-battle") return "battle";
  if (c === "cypher" || c === "cyphers" || c === "mini-cypher") return "cypher";
  if (c === "challenge" || c === "challenges" || c === "mini-challenge") return "challenge";
  if (
    c === "concert" ||
    c === "concerts" ||
    c === "mini-concert" ||
    c === "world-concert"
  ) {
    return "concert";
  }
  if (c === "game" || c === "games" || c === "game-show" || c === "session") {
    return c === "session" ? "session" : "game";
  }
  if (c === "fan-lobby" || c === "fan-lobbies" || c === "fan_lobbies") return "fan_lobby";
  if (c === "lounge" || c === "lounges" || c === "conversation") return "session";
  if (c === "listening" || c === "playlist" || c === "radio") return "session";
  if (c === "dance" || c === "dance-party" || c === "world-dance-party") return "dance";
  if (c === "comedy") return "comedy";
  if (c === "dj" || c === "djs") return "dj";
  if (c === "live" || c === "live-now" || c === "live_now") return "live";
  return "live";
}

export function mapStreamHealthToObservatory(
  health: StreamHealth | string | null | undefined,
): ObservatoryHealthStatus {
  const h = String(health ?? "unknown").trim().toLowerCase();
  if (isObservatoryHealthStatus(h)) return h;
  return "unknown";
}

function resolveJoinKind(opts: {
  joinGate?: string | null;
  isLive: boolean;
}): LiveSurfaceJoinKind {
  const gate = String(opts.joinGate ?? "none").toLowerCase();
  if (gate === "ticket" || gate === "invite" || gate === "age" || gate === "paid") {
    return "gated";
  }
  return opts.isLive ? "lobby_entry" : "watch";
}

function defaultJoinHref(roomId: string): string {
  return `/live/rooms/${encodeURIComponent(roomId)}?from=live-lobby-wall`;
}

// ── Light discovery score (real signals only) ────────────────────────────────

const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Simple score from signals that already exist on the card:
 * live state, honest audienceCount, freshness of startedAt.
 * Does NOT invent heat / prize / sponsor weights.
 */
export function computeLiveSurfaceDiscoveryScore(card: Pick<
  LiveSurfaceCard,
  "state" | "audienceCount" | "startedAt"
>): number {
  let score = 0;

  if (card.state === "live") score += 50;
  else if (card.state === "starting" || card.state === "pre_show") score += 25;
  else if (card.state === "intermission") score += 20;

  const audience = Math.max(0, Math.round(card.audienceCount ?? 0));
  score += Math.min(audience, 100) * 0.35;

  if (typeof card.startedAt === "number" && Number.isFinite(card.startedAt)) {
    const age = Date.now() - card.startedAt;
    if (age >= 0 && age < RECENT_WINDOW_MS) {
      // Newer within 48h ranks higher (Rule 11 freshness)
      const freshness = 1 - age / RECENT_WINDOW_MS;
      score += freshness * 20;
    }
  }

  return Math.round(score * 10) / 10;
}

export function sortLiveSurfaceCardsByDiscoveryScore(
  cards: readonly LiveSurfaceCard[],
): LiveSurfaceCard[] {
  return [...cards].sort((a, b) => {
    const sa = a.discoveryScore ?? computeLiveSurfaceDiscoveryScore(a);
    const sb = b.discoveryScore ?? computeLiveSurfaceDiscoveryScore(b);
    if (sb !== sa) return sb - sa;
    const aStart = a.startedAt ?? 0;
    const bStart = b.startedAt ?? 0;
    return bStart - aStart;
  });
}

// ── Projectors (real sources only) ───────────────────────────────────────────

/** Project GlobalLiveSessionRegistry LiveSession → LiveSurfaceCard. */
export function projectLiveSessionToSurfaceCard(
  session: LiveSession,
): LiveSurfaceCard | null {
  const roomId = (session.roomId ?? "").trim();
  if (!roomId) return null;

  const state = mapStageStateToLiveSurface(session.stageState);
  const isLive = state === "live" || state === "intermission";
  const topCountry = session.audienceCountries?.[0]?.countryCode;
  const country =
    topCountry && topCountry !== "ZZ" ? topCountry.toUpperCase() : undefined;
  const paid =
    session.privacy === "PAID_ENTRY" ||
    (typeof session.entryPriceUsd === "number" && session.entryPriceUsd > 0);
  const href = defaultJoinHref(roomId);
  const hostAccountId = (session.userId ?? "").trim();

  const card: LiveSurfaceCard = {
    eventId: roomId,
    runtimeType: mapCategoryToRuntimeType(session.category),
    roomId,
    title: (session.title || `${session.displayName || "Live"} — Live`).trim(),
    subtitle: sanitizeWallHostLabel(session.displayName || "Host", {
      hostUserId: hostAccountId,
    }),
    hostAccountId,
    performerIds: hostAccountId ? [hostAccountId] : [],
    state,
    audienceCount: Math.max(0, Math.round(session.viewerCount ?? 0)),
    country,
    previewMediaUrl: session.previewUrl ?? session.thumbnailUrl ?? session.avatarUrl ?? null,
    joinAction: {
      href,
      kind: resolveJoinKind({ joinGate: paid ? "paid" : "none", isLive }),
    },
    observatoryHealthStatus: mapStreamHealthToObservatory(session.streamHealth),
    accentColor: session.accentColor,
    startedAt: session.startedAt,
    updatedAt: session.lastPingAt,
    // momentum / heat / sponsor / giveaway intentionally omitted (deferred)
  };

  card.discoveryScore = computeLiveSurfaceDiscoveryScore(card);
  return card;
}

/** Project existing LiveDiscoveryRecord → LiveSurfaceCard. */
export function projectDiscoveryRecordToSurfaceCard(
  record: LiveDiscoveryRecord,
): LiveSurfaceCard | null {
  const roomId = (record.roomId ?? "").trim();
  if (!roomId) return null;

  const state: LiveSurfaceState = record.isLive ? "live" : "ended";
  const country =
    record.countryCode && record.countryCode !== "ZZ"
      ? record.countryCode.toUpperCase()
      : undefined;
  const href =
    (record.joinRoute ?? "").trim() || defaultJoinHref(roomId);
  const hostAccountId = (record.hostUserId ?? "").trim();

  const card: LiveSurfaceCard = {
    eventId: record.id || roomId,
    runtimeType: mapCategoryToRuntimeType(record.category),
    roomId,
    title: (record.title || "Live").trim(),
    subtitle: sanitizeWallHostLabel(record.statusLine || record.hostName || "Host", {
      hostUserId: hostAccountId,
    }),
    hostAccountId,
    performerIds: hostAccountId ? [hostAccountId] : [],
    state,
    audienceCount: Math.max(0, Math.round(record.humanViewerCount ?? 0)),
    country,
    previewMediaUrl: record.previewUrl ?? record.posterUrl ?? null,
    joinAction: {
      href,
      kind: resolveJoinKind({ joinGate: record.joinGate, isLive: record.isLive }),
    },
    accentColor: record.accentColor,
    startedAt: record.startedAt,
    updatedAt: record.updatedAt,
  };

  card.discoveryScore = computeLiveSurfaceDiscoveryScore(card);
  return card;
}

/** Batch-project sessions; drops unlistable / missing roomId. */
export function projectSessionsToSurfaceCards(
  sessions: readonly LiveSession[],
): LiveSurfaceCard[] {
  const out: LiveSurfaceCard[] = [];
  for (const s of sessions) {
    if (!s) continue;
    // INVITE_ONLY stays off public walls (same contract as DiscoveryPublisher)
    if (s.privacy === "INVITE_ONLY") continue;
    const card = projectLiveSessionToSurfaceCard(s);
    if (card) out.push(card);
  }
  return sortLiveSurfaceCardsByDiscoveryScore(out);
}

/** Batch-project discovery records. */
export function projectDiscoveryRecordsToSurfaceCards(
  records: readonly LiveDiscoveryRecord[],
): LiveSurfaceCard[] {
  const out: LiveSurfaceCard[] = [];
  for (const r of records) {
    const card = projectDiscoveryRecordToSurfaceCard(r);
    if (card) out.push(card);
  }
  return sortLiveSurfaceCardsByDiscoveryScore(out);
}

/** State badge label for UI — honest, no fake LIVE. */
export function liveSurfaceStateBadge(state: LiveSurfaceState): string {
  switch (state) {
    case "live":
      return "LIVE";
    case "pre_show":
      return "PRE-SHOW";
    case "intermission":
      return "INTERMISSION";
    case "starting":
      return "STARTING";
    case "ended":
      return "ENDED";
    default:
      return "UNKNOWN";
  }
}
