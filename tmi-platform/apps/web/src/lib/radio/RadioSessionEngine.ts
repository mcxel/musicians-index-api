/**
 * RadioSessionEngine — Stream & Win Radio session registry (Rule 25, Session Launch Model).
 *
 * A listening session opens once LAUNCH_THRESHOLD artists have joined the waiting room.
 * All counts returned here are real — this registry is the only permitted source for
 * "Artists Joined: X of Y" UI (Rule 20 four-states; never fabricate counts).
 */

export type RadioSessionStatus = 'waiting' | 'live' | 'ended';

export interface RadioParticipant {
  submitterId: string;
  submissionId: string;
  title: string;
  joinedAt: number;
}

export interface RadioSession {
  id: string;
  status: RadioSessionStatus;
  participants: RadioParticipant[];
  launchThreshold: number;
  createdAt: number;
  launchedAt: number | null;
}

export interface RadioSessionState {
  session: {
    id: string;
    status: RadioSessionStatus;
    artistsJoined: number;
    launchThreshold: number;
    participants: Array<{ submitterId: string; title: string }>;
    createdAt: number;
    launchedAt: number | null;
  } | null;
}

const LAUNCH_THRESHOLD = 5;

let currentSession: RadioSession | null = null;
let sessionCounter = 1;

function sanitize(input: string, max = 80): string {
  return input.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max);
}

function newSession(): RadioSession {
  return {
    id: `radio-session-${sessionCounter++}-${Date.now()}`,
    status: 'waiting',
    participants: [],
    launchThreshold: LAUNCH_THRESHOLD,
    createdAt: Date.now(),
    launchedAt: null,
  };
}

export function joinRadioWaitingRoom(input: {
  submitterId: string;
  submissionId: string;
  title: string;
}): { ok: boolean; state: RadioSessionState; error?: 'invalid_input' } {
  const submitterId = sanitize(input.submitterId, 64);
  const submissionId = sanitize(input.submissionId, 64);
  const title = sanitize(input.title, 80) || 'Untitled';

  if (!submitterId || !submissionId) {
    return { ok: false, state: getRadioSessionState(), error: 'invalid_input' };
  }

  if (!currentSession || currentSession.status === 'ended') {
    currentSession = newSession();
  }

  const already = currentSession.participants.some((p) => p.submitterId === submitterId);
  if (!already) {
    currentSession.participants.push({ submitterId, submissionId, title, joinedAt: Date.now() });
  }

  if (
    currentSession.status === 'waiting' &&
    currentSession.participants.length >= currentSession.launchThreshold
  ) {
    currentSession.status = 'live';
    currentSession.launchedAt = Date.now();
  }

  return { ok: true, state: getRadioSessionState() };
}

export function getRadioSessionState(): RadioSessionState {
  if (!currentSession || currentSession.status === 'ended') {
    return { session: null };
  }
  return {
    session: {
      id: currentSession.id,
      status: currentSession.status,
      artistsJoined: currentSession.participants.length,
      launchThreshold: currentSession.launchThreshold,
      participants: currentSession.participants.map((p) => ({
        submitterId: p.submitterId,
        title: p.title,
      })),
      createdAt: currentSession.createdAt,
      launchedAt: currentSession.launchedAt,
    },
  };
}

export function hasJoinedRadioSession(submitterId: string): boolean {
  if (!currentSession || currentSession.status === 'ended') return false;
  return currentSession.participants.some((p) => p.submitterId === submitterId);
}

export function endRadioSession(): void {
  if (currentSession) currentSession.status = 'ended';
}
