/**
 * Server-only GlobalLiveSessionRegistry persistence (Prisma/pg).
 * Never import this module from client components or shared layout code.
 */

import {
  getActiveSessions,
  getAllSessions,
  getSession,
  pingSessionWithTelemetry,
  upsertHydratedSession,
  type LiveSession,
  type LivePingPayload,
} from "./globalLiveSessionStore";
import {
  loadPersistedLiveSessions,
  persistLiveSession,
  patchPersistedLiveSession,
  removePersistedLiveSession,
} from "./liveSessionPersistence";

let hydratedFromDb = false;
let hydratePromise: Promise<void> | null = null;

/** Load durable sessions into the in-memory store (idempotent per process). */
export async function ensureHydrated(): Promise<void> {
  if (hydratedFromDb) return;
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    try {
      const durable = await loadPersistedLiveSessions();
      for (const session of durable) {
        upsertHydratedSession(session);
      }
    } catch (err) {
      console.error("[GlobalLiveSessionRegistry.server] hydrate failed", err);
    } finally {
      hydratedFromDb = true;
      hydratePromise = null;
    }
  })();
  return hydratePromise;
}

export async function getActiveSessionsDurable(): Promise<LiveSession[]> {
  await ensureHydrated();
  // Always merge durable → memory. Next.js can serve GET /api/live/go from a
  // worker that never saw the create POST; empty-only reconcile left anonymous
  // /home/3 at count=0 while the host worker already reported n+1 (Gate 3).
  try {
    const durable = await loadPersistedLiveSessions();
    for (const session of durable) {
      upsertHydratedSession(session);
    }
  } catch (err) {
    console.error("[GlobalLiveSessionRegistry.server] reconcile failed", err);
  }
  return getActiveSessions();
}

export async function getAllSessionsDurable(): Promise<LiveSession[]> {
  await getActiveSessionsDurable();
  return getAllSessions();
}

export async function persistSessionNow(session: LiveSession): Promise<void> {
  await persistLiveSession(session);
}

export async function removeSessionNow(userId: string): Promise<void> {
  await removePersistedLiveSession(userId);
}

/** API heartbeat — updates in-memory store and durable patch. */
export function pingSessionWithTelemetryPersisted(
  userId: string,
  payload: LivePingPayload = {},
): void {
  pingSessionWithTelemetry(userId, payload);
  const s = getSession(userId);
  if (!s) return;
  void patchPersistedLiveSession(userId, {
    lastPingAt: s.lastPingAt,
    viewerCount: s.viewerCount,
    stageState: s.stageState,
    streamHealth: s.streamHealth,
    bitrateKbps: s.bitrateKbps,
    droppedFramesPct: s.droppedFramesPct,
    rttMs: s.rttMs,
    audioOk: s.audioOk,
  }).catch(() => {});
}
