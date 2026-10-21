/**
 * DiscoveryPublisher — maps real live sessions → LiveDiscoveryRecord and
 * publishes onto DiscoveryBus. No fake rooms. humanViewerCount = humans only.
 *
 * LiveSurfaceCard is the normalized projection DTO for Lobby Wall / Live Discovery UI.
 * This publisher remains the bus feed; surfaces project via projectDiscoveryRecordToSurfaceCard
 * or projectLiveSessionToSurfaceCard (lib/discovery/LiveSurfaceCard.ts).
 */

import type { LiveSession } from "@/lib/broadcast/globalLiveSessionStore";
import type { TripletEventItem } from "@/lib/competition/TripleEventBroadcastEngine";
import { DiscoveryBus } from "./DiscoveryBus";
import {
  mapStreamCategoryToDiscovery,
  type LiveDiscoveryCategory,
  type LiveDiscoveryJoinGate,
  type LiveDiscoveryRecord,
  type LiveDiscoveryVisibility,
} from "./LiveDiscoveryRecord";
import {
  projectDiscoveryRecordsToSurfaceCards,
  projectSessionsToSurfaceCards,
  type LiveSurfaceCard,
} from "./LiveSurfaceCard";
import {
  mapStreamHealthToTransportHealth,
  stampDiscoveryTrust,
} from "./discoveryTrustBoundary";

export {
  mapStreamHealthToTransportHealth,
  isTransportEligibleForMosaic,
} from "./discoveryTrustBoundary";

export interface PublishLiveRoomInput {
  roomId: string;
  title: string;
  hostName: string;
  hostUserId: string;
  countryCode?: string;
  category?: string;
  visibility?: LiveDiscoveryVisibility | "PUBLIC" | "PAID_ENTRY" | "INVITE_ONLY" | "public" | "friends" | "invite" | "private";
  /** Real humans only — never support bots / BotCrowdFill */
  humanViewerCount?: number;
  posterUrl?: string | null;
  previewUrl?: string | null;
  accentColor?: string;
  joinRoute?: string;
  joinGate?: LiveDiscoveryJoinGate;
  experienceId?: string;
  entryPriceUsd?: number | null;
  startedAt?: number;
  listed?: boolean;
  statusLine?: string;
  isAnchor?: boolean;
  anchorFamily?: string;
  featuredCategory?: string;
  calloutSlots?: string[];
  categoryLocked?: boolean;
  recruiting?: boolean;
  castOverlay?: string;
  isBotOnly?: boolean;
  isTest?: boolean;
  isRehearsal?: boolean;
  isLocalPreview?: boolean;
  isAdminOnly?: boolean;
  transportHealth?: LiveDiscoveryRecord["transportHealth"];
  requiresPaidEntry?: boolean;
  sourceType?: "AUTOMATED" | "HUMAN_CREATED";
}

function normalizeVisibility(
  v: PublishLiveRoomInput["visibility"],
): LiveDiscoveryVisibility {
  const s = String(v ?? "public").toLowerCase();
  if (s === "friends") return "friends";
  if (s === "invite" || s === "invite_only" || s === "invite-only") return "invite";
  if (s === "paid_entry" || s === "paid-entry") return "public";
  if (s === "private") return "private";
  return "public";
}

function buildCategories(
  primary: LiveDiscoveryCategory,
  humanViewerCount: number,
  visibility: LiveDiscoveryVisibility,
  startedAt: number,
): LiveDiscoveryCategory[] {
  const cats = new Set<LiveDiscoveryCategory>(["live_now", "worldwide", primary]);
  if (visibility === "friends") cats.add("friends");
  if (visibility === "invite" || visibility === "private") cats.add("private_invited");
  const ageMs = Date.now() - startedAt;
  if (humanViewerCount === 0 && ageMs < 15 * 60 * 1000) cats.add("new_empty");
  return Array.from(cats);
}

function resolveJoinGate(
  visibility: LiveDiscoveryVisibility,
  entryPriceUsd?: number | null,
  explicit?: LiveDiscoveryJoinGate,
): LiveDiscoveryJoinGate {
  if (explicit) return explicit;
  if (typeof entryPriceUsd === "number" && entryPriceUsd > 0) return "paid";
  if (visibility === "invite") return "invite";
  if (visibility === "private") return "invite";
  return "none";
}

export function toLiveDiscoveryRecord(input: PublishLiveRoomInput): LiveDiscoveryRecord | null {
  const roomId = (input.roomId ?? "").trim();
  if (!roomId) return null;

  // Explicit unlist — do not publish to public walls
  if (input.listed === false) return null;

  const visibility = normalizeVisibility(input.visibility);
  const primary = mapStreamCategoryToDiscovery(input.category);
  const humanViewerCount = Math.max(0, Math.round(input.humanViewerCount ?? 0));
  const startedAt = input.startedAt ?? Date.now();
  const joinRoute =
    input.joinRoute?.trim() ||
    `/live/rooms/${encodeURIComponent(roomId)}?from=live-lobby-wall`;

  const categories = buildCategories(primary, humanViewerCount, visibility, startedAt);
  const experienceKey = (input.experienceId ?? "live").trim() || "live";
  /** Idempotent bus key — roomId + experience identity prevents duplicate cards on reconnect. */
  const busId = `${roomId}::${experienceKey}`;

  const trust = stampDiscoveryTrust({
    isBotOnly: input.isBotOnly,
    isTest: input.isTest,
    isRehearsal: input.isRehearsal,
    isLocalPreview: input.isLocalPreview,
    isAdminOnly: input.isAdminOnly,
    transportHealth: input.transportHealth,
    requiresPaidEntry: input.requiresPaidEntry,
    category: input.category,
    visibilityRaw: String(input.visibility ?? ""),
    entryPriceUsd: input.entryPriceUsd,
    joinGate: input.joinGate,
    hostUserId: input.hostUserId,
    roomId,
    title: input.title,
  });

  return {
    id: busId,
    roomId,
    title: (input.title || `${input.hostName || "Live"} — Live`).trim(),
    hostName: (input.hostName || "Host").trim(),
    hostUserId: (input.hostUserId || "").trim(),
    countryCode: (input.countryCode ?? "ZZ").trim().toUpperCase().slice(0, 2) || "ZZ",
    category: primary,
    categories,
    visibility,
    humanViewerCount,
    posterUrl: input.posterUrl ?? null,
    previewUrl: input.previewUrl ?? null,
    previewMode: input.previewUrl ? "low_res" : input.posterUrl ? "poster" : "none",
    accentColor: input.accentColor ?? "#00FFFF",
    joinRoute,
    joinGate: trust.requiresPaidEntry
      ? "paid"
      : resolveJoinGate(visibility, input.entryPriceUsd, input.joinGate),
    isLive: true,
    isNewEmpty:
      !input.isAnchor &&
      humanViewerCount === 0 &&
      Date.now() - startedAt < 15 * 60 * 1000,
    startedAt,
    updatedAt: Date.now(),
    experienceId: input.experienceId,
    entryPriceUsd: input.entryPriceUsd ?? null,
    statusLine: input.statusLine?.trim() || undefined,
    isAnchor: input.isAnchor === true,
    anchorFamily: input.anchorFamily,
    featuredCategory: input.featuredCategory,
    calloutSlots: input.calloutSlots?.length ? [...input.calloutSlots] : undefined,
    categoryLocked: input.categoryLocked === true,
    recruiting: input.recruiting === true,
    castOverlay: input.castOverlay?.trim() || undefined,
    sourceType:
      input.sourceType ??
      (input.isAnchor || input.isBotOnly ? "AUTOMATED" : "HUMAN_CREATED"),
    ...trust,
  };
}

/** Publish a single real room onto the bus. Returns null if unlistable. */
export function publishLiveRoom(input: PublishLiveRoomInput): LiveDiscoveryRecord | null {
  const record = toLiveDiscoveryRecord(input);
  if (!record) return null;
  DiscoveryBus.upsert(record);
  return record;
}

export function unpublishLiveRoom(roomId: string, experienceId?: string): void {
  DiscoveryBus.remove(`${roomId}::${(experienceId ?? "live").trim() || "live"}`);
  // Legacy id cleanup for sessions published before composite keys
  DiscoveryBus.remove(roomId);
}

/**
 * Map GlobalLiveSessionRegistry session → discovery record.
 * Uses viewerCount as humanViewerCount only when publishers ping honest humans
 * (Instant Go Live / VenueSupportPresence contract). Never fabricates occupancy.
 */
function isRegularGoLive(session: LiveSession): boolean {
  return session.category === "live" || session.category === "session" || session.category === "fan-lobby";
}

export function liveSessionToDiscoveryRecord(session: LiveSession): LiveDiscoveryRecord | null {
  // INVITE_ONLY stays off the public wall unless a separate authorized publish path lists it
  if (session.privacy === "INVITE_ONLY") return null;
  if (session.audiencePrivacyMode === "private" || session.audiencePrivacyMode === "invite") return null;

  const visibility: LiveDiscoveryVisibility =
    session.audiencePrivacyMode === "friends" ? "friends" : "public";
  const topCountry = session.audienceCountries?.[0]?.countryCode;
  const paid =
    session.privacy === "PAID_ENTRY" ||
    (typeof session.entryPriceUsd === "number" && session.entryPriceUsd > 0);
  const regular = isRegularGoLive(session);
  const hostRole = session.hostRole === "FAN" || session.category === "fan-lobby" ? "FAN" : "PERFORMER";

  return toLiveDiscoveryRecord({
    roomId: session.roomId,
    title: session.title,
    hostName: session.displayName,
    hostUserId: session.userId,
    countryCode: topCountry ?? "ZZ",
    category: regular ? (hostRole === "FAN" ? "fans-live" : "performers-live") : session.category,
    experienceId: regular ? "REGULAR_GO_LIVE" : undefined,
    sourceType: "HUMAN_CREATED",
    humanViewerCount: Math.max(0, Math.round(session.viewerCount ?? 0)),
    posterUrl: session.thumbnailUrl ?? session.avatarUrl,
    previewUrl: session.previewUrl,
    accentColor: session.accentColor,
    joinRoute:
      session.category === "fan-lobby"
        ? `/hub/fan?watch=${encodeURIComponent(session.roomId)}&from=live-lobby-wall`
        : `/hub/performer?watch=${encodeURIComponent(session.roomId)}&from=live-lobby-wall`,
    joinGate: paid ? "paid" : "none",
    entryPriceUsd: session.entryPriceUsd,
    startedAt: session.startedAt,
    listed: true,
    requiresPaidEntry: paid,
    visibility: paid ? "PAID_ENTRY" : visibility,
    transportHealth: mapStreamHealthToTransportHealth(session.streamHealth),
    isBotOnly:
      session.userId.startsWith("bot-") ||
      session.userId.startsWith("tmi-bot") ||
      session.userId.startsWith("system-host"),
    isTest: session.roomId.includes("test") || session.title.toLowerCase().includes("[test]"),
  });
}

export function tripletEventsToDiscoveryRecords(events: readonly TripletEventItem[], now = Date.now()): LiveDiscoveryRecord[] {
  const records: LiveDiscoveryRecord[] = [];
  for (const event of events) {
    if (!event.roomId || now >= event.expiresAt) continue;
    const record = toLiveDiscoveryRecord({
      roomId: event.roomId,
      title: event.title,
      hostName: "TMI EVENT",
      hostUserId: "tmi-automated",
      category: "events",
      experienceId: event.id,
      joinRoute: event.joinRoute,
      humanViewerCount: 0,
      startedAt: event.startsAt,
      recruiting: true,
      castOverlay: "RECRUITING · WAITING",
      isBotOnly: true,
      sourceType: "AUTOMATED",
      visibility: "public",
    });
    if (record) records.push(record);
  }
  return records;
}

/** Sync bus from live sessions plus optional automated-event records. Null extras keeps the previous automated set. */
export function syncDiscoveryFromSessions(
  sessions: readonly LiveSession[],
  automatedExtras: readonly LiveDiscoveryRecord[] | null = null,
): void {
  const byId = new Map<string, LiveDiscoveryRecord>();
  for (const s of sessions) {
    if (!s?.roomId) continue;
    const rec = liveSessionToDiscoveryRecord(s);
    if (rec) byId.set(rec.id, rec);
  }
  // Permanent anchors always merge in — poll must never wipe the 24/7 wall.
  // These deferred imports break the publisher ↔ automated-network module cycle.
  // A failed anchor import must not block the human sessions already in byId.
  try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAnchorDiscoveryRecords } = require("@/lib/live/AnchorRoomNetwork") as typeof import("@/lib/live/AnchorRoomNetwork");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAllGenreDiscoveryRecords } = require("@/lib/live/performerGenreRoomNetwork") as typeof import("@/lib/live/performerGenreRoomNetwork");
  for (const anchor of [...getAnchorDiscoveryRecords(), ...getAllGenreDiscoveryRecords()]) {
    const existing = byId.get(anchor.id);
    if (existing) {
      byId.set(anchor.id, {
        ...anchor,
        humanViewerCount: Math.max(anchor.humanViewerCount, existing.humanViewerCount),
        hostName: existing.hostName && existing.hostName !== "Host" ? existing.hostName : anchor.hostName,
        previewUrl: existing.previewUrl ?? anchor.previewUrl,
        posterUrl: existing.posterUrl ?? anchor.posterUrl,
        startedAt: Math.min(existing.startedAt, anchor.startedAt),
      });
    } else {
      byId.set(anchor.id, anchor);
    }
  }
  } catch {
    /* Anchor/genre merge is additive. Human sessions already in byId still publish. */
  }

  if (automatedExtras) {
    for (const extra of automatedExtras) {
      if (extra?.id) byId.set(extra.id, extra);
    }
  }

  // A successful session snapshot is authoritative: do not retain absent records.
  // In particular, a privacy revocation must remove a tile without waiting for rotation.
  for (const existing of DiscoveryBus.getAll()) {
    if (
      automatedExtras &&
      (existing.experienceId ?? "").startsWith("ev-") &&
      !byId.has(existing.id)
    ) {
      continue;
    }
    if (byId.has(existing.id)) {
      const polled = byId.get(existing.id)!;
      // Prefer higher honest human count when poll lags join sync
      if (existing.humanViewerCount > polled.humanViewerCount) {
        byId.set(existing.id, {
          ...polled,
          humanViewerCount: existing.humanViewerCount,
          updatedAt: Math.max(polled.updatedAt, existing.updatedAt),
        });
      }
      continue;
    }
  }

  DiscoveryBus.replaceAll([...byId.values()]);
}

/** Project sessions → LiveSurfaceCard[] without touching the bus (read-side only). */
export function projectLiveSurfaceFromSessions(
  sessions: readonly LiveSession[],
): LiveSurfaceCard[] {
  return projectSessionsToSurfaceCards(sessions);
}

/** Project current DiscoveryBus snapshot → LiveSurfaceCard[]. */
export function projectLiveSurfaceFromDiscoveryBus(): LiveSurfaceCard[] {
  return projectDiscoveryRecordsToSurfaceCards(DiscoveryBus.getAll());
}

let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollRefCount = 0;
let pollIntervalMs = 4000;
let pollFetchImpl: typeof fetch = fetch;
/** When set, skip GET /api/live/go polls so publish POST can claim an HTTP/1.1 socket. */
let pollPausedUntil = 0;
let pollInFlight = false;
let pollAbort: AbortController | null = null;

/**
 * Pause DiscoveryBus GET /api/live/go polling (hub GO LIVE publish path).
 * TelemetryTransportGovernor.pause alone is not enough — this poll hits the same origin.
 * Aborts any in-flight poll so sockets free immediately for POST /api/live/go.
 */
export function pauseDiscoveryPoll(ms = 25000): void {
  pollPausedUntil = Math.max(pollPausedUntil, Date.now() + ms);
  if (pollAbort) {
    try {
      pollAbort.abort();
    } catch {
      /* ignore */
    }
    pollAbort = null;
  }
  pollInFlight = false;
}

export function isDiscoveryPollPaused(): boolean {
  return Date.now() < pollPausedUntil;
}

/** Poll ticks use lite GET — sessions/count only; anchors merge client-side in syncDiscoveryFromSessions. */
export const DISCOVERY_POLL_URL = "/api/live/go?lite=1";
/** Full inventory (anchors + genreDiscovery) — initial wall open / explicit discovery only. */
export const DISCOVERY_FULL_URL = "/api/live/go?full=1";

async function discoveryPollTick(): Promise<void> {
  if (pollRefCount <= 0 || typeof window === "undefined") return;
  if (Date.now() < pollPausedUntil) return;
  if (pollInFlight) return;
  pollInFlight = true;
  const ac = new AbortController();
  pollAbort = ac;
  try {
    const res = await pollFetchImpl(DISCOVERY_POLL_URL, {
      credentials: "include",
      cache: "no-store",
      signal: ac.signal,
    });
    if (!res.ok) return;
    const data = (await res.json()) as { sessions?: LiveSession[] };
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    // Human rooms publish before the automated-event request. A slow or hung
    // triplet fetch must not leave the wall empty while lite already has the room.
    syncDiscoveryFromSessions(sessions, null);
    let automated: LiveDiscoveryRecord[] | null = null;
    const tripletAc = new AbortController();
    const abortTriplet = () => tripletAc.abort();
    ac.signal.addEventListener("abort", abortTriplet);
    const tripletTimer = setTimeout(abortTriplet, 2500);
    try {
      const tres = await pollFetchImpl("/api/competition/triplet-broadcast", {
        credentials: "same-origin",
        cache: "no-store",
        signal: tripletAc.signal,
      });
      if (tres.ok) {
        const body = (await tres.json()) as { ok?: boolean; events?: TripletEventItem[] };
        automated = body.ok && Array.isArray(body.events) ? tripletEventsToDiscoveryRecords(body.events) : [];
      }
    } catch {
      automated = null;
    } finally {
      clearTimeout(tripletTimer);
      ac.signal.removeEventListener("abort", abortTriplet);
    }
    if (automated) syncDiscoveryFromSessions(sessions, automated);
  } catch {
    /* keep last honest snapshot — includes abort during GO LIVE pause */
  } finally {
    if (pollAbort === ac) pollAbort = null;
    pollInFlight = false;
  }
}

/**
 * One-shot full GET (anchors + genreDiscovery) for explicit discovery opens.
 * Does not replace the lite poll interval.
 */
export async function fetchFullDiscoverySnapshot(
  fetchImpl: typeof fetch = fetch,
): Promise<LiveSession[]> {
  const res = await fetchImpl(DISCOVERY_FULL_URL, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { sessions?: LiveSession[] };
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  syncDiscoveryFromSessions(sessions);
  return sessions;
}

/**
 * Client poll of GET /api/live/go → DiscoveryBus.
 * Ref-counted so multiple useDiscoveryBus mounts share one interval
 * (unmount of one subscriber must not kill polling for the rest).
 */
export function startDiscoveryPoll(opts?: {
  intervalMs?: number;
  fetchImpl?: typeof fetch;
}): () => void {
  if (typeof opts?.intervalMs === "number" && opts.intervalMs > 0) {
    pollIntervalMs = opts.intervalMs;
  }
  if (opts?.fetchImpl) pollFetchImpl = opts.fetchImpl;

  pollRefCount += 1;
  if (!pollTimer) {
    void discoveryPollTick();
    pollTimer = setInterval(() => void discoveryPollTick(), pollIntervalMs);
  }

  return () => {
    pollRefCount = Math.max(0, pollRefCount - 1);
    if (pollRefCount === 0 && pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };
}
