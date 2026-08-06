/**
 * DiscoveryPublisher — maps real live sessions → LiveDiscoveryRecord and
 * publishes onto DiscoveryBus. No fake rooms. humanViewerCount = humans only.
 *
 * LiveSurfaceCard is the normalized projection DTO for Lobby Wall / Live Discovery UI.
 * This publisher remains the bus feed; surfaces project via projectDiscoveryRecordToSurfaceCard
 * or projectLiveSessionToSurfaceCard (lib/discovery/LiveSurfaceCard.ts).
 */

import type { LiveSession } from "@/lib/broadcast/GlobalLiveSessionRegistry";
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
  categoryLocked?: boolean;
}

function normalizeVisibility(
  v: PublishLiveRoomInput["visibility"],
): LiveDiscoveryVisibility {
  const s = String(v ?? "public").toLowerCase();
  if (s === "friends") return "friends";
  if (s === "invite" || s === "invite_only" || s === "invite-only") return "invite";
  if (s === "private" || s === "paid_entry" || s === "paid-entry") return "private";
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

  return {
    id: roomId,
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
    joinGate: resolveJoinGate(visibility, input.entryPriceUsd, input.joinGate),
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
    categoryLocked: input.categoryLocked === true,
  };
}

/** Publish a single real room onto the bus. Returns null if unlistable. */
export function publishLiveRoom(input: PublishLiveRoomInput): LiveDiscoveryRecord | null {
  const record = toLiveDiscoveryRecord(input);
  if (!record) return null;
  DiscoveryBus.upsert(record);
  return record;
}

export function unpublishLiveRoom(roomId: string): void {
  DiscoveryBus.remove(roomId);
}

/**
 * Map GlobalLiveSessionRegistry session → discovery record.
 * Uses viewerCount as humanViewerCount only when publishers ping honest humans
 * (Instant Go Live / VenueSupportPresence contract). Never fabricates occupancy.
 */
export function liveSessionToDiscoveryRecord(session: LiveSession): LiveDiscoveryRecord | null {
  // INVITE_ONLY stays off the public wall unless a separate authorized publish path lists it
  if (session.privacy === "INVITE_ONLY") return null;

  const visibility: LiveDiscoveryVisibility = "public";
  const topCountry = session.audienceCountries?.[0]?.countryCode;
  const paid =
    session.privacy === "PAID_ENTRY" ||
    (typeof session.entryPriceUsd === "number" && session.entryPriceUsd > 0);

  return toLiveDiscoveryRecord({
    roomId: session.roomId,
    title: session.title,
    hostName: session.displayName,
    hostUserId: session.userId,
    countryCode: topCountry ?? "ZZ",
    category: session.category,
    visibility,
    humanViewerCount: Math.max(0, Math.round(session.viewerCount ?? 0)),
    posterUrl: session.thumbnailUrl ?? session.avatarUrl,
    previewUrl: session.previewUrl,
    accentColor: session.accentColor,
    joinRoute: `/live/rooms/${encodeURIComponent(session.roomId)}?from=live-lobby-wall`,
    joinGate: paid ? "paid" : "none",
    entryPriceUsd: session.entryPriceUsd,
    startedAt: session.startedAt,
    listed: true,
  });
}

/** Sync bus from an array of LiveSession (poll / SSE payload). Empty → honest empty wall. */
export function syncDiscoveryFromSessions(sessions: readonly LiveSession[]): void {
  const byId = new Map<string, LiveDiscoveryRecord>();
  for (const s of sessions) {
    if (!s?.roomId) continue;
    const rec = liveSessionToDiscoveryRecord(s);
    if (rec) byId.set(rec.id, rec);
  }
  // Permanent anchors always merge in — poll must never wipe the 24/7 wall
  const { getAnchorDiscoveryRecords } = require("@/lib/live/AnchorRoomNetwork") as typeof import("@/lib/live/AnchorRoomNetwork");
  for (const anchor of getAnchorDiscoveryRecords()) {
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

/**
 * Client poll of GET /api/live/go → DiscoveryBus.
 * Use until WebSocket discovery channel is ready. No mock seed.
 */
export function startDiscoveryPoll(opts?: {
  intervalMs?: number;
  fetchImpl?: typeof fetch;
}): () => void {
  const intervalMs = opts?.intervalMs ?? 4000;
  const fetchFn = opts?.fetchImpl ?? fetch;

  let stopped = false;

  const tick = async () => {
    if (stopped || typeof window === "undefined") return;
    try {
      const res = await fetchFn("/api/live/go", { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { sessions?: LiveSession[] };
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];
      syncDiscoveryFromSessions(sessions);
    } catch {
      /* keep last honest snapshot */
    }
  };

  void tick();
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => void tick(), intervalMs);

  return () => {
    stopped = true;
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };
}
