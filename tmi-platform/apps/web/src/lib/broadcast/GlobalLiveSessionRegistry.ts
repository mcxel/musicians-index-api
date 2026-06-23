/**
 * GlobalLiveSessionRegistry
 * The single authoritative runtime source for all live creator sessions.
 *
 * Every "Go Live" event writes here. Every surface (homepage rails, lobby walls,
 * admin observatory, profile cards, "LIVE NOW" ticker) reads from here.
 *
 * Thin wrapper over LiveRegistry that adds the full metadata surfaces need:
 * title, thumbnail, previewUrl, category, streamHealth, stageState.
 */

import { LiveRegistry, type LiveEntry } from "./LiveRegistry";

// ── Extended session record ───────────────────────────────────────────────────

export type StreamHealth = "excellent" | "good" | "degraded" | "critical" | "unknown";
export type StageState   = "pre-show" | "live" | "intermission" | "post-show";
export type StreamCategory = "cypher" | "battle" | "concert" | "challenge" | "live" | "game" | "session";

export interface AudienceCountrySlice {
  countryCode: string;
  countryName: string;
  count: number;
}

export interface AudienceEntryEvent {
  id: string;
  at: number;
  countryCode: string;
  countryName: string;
  viewerCount: number;
  viewerId?: string;
  source?: string;
}

export interface AudienceEntryPayload {
  roomId: string;
  viewerId?: string;
  countryCode?: string;
  countryName?: string;
  source?: string;
}

export interface LiveSession {
  // Identity
  userId:        string;
  displayName:   string;
  avatarUrl:     string | null;
  performerTier: "free" | "silver" | "gold" | "platinum" | "diamond";

  // Stream
  title:         string;
  category:      StreamCategory;
  roomId:        string;
  previewUrl:    string | null;
  thumbnailUrl:  string | null;

  // State
  stageState:    StageState;
  streamHealth:  StreamHealth;
  viewerCount:   number;
  tipTotal:      number;

  // Meta
  privacy:       "PUBLIC" | "PAID_ENTRY" | "INVITE_ONLY";
  entryPriceUsd: number | null;
  accentColor:   string;
  startedAt:     number;
  lastPingAt:    number;

  // Telemetry
  bitrateKbps:      number;
  droppedFramesPct: number;
  rttMs:            number;
  audioOk:          boolean;

  // Audience pulse telemetry
  audienceCountries: AudienceCountrySlice[];
  recentAudienceEntries: AudienceEntryEvent[];
  lastAudienceEntryAt: number | null;
}

export interface LivePingPayload {
  viewerCount?: number;
  stageState?: StageState;
  bitrateKbps?: number;
  droppedFramesPct?: number;
  rttMs?: number;
  audioOk?: boolean;
}

// ── Internal store ────────────────────────────────────────────────────────────

const sessions = new Map<string, LiveSession>();
const handlers = new Set<(sessions: LiveSession[]) => void>();

const ACCENT_POOL = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#00FF88", "#FF6B35", "#38bdf8", "#c084fc"];

const MAX_AUDIENCE_COUNTRIES = 8;
const MAX_AUDIENCE_ENTRIES = 12;
const AUDIENCE_DUPLICATE_WINDOW_MS = 20_000;

function pickAccent(userId: string): string {
  const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ACCENT_POOL[hash % ACCENT_POOL.length] ?? "#00FFFF";
}

function normalizeCountryCode(code?: string): string {
  const trimmed = (code ?? "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
  return "ZZ";
}

function normalizeCountryName(name: string | undefined, countryCode: string): string {
  const trimmed = (name ?? "").trim();
  if (trimmed.length > 0) return trimmed;
  return countryCode === "ZZ" ? "Unknown" : countryCode;
}

function broadcast(): void {
  const all = getActiveSessions();
  for (const h of handlers) {
    try { h(all); } catch { /* ignore */ }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface GoLivePayload {
  userId:        string;
  displayName:   string;
  title:         string;
  category:      StreamCategory;
  roomId:        string;
  avatarUrl?:    string;
  previewUrl?:   string;
  thumbnailUrl?: string;
  privacy?:      LiveSession["privacy"];
  entryPriceUsd?: number;
  accentColor?:  string;
  performerTier?: LiveSession["performerTier"];
}

export function registerLiveSession(payload: GoLivePayload): LiveSession {
  const session: LiveSession = {
    userId:        payload.userId,
    displayName:   payload.displayName,
    avatarUrl:     payload.avatarUrl ?? null,
    performerTier: payload.performerTier ?? "free",
    title:         payload.title,
    category:      payload.category,
    roomId:        payload.roomId,
    previewUrl:    payload.previewUrl ?? null,
    thumbnailUrl:  payload.thumbnailUrl ?? null,
    stageState:    "live",
    streamHealth:  "unknown",
    viewerCount:   0,
    tipTotal:      0,
    privacy:       payload.privacy ?? "PUBLIC",
    entryPriceUsd: payload.entryPriceUsd ?? null,
    accentColor:   payload.accentColor ?? pickAccent(payload.userId),
    startedAt:     Date.now(),
    lastPingAt:    Date.now(),
    bitrateKbps:      0,
    droppedFramesPct: 0,
    rttMs:            0,
    audioOk:          true,
    audienceCountries: [],
    recentAudienceEntries: [],
    lastAudienceEntryAt: null,
  };

  sessions.set(payload.userId, session);

  // Also register in LiveRegistry for backward-compat surfaces
  LiveRegistry.register({
    userId:      payload.userId,
    displayName: payload.displayName,
    genre:       payload.category,
    role:        "performer",
    avatarUrl:   payload.avatarUrl,
    viewerCount: 0,
    roomId:      payload.roomId,
  });

  broadcast();
  return session;
}

export function endLiveSession(userId: string): void {
  sessions.delete(userId);
  LiveRegistry.unregister(userId);
  broadcast();
}

export function pingSession(userId: string): void {
  const s = sessions.get(userId);
  if (s) {
    s.lastPingAt = Date.now();
    broadcast();
  }
}

export function pingSessionWithTelemetry(userId: string, payload: LivePingPayload = {}): void {
  const s = sessions.get(userId);
  if (!s) return;

  s.lastPingAt = Date.now();

  if (typeof payload.viewerCount === 'number' && Number.isFinite(payload.viewerCount)) {
    const nextViewerCount = Math.max(0, Math.round(payload.viewerCount));
    const delta = nextViewerCount - s.viewerCount;
    s.viewerCount = nextViewerCount;
    if (delta !== 0) {
      LiveRegistry.incrementViewers(userId, delta);
    }
  }

  if (payload.stageState) {
    s.stageState = payload.stageState;
  }

  if (typeof payload.bitrateKbps === 'number' && Number.isFinite(payload.bitrateKbps)) {
    s.bitrateKbps = Math.max(0, Math.round(payload.bitrateKbps));
  }
  if (typeof payload.droppedFramesPct === 'number' && Number.isFinite(payload.droppedFramesPct)) {
    s.droppedFramesPct = Math.max(0, Math.min(100, payload.droppedFramesPct));
  }
  if (typeof payload.rttMs === 'number' && Number.isFinite(payload.rttMs)) {
    s.rttMs = Math.max(0, Math.round(payload.rttMs));
  }
  if (typeof payload.audioOk === 'boolean') {
    s.audioOk = payload.audioOk;
  }

  // Derive stream health from telemetry when available
  if (s.rttMs > 4500 || s.droppedFramesPct > 20 || s.bitrateKbps < 250) {
    s.streamHealth = 'critical';
  } else if (s.rttMs > 2500 || s.droppedFramesPct > 10 || s.bitrateKbps < 500) {
    s.streamHealth = 'degraded';
  } else if (s.rttMs > 1200 || s.droppedFramesPct > 3 || s.bitrateKbps < 900) {
    s.streamHealth = 'good';
  } else {
    s.streamHealth = 'excellent';
  }

  broadcast();
}

export function updateStreamHealth(userId: string, health: StreamHealth): void {
  const s = sessions.get(userId);
  if (s) { s.streamHealth = health; broadcast(); }
}

export function updateViewerCount(userId: string, count: number): void {
  const s = sessions.get(userId);
  if (s) {
    const delta = count - s.viewerCount;
    s.viewerCount = count;
    LiveRegistry.incrementViewers(userId, delta);
    broadcast();
  }
}

export function addTip(userId: string, amount: number): void {
  const s = sessions.get(userId);
  if (s) { s.tipTotal += amount; broadcast(); }
}

export function updateStageState(userId: string, state: StageState): void {
  const s = sessions.get(userId);
  if (s) { s.stageState = state; broadcast(); }
}

export function registerAudienceEntry(payload: AudienceEntryPayload): LiveSession | null {
  const session = Array.from(sessions.values()).find((s) => s.roomId === payload.roomId);
  if (!session) return null;

  const now = Date.now();
  const viewerId = payload.viewerId?.trim();
  if (viewerId) {
    const duplicate = session.recentAudienceEntries.find(
      (entry) => entry.viewerId === viewerId && now - entry.at < AUDIENCE_DUPLICATE_WINDOW_MS,
    );
    if (duplicate) return session;
  }

  const countryCode = normalizeCountryCode(payload.countryCode);
  const countryName = normalizeCountryName(payload.countryName, countryCode);

  const idx = session.audienceCountries.findIndex((c) => c.countryCode === countryCode);
  if (idx >= 0) {
    session.audienceCountries[idx]!.count += 1;
  } else {
    session.audienceCountries.push({ countryCode, countryName, count: 1 });
  }
  session.audienceCountries = session.audienceCountries
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_AUDIENCE_COUNTRIES);

  const entry: AudienceEntryEvent = {
    id: `${payload.roomId}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    at: now,
    countryCode,
    countryName,
    viewerCount: session.viewerCount,
    viewerId,
    source: payload.source,
  };

  session.recentAudienceEntries = [entry, ...session.recentAudienceEntries].slice(0, MAX_AUDIENCE_ENTRIES);
  session.lastAudienceEntryAt = now;
  broadcast();
  return session;
}

export function getSession(userId: string): LiveSession | null {
  return sessions.get(userId) ?? null;
}

export function getActiveSessions(): LiveSession[] {
  const staleMs = 120_000; // evict sessions that haven't pinged in 2 min
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastPingAt > staleMs) {
      sessions.delete(id);
      LiveRegistry.unregister(id);
    }
  }
  // Sort: highest viewer count first; tie-break by newest startedAt (whoever went live most recently wins)
  return Array.from(sessions.values()).sort((a, b) => {
    if (b.viewerCount !== a.viewerCount) return b.viewerCount - a.viewerCount;
    return b.startedAt - a.startedAt;
  });
}

export function getSessionsByCategory(category: StreamCategory): LiveSession[] {
  return getActiveSessions().filter((s) => s.category === category);
}

export function getSessionCount(): number {
  return getActiveSessions().length;
}

export function onSessionsChanged(handler: (sessions: LiveSession[]) => void): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

// Merge in legacy LiveRegistry entries so existing code paths still appear here
export function getSeedSessions(): LiveSession[] {
  const registryUsers = LiveRegistry.getLiveUsers();
  const knownIds = new Set(sessions.keys());
  return registryUsers
    .filter((e) => !knownIds.has(e.userId) && e.role !== "fan")
    .map((e): LiveSession => ({
      userId:        e.userId,
      displayName:   e.displayName,
      avatarUrl:     e.avatarUrl ?? null,
      performerTier: "free",
      title:         `${e.displayName} — Live`,
      category:      (e.genre as StreamCategory) ?? "live",
      roomId:        e.roomId ?? `room-${e.userId}`,
      previewUrl:    null,
      thumbnailUrl:  null,
      stageState:    "live",
      streamHealth:  "unknown",
      viewerCount:   e.viewerCount,
      tipTotal:      0,
      privacy:       "PUBLIC",
      entryPriceUsd: null,
      accentColor:   pickAccent(e.userId),
      startedAt:     e.startedAt,
      lastPingAt:    e.startedAt,
      bitrateKbps:      0,
      droppedFramesPct: 0,
      rttMs:            0,
      audioOk:          true,
      audienceCountries: [],
      recentAudienceEntries: [],
      lastAudienceEntryAt: null,
    }));
}

export function getAllSessions(): LiveSession[] {
  return [...getActiveSessions(), ...getSeedSessions()];
}
