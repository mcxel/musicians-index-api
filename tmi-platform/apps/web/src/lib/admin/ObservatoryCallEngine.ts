/**
 * Observatory ↔ Observatory video call signaling (admin triad).
 * Call sessions are keyed by callId — concurrent calls across pairs are supported.
 * Presence is per-user with TTL (honest offline when heartbeat expires).
 *
 * WebRTC media signaling reuses POST/GET /api/rtc/signal with roomId = callId.
 */

export type ObservatoryCallStatus =
  | "ringing"
  | "accepted"
  | "connected"
  | "declined"
  | "missed"
  | "ended"
  | "offline";

export type ObservatoryCallSession = {
  callId: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  status: ObservatoryCallStatus;
  createdAt: number;
  updatedAt: number;
  /** Optional thread to post invite into */
  threadId?: string;
};

export type PresenceEntry = {
  userId: string;
  displayName: string;
  lastSeen: number;
  path?: string;
};

const CALL_TTL_MS = 10 * 60 * 1000;
const PRESENCE_TTL_MS = 45_000;

const calls = new Map<string, ObservatoryCallSession>();
const presence = new Map<string, PresenceEntry>();

function now() {
  return Date.now();
}

function prune(): void {
  const t = now();
  for (const [id, c] of calls) {
    if (t - c.updatedAt > CALL_TTL_MS) calls.delete(id);
  }
  for (const [id, p] of presence) {
    if (t - p.lastSeen > PRESENCE_TTL_MS * 4) presence.delete(id);
  }
}

export function heartbeatPresence(opts: {
  userId: string;
  displayName: string;
  path?: string;
}): PresenceEntry {
  prune();
  const entry: PresenceEntry = {
    userId: opts.userId,
    displayName: opts.displayName,
    lastSeen: now(),
    path: opts.path,
  };
  presence.set(opts.userId, entry);
  return entry;
}

export function isUserOnline(userId: string): boolean {
  prune();
  const p = presence.get(userId);
  if (!p) return false;
  return now() - p.lastSeen <= PRESENCE_TTL_MS;
}

export function listOnlinePresence(): PresenceEntry[] {
  prune();
  const t = now();
  return Array.from(presence.values()).filter((p) => t - p.lastSeen <= PRESENCE_TTL_MS);
}

export function createCall(opts: {
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  threadId?: string;
}): ObservatoryCallSession {
  prune();
  if (opts.callerId === opts.calleeId) {
    throw new Error("Cannot call yourself");
  }
  const callId = `obscall-${[opts.callerId, opts.calleeId].sort().join("-")}-${now()}`;
  const online = isUserOnline(opts.calleeId);
  const session: ObservatoryCallSession = {
    callId,
    callerId: opts.callerId,
    callerName: opts.callerName,
    calleeId: opts.calleeId,
    calleeName: opts.calleeName,
    status: online ? "ringing" : "offline",
    createdAt: now(),
    updatedAt: now(),
    threadId: opts.threadId,
  };
  calls.set(callId, session);
  return session;
}

export function getCall(callId: string): ObservatoryCallSession | null {
  prune();
  return calls.get(callId) ?? null;
}

export function updateCallStatus(
  callId: string,
  status: ObservatoryCallStatus,
  actorId: string,
): ObservatoryCallSession | null {
  prune();
  const c = calls.get(callId);
  if (!c) return null;
  if (actorId !== c.callerId && actorId !== c.calleeId) return null;
  c.status = status;
  c.updatedAt = now();
  calls.set(callId, c);
  return c;
}

/** Incoming ringing calls for a user (callee). */
export function listIncomingFor(userId: string): ObservatoryCallSession[] {
  prune();
  return Array.from(calls.values()).filter(
    (c) => c.calleeId === userId && (c.status === "ringing" || c.status === "accepted"),
  );
}

/** Active / ringing calls involving user (either side). */
export function listActiveFor(userId: string): ObservatoryCallSession[] {
  prune();
  return Array.from(calls.values()).filter(
    (c) =>
      (c.callerId === userId || c.calleeId === userId) &&
      (c.status === "ringing" || c.status === "accepted" || c.status === "connected"),
  );
}
