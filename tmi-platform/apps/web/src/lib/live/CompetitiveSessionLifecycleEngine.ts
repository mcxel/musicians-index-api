export type CompetitiveMode = 'battle' | 'cypher' | 'challenge';

export type CompetitiveSessionState =
  | 'preparing'
  | 'waiting_for_contender'
  | 'opponent_joined'
  | 'vs_animation'
  | 'countdown'
  | 'live'
  | 'winner_results'
  | 'replay'
  | 'archive';

export type CompetitiveSessionRecord = {
  roomId: string;
  mode: CompetitiveMode;
  hostUserId: string;
  contenderUserId: string | null;
  state: CompetitiveSessionState;
  waitingSince: number;
  lastTransitionAt: number;
  createdAt: number;
  endedAt: number | null;
  failedTransitionCount: number;
};

export type CompetitiveLifecycleMetrics = {
  counts: Record<CompetitiveSessionState, number>;
  stuckSessions: number;
  averageWaitSeconds: number;
  failedTransitions: number;
};

const sessions = new Map<string, CompetitiveSessionRecord>();

const ALLOWED_TRANSITIONS: Record<CompetitiveSessionState, CompetitiveSessionState[]> = {
  preparing: ['waiting_for_contender'],
  waiting_for_contender: ['opponent_joined', 'archive'],
  opponent_joined: ['vs_animation', 'archive'],
  vs_animation: ['countdown', 'archive'],
  countdown: ['live', 'archive'],
  live: ['winner_results', 'archive'],
  winner_results: ['replay', 'archive'],
  replay: ['archive'],
  archive: [],
};

function nowMs(): number {
  return Date.now();
}

export function createCompetitiveSession(input: {
  roomId: string;
  mode: CompetitiveMode;
  hostUserId: string;
}): CompetitiveSessionRecord {
  const now = nowMs();
  const record: CompetitiveSessionRecord = {
    roomId: input.roomId,
    mode: input.mode,
    hostUserId: input.hostUserId,
    contenderUserId: null,
    state: 'waiting_for_contender',
    waitingSince: now,
    lastTransitionAt: now,
    createdAt: now,
    endedAt: null,
    failedTransitionCount: 0,
  };
  sessions.set(input.roomId, record);
  return record;
}

export function getCompetitiveSession(roomId: string): CompetitiveSessionRecord | null {
  return sessions.get(roomId) ?? null;
}

export function listCompetitiveSessions(): CompetitiveSessionRecord[] {
  return Array.from(sessions.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function transitionCompetitiveSession(roomId: string, next: CompetitiveSessionState): CompetitiveSessionRecord | null {
  const session = sessions.get(roomId);
  if (!session) return null;
  if (session.state === next) return session;

  const allowed = ALLOWED_TRANSITIONS[session.state] ?? [];
  if (!allowed.includes(next)) {
    session.failedTransitionCount += 1;
    return session;
  }

  session.state = next;
  session.lastTransitionAt = nowMs();
  if (next === 'archive') {
    session.endedAt = session.lastTransitionAt;
  }
  return session;
}

export function registerContenderJoin(roomId: string, contenderUserId: string): CompetitiveSessionRecord | null {
  const session = sessions.get(roomId);
  if (!session) return null;

  // Host cannot be treated as contender.
  if (contenderUserId === session.hostUserId) {
    return session;
  }

  // Keep the first locked contender unless the room returns to waiting state.
  if (
    session.contenderUserId &&
    session.contenderUserId !== contenderUserId &&
    session.state !== 'waiting_for_contender'
  ) {
    return session;
  }

  session.contenderUserId = contenderUserId;
  if (session.state === 'waiting_for_contender') {
    session.state = 'opponent_joined';
    session.lastTransitionAt = nowMs();
  }
  return session;
}

export function runAutoProgressionAfterContender(roomId: string): CompetitiveSessionRecord | null {
  // Keep this deterministic and lightweight: one function advances
  // the required states in order after contender lock.
  const session = sessions.get(roomId);
  if (!session) return null;

  if (session.state === 'opponent_joined') transitionCompetitiveSession(roomId, 'vs_animation');
  if (session.state === 'vs_animation') transitionCompetitiveSession(roomId, 'countdown');
  if (session.state === 'countdown') transitionCompetitiveSession(roomId, 'live');
  return sessions.get(roomId) ?? null;
}

export function completeCompetitiveSession(roomId: string): CompetitiveSessionRecord | null {
  const session = sessions.get(roomId);
  if (!session) return null;

  if (session.state === 'live') transitionCompetitiveSession(roomId, 'winner_results');
  if (session.state === 'winner_results') transitionCompetitiveSession(roomId, 'replay');
  if (session.state === 'replay') transitionCompetitiveSession(roomId, 'archive');
  return sessions.get(roomId) ?? null;
}

export function handleCompetitiveParticipantLeave(roomId: string, userId: string): CompetitiveSessionRecord | null {
  const session = sessions.get(roomId);
  if (!session) return null;

  // Host leaving ends the competitive lifecycle.
  if (userId === session.hostUserId) {
    transitionCompetitiveSession(roomId, 'archive');
    return sessions.get(roomId) ?? null;
  }

  // Contender leaving before live returns room to waiting.
  if (
    session.contenderUserId === userId &&
    (session.state === 'opponent_joined' || session.state === 'vs_animation' || session.state === 'countdown')
  ) {
    session.contenderUserId = null;
    session.state = 'waiting_for_contender';
    session.waitingSince = nowMs();
    session.lastTransitionAt = session.waitingSince;
    return session;
  }

  // Contender disconnect during live ends match gracefully.
  if (session.contenderUserId === userId && session.state === 'live') {
    transitionCompetitiveSession(roomId, 'winner_results');
    transitionCompetitiveSession(roomId, 'replay');
    transitionCompetitiveSession(roomId, 'archive');
    return sessions.get(roomId) ?? null;
  }

  return session;
}

export function expireStaleCompetitiveSessions(options?: {
  waitingTimeoutMs?: number;
  preparingTimeoutMs?: number;
  transitionStuckTimeoutMs?: number;
}): CompetitiveSessionRecord[] {
  const now = nowMs();
  const waitingTimeoutMs = options?.waitingTimeoutMs ?? 8 * 60 * 1000;
  const preparingTimeoutMs = options?.preparingTimeoutMs ?? 2 * 60 * 1000;
  const transitionStuckTimeoutMs = options?.transitionStuckTimeoutMs ?? 90 * 1000;

  const changed: CompetitiveSessionRecord[] = [];

  for (const session of sessions.values()) {
    if (session.state === 'archive') continue;

    if (session.state === 'waiting_for_contender' && now - session.waitingSince > waitingTimeoutMs) {
      transitionCompetitiveSession(session.roomId, 'archive');
      changed.push(session);
      continue;
    }

    if (session.state === 'preparing' && now - session.lastTransitionAt > preparingTimeoutMs) {
      transitionCompetitiveSession(session.roomId, 'archive');
      changed.push(session);
      continue;
    }

    if (
      (session.state === 'opponent_joined' || session.state === 'vs_animation' || session.state === 'countdown') &&
      now - session.lastTransitionAt > transitionStuckTimeoutMs
    ) {
      transitionCompetitiveSession(session.roomId, 'archive');
      changed.push(session);
    }
  }

  return changed;
}

export function getCompetitiveLifecycleMetrics(): CompetitiveLifecycleMetrics {
  const allStates: CompetitiveSessionState[] = [
    'preparing',
    'waiting_for_contender',
    'opponent_joined',
    'vs_animation',
    'countdown',
    'live',
    'winner_results',
    'replay',
    'archive',
  ];

  const counts = allStates.reduce((acc, state) => {
    acc[state] = 0;
    return acc;
  }, {} as Record<CompetitiveSessionState, number>);

  let totalWaitMs = 0;
  let waitCount = 0;
  let stuckSessions = 0;
  let failedTransitions = 0;
  const now = nowMs();

  for (const session of sessions.values()) {
    counts[session.state] += 1;
    failedTransitions += session.failedTransitionCount;

    if (session.state === 'waiting_for_contender') {
      totalWaitMs += Math.max(0, now - session.waitingSince);
      waitCount += 1;
    }

    if (
      (session.state === 'waiting_for_contender' && now - session.waitingSince > 8 * 60 * 1000) ||
      ((session.state === 'opponent_joined' || session.state === 'vs_animation' || session.state === 'countdown') &&
        now - session.lastTransitionAt > 90 * 1000)
    ) {
      stuckSessions += 1;
    }
  }

  return {
    counts,
    stuckSessions,
    averageWaitSeconds: waitCount > 0 ? Math.round(totalWaitMs / waitCount / 1000) : 0,
    failedTransitions,
  };
}
