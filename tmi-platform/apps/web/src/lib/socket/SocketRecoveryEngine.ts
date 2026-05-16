export type SocketState = "connected" | "disconnected" | "reconnecting" | "failed" | "idle";

export interface SocketSession {
  sessionId: string;
  roomId: string;
  userId: string;
  state: SocketState;
  connectAttempts: number;
  maxAttempts: number;
  lastPingAt?: string;
  connectedAt?: string;
  disconnectedAt?: string;
  recoveredAt?: string;
}

const sessions = new Map<string, SocketSession>();

function gen(): string {
  return `sock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createSession(userId: string, roomId: string): SocketSession {
  const session: SocketSession = {
    sessionId: gen(),
    roomId,
    userId,
    state: "idle",
    connectAttempts: 0,
    maxAttempts: 5,
  };
  sessions.set(session.sessionId, session);
  return session;
}

export function markConnected(sessionId: string): SocketSession | null {
  const s = sessions.get(sessionId);
  if (!s) return null;
  const next: SocketSession = { ...s, state: "connected", connectedAt: new Date().toISOString(), connectAttempts: 0 };
  sessions.set(sessionId, next);
  return next;
}

export function markDisconnected(sessionId: string): SocketSession | null {
  const s = sessions.get(sessionId);
  if (!s) return null;
  const next: SocketSession = { ...s, state: "disconnected", disconnectedAt: new Date().toISOString() };
  sessions.set(sessionId, next);
  return next;
}

export function attemptReconnect(sessionId: string): { ok: boolean; session: SocketSession; canRetry: boolean } {
  const s = sessions.get(sessionId);
  if (!s) return { ok: false, session: {} as SocketSession, canRetry: false };
  if (s.connectAttempts >= s.maxAttempts) {
    const failed: SocketSession = { ...s, state: "failed" };
    sessions.set(sessionId, failed);
    return { ok: false, session: failed, canRetry: false };
  }
  const next: SocketSession = { ...s, state: "reconnecting", connectAttempts: s.connectAttempts + 1 };
  sessions.set(sessionId, next);
  return { ok: true, session: next, canRetry: next.connectAttempts < next.maxAttempts };
}

export function markRecovered(sessionId: string): SocketSession | null {
  const s = sessions.get(sessionId);
  if (!s) return null;
  const next: SocketSession = { ...s, state: "connected", recoveredAt: new Date().toISOString(), connectAttempts: 0 };
  sessions.set(sessionId, next);
  return next;
}

export function getSession(sessionId: string): SocketSession | null {
  return sessions.get(sessionId) ?? null;
}

export function getFailedSessions(): SocketSession[] {
  return [...sessions.values()].filter((s) => s.state === "failed");
}

export function purgeSession(sessionId: string): void {
  sessions.delete(sessionId);
}
