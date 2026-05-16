export type ProfileLoopSession = {
  sessionId: string;
  fanSlug: string;
  roomId: string;
  source: string;
  createdAt: number;
  closedAt?: number;
  actionCount: number;
  actions: ProfileLoopAction[];
  actionStats: Record<FanActionType, number>;
};

export type FanActionType = 'enter_room' | 'reaction' | 'emote' | 'tip' | 'chat';

export type ProfileLoopAction = {
  type: FanActionType;
  value: number;
  timestamp: number;
};

const sessions = new Map<string, ProfileLoopSession>();

function norm(value: string): string {
  return value.trim().toLowerCase();
}

export function createProfileLoopSession(input: {
  fanSlug: string;
  roomId: string;
  source: string;
}): ProfileLoopSession {
  const session: ProfileLoopSession = {
    sessionId: `sess_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
    fanSlug: norm(input.fanSlug),
    roomId: input.roomId,
    source: input.source,
    createdAt: Date.now(),
    actionCount: 0,
    actions: [],
    actionStats: {
      enter_room: 0,
      reaction: 0,
      emote: 0,
      tip: 0,
      chat: 0,
    },
  };
  sessions.set(session.sessionId, session);
  return session;
}

export function getProfileLoopSession(sessionId: string): ProfileLoopSession | null {
  return sessions.get(sessionId) ?? null;
}

export function recordProfileLoopAction(
  sessionId: string,
  input: { type: FanActionType; value?: number },
): ProfileLoopSession | null {
  const existing = sessions.get(sessionId);
  if (!existing) return null;
  const value = Math.max(1, input.value ?? 1);
  const action: ProfileLoopAction = {
    type: input.type,
    value,
    timestamp: Date.now(),
  };
  const next = {
    ...existing,
    actionCount: existing.actionCount + value,
    actions: [...existing.actions, action],
    actionStats: {
      ...existing.actionStats,
      [input.type]: existing.actionStats[input.type] + value,
    },
  };
  sessions.set(sessionId, next);
  return next;
}

export function closeProfileLoopSession(sessionId: string): ProfileLoopSession | null {
  const existing = sessions.get(sessionId);
  if (!existing) return null;
  if (existing.closedAt) return existing;
  const next = { ...existing, closedAt: Date.now() };
  sessions.set(sessionId, next);
  return next;
}
