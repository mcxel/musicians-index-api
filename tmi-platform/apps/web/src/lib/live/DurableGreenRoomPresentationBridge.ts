/**
 * Binds Anti-Gravity Green Room presentation to Claude durable challenger-queue.
 * Presentation never invents queue positions. Server STATE/PASS/LEAVE responses win.
 */

import {
  enterPerformerSpectatorMode,
  getAuthorizedGreenRoomView,
  openGreenRoom,
  passGreenRoomTurnToTail,
  type AuthorizedGreenRoomViewResult,
} from "@/lib/live/greenRoomEngine";

export const DURABLE_GREEN_ROOM_PRESENTATION_BRIDGE_ID =
  "DURABLE_GREEN_ROOM_PRESENTATION_BRIDGE_v1" as const;

export const PRESENTATION_QUEUE_IS_AUTHORITY = 0 as const;
export const PERFORMER_ROLE_ALONE_GRANTS_BACKSTAGE = 0 as const;

export type DurableQueueRow = {
  userId?: string;
  performerId?: string;
  position?: number;
  status?: string;
  cameraConsent?: boolean;
};

export type DurableQueueResponse = {
  ok: boolean;
  error?: string;
  /** QueueSelfView fields from durable STATE */
  entryId?: string | null;
  status?: string;
  position?: number | null;
  cameraConsent?: boolean;
  serverConfirmed?: boolean;
  /** Server-authoritative Cypher turn length (seconds). null for non-Cypher rooms. */
  cypherTurnSeconds?: number | null;
  /** SAVED = host persisted 30/45/60; DEFAULT = Cypher profile default (60); null = non-Cypher. */
  cypherTurnSource?: "SAVED" | "DEFAULT" | null;
  entries?: DurableQueueRow[];
  lineup?: DurableQueueRow[];
  migrationNotApplied?: boolean;
};

function rowsFromResponse(data: DurableQueueResponse): Array<{ performerId: string; position: number }> {
  const raw = data.entries ?? data.lineup ?? [];
  return raw
    .map((r, i) => ({
      performerId: String(r.userId ?? r.performerId ?? ""),
      position: typeof r.position === "number" ? r.position : i,
    }))
    .filter((r) => r.performerId.length > 0);
}

export async function fetchDurableQueueState(roomId: string): Promise<DurableQueueResponse> {
  try {
    const res = await fetch(
      `/api/live/challenger-queue?roomId=${encodeURIComponent(roomId)}`,
      { credentials: "include", cache: "no-store" },
    );
    const data = (await res.json()) as DurableQueueResponse;
    if (res.status === 503 || data.error === "MIGRATION_NOT_APPLIED") {
      return { ok: false, error: "MIGRATION_NOT_APPLIED", migrationNotApplied: true };
    }
    return { ...data, ok: res.ok && data.ok !== false };
  } catch {
    return { ok: false, error: "NETWORK_OR_UNAVAILABLE" };
  }
}

export async function durablePassToTail(input: {
  roomId: string;
  venueSlug: string;
  performerId: string;
  liveSessionId?: string;
}): Promise<{
  ok: boolean;
  error?: string;
  migrationNotApplied?: boolean;
  presentationApplied: boolean;
  reason: string;
}> {
  try {
    const res = await fetch("/api/live/challenger-queue", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "PASS",
        roomId: input.roomId,
        liveSessionId: input.liveSessionId,
      }),
    });
    const data = (await res.json()) as DurableQueueResponse;
    if (res.status === 503 || data.error === "MIGRATION_NOT_APPLIED") {
      return {
        ok: false,
        error: "MIGRATION_NOT_APPLIED",
        migrationNotApplied: true,
        presentationApplied: false,
        reason: "Migration not applied — PASS not confirmed",
      };
    }
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error ?? `HTTP_${res.status}`,
        presentationApplied: false,
        reason: "Durable PASS rejected",
      };
    }
    openGreenRoom(input.venueSlug);
    const lineup = rowsFromResponse(data);
    // If API only returns caller position, refetch STATE for full order.
    const confirmed =
      lineup.length > 0
        ? lineup
        : rowsFromResponse(await fetchDurableQueueState(input.roomId));
    const applied = passGreenRoomTurnToTail(
      input.venueSlug,
      input.performerId,
      confirmed.length > 0 ? confirmed : undefined,
    );
    return {
      ok: applied.ok,
      presentationApplied: applied.ok,
      reason: applied.reason,
    };
  } catch {
    return {
      ok: false,
      error: "NETWORK_OR_UNAVAILABLE",
      presentationApplied: false,
      reason: "Network error on durable PASS",
    };
  }
}

export async function durableCameraConsent(input: {
  roomId: string;
  cameraConsent: boolean;
}): Promise<DurableQueueResponse> {
  try {
    const res = await fetch("/api/live/challenger-queue", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CONSENT_CAMERA",
        roomId: input.roomId,
        cameraConsent: input.cameraConsent === true,
      }),
    });
    const data = (await res.json()) as DurableQueueResponse;
    if (res.status === 503 || data.error === "MIGRATION_NOT_APPLIED") {
      return { ok: false, error: "MIGRATION_NOT_APPLIED", migrationNotApplied: true };
    }
    return { ...data, ok: res.ok && data.ok !== false };
  } catch {
    return { ok: false, error: "NETWORK_OR_UNAVAILABLE" };
  }
}

/** Server-issued membership IDs from durable lineup (never role-inferred). */
export function extractServerMemberIds(data: DurableQueueResponse): string[] {
  const ids = new Set<string>();
  for (const r of data.entries ?? data.lineup ?? []) {
    const id = String(r.userId ?? r.performerId ?? "").trim();
    if (id) ids.add(id);
  }
  return [...ids];
}

/**
 * Private backstage media requires durable QUEUED/CALLED entryId (or host via caller).
 * ON_STAGE performers are excluded from private backstage mosaic subscriptions.
 * Performer role alone is never sufficient (PERFORMER_ROLE_ALONE_GRANTS_BACKSTAGE = 0).
 */
export function isDurablePrivateBackstageMember(data: DurableQueueResponse): boolean {
  if (!data.ok || data.migrationNotApplied) return false;
  if (!data.entryId) return false;
  const st = String(data.status ?? "").toUpperCase();
  return st === "QUEUED" || st === "CALLED";
}

export async function durableSetCypherTurn(input: {
  roomId: string;
  cypherTurnSeconds: number;
}): Promise<DurableQueueResponse> {
  try {
    const res = await fetch("/api/live/challenger-queue", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SET_CYPHER_TURN",
        roomId: input.roomId,
        cypherTurnSeconds: input.cypherTurnSeconds,
      }),
    });
    const data = (await res.json()) as DurableQueueResponse;
    if (res.status === 503 || data.error === "MIGRATION_NOT_APPLIED") {
      return { ok: false, error: "MIGRATION_NOT_APPLIED", migrationNotApplied: true };
    }
    // Prefer Claude QueueSelfView echo; only fall back to request when OK and server omitted.
    const ok = res.ok && data.ok !== false;
    return {
      ...data,
      ok,
      cypherTurnSeconds:
        typeof data.cypherTurnSeconds === "number"
          ? data.cypherTurnSeconds
          : ok
            ? input.cypherTurnSeconds
            : data.cypherTurnSeconds ?? null,
      cypherTurnSource: data.cypherTurnSource ?? (ok ? "SAVED" : null),
    };
  } catch {
    return { ok: false, error: "NETWORK_OR_UNAVAILABLE" };
  }
}

/**
 * Fan exclusion stays in presentation gate; membership must also be server-backed.
 * Pass `serverMemberIds` from durable STATE — Performer role alone is insufficient.
 */
export function authorizeGreenRoomViewWithDurableMembership(input: {
  venueSlug: string;
  viewerUserId: string;
  viewerRole: "fan" | "performer" | "artist" | "host" | "admin";
  serverMemberIds: ReadonlyArray<string>;
}): AuthorizedGreenRoomViewResult {
  enterPerformerSpectatorMode(input.venueSlug, input.viewerUserId, input.viewerRole);
  const base = getAuthorizedGreenRoomView({
    venueSlug: input.venueSlug,
    viewerUserId: input.viewerUserId,
    viewerRole: input.viewerRole,
  });
  if (input.viewerRole === "fan") return base;
  const member = input.serverMemberIds.includes(input.viewerUserId);
  if (!member && input.viewerRole !== "host" && input.viewerRole !== "admin") {
    return {
      ...base,
      ok: false,
      reason: "performer_spectator_public_only_not_in_durable_queue",
      canAccessPrivateGreenRoom: false,
      privateLineup: [],
      consentedBackstageCameraFeeds: [],
      stageDoorNextUp: null,
    };
  }
  return base;
}
