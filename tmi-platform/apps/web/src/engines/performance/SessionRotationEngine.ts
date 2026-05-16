// SessionRotationEngine
// Lifecycle: open → join → lock → perform → vote → reward → archive → next

export type SessionPhase =
  | "open"       // accepting joins
  | "join"       // last-call for latecomers
  | "lock"       // roster frozen, beat queued
  | "perform"    // active performance window
  | "vote"       // fan voting open
  | "reward"     // winner announced, prizes queued
  | "archive"    // session complete, stats saved
  | "next";      // bootstrapping next session

export type SessionType = "cypher" | "battle" | "open_jam" | "producer" | "instrument";

export type SessionRecord = {
  sessionId: string;
  sessionType: SessionType;
  genre: string;
  phase: SessionPhase;
  participantIds: string[];
  maxParticipants: number;
  startedAt: number;
  phaseEnteredAt: number;
  phaseDurationMs: number;
  winnerId?: string;
  winnerName?: string;
  voteMap: Record<string, number>;  // participantId → vote count
  prizeIds: string[];
  archivedAt?: number;
};

const PHASE_DURATIONS: Record<SessionPhase, number> = {
  open:    5  * 60 * 1000,
  join:    2  * 60 * 1000,
  lock:    1  * 60 * 1000,
  perform: 25 * 60 * 1000,
  vote:    5  * 60 * 1000,
  reward:  3  * 60 * 1000,
  archive: 1  * 60 * 1000,
  next:    2  * 60 * 1000,
};

const NEXT_PHASE: Record<SessionPhase, SessionPhase> = {
  open:    "join",
  join:    "lock",
  lock:    "perform",
  perform: "vote",
  vote:    "reward",
  reward:  "archive",
  archive: "next",
  next:    "open",
};

const _sessions: Map<string, SessionRecord> = new Map();
let _counter = 0;

// ── Create ────────────────────────────────────────────────────────────────────

export function createSession(opts: {
  sessionType: SessionType;
  genre: string;
  maxParticipants?: number;
}): SessionRecord {
  const session: SessionRecord = {
    sessionId: `sess-${++_counter}`,
    sessionType: opts.sessionType,
    genre: opts.genre,
    phase: "open",
    participantIds: [],
    maxParticipants: opts.maxParticipants ?? 20,
    startedAt: Date.now(),
    phaseEnteredAt: Date.now(),
    phaseDurationMs: PHASE_DURATIONS["open"],
    voteMap: {},
    prizeIds: [],
  };
  _sessions.set(session.sessionId, session);
  return session;
}

// ── Join / leave ──────────────────────────────────────────────────────────────

export function joinSession(sessionId: string, participantId: string): boolean {
  const s = _sessions.get(sessionId);
  if (!s) return false;
  if (s.phase !== "open" && s.phase !== "join") return false;
  if (s.participantIds.includes(participantId)) return true;
  if (s.participantIds.length >= s.maxParticipants) return false;
  s.participantIds.push(participantId);
  s.voteMap[participantId] = 0;
  return true;
}

// ── Advance phase ─────────────────────────────────────────────────────────────

export function advancePhase(sessionId: string): SessionPhase | null {
  const s = _sessions.get(sessionId);
  if (!s) return null;
  const next = NEXT_PHASE[s.phase];
  s.phase = next;
  s.phaseEnteredAt = Date.now();
  s.phaseDurationMs = PHASE_DURATIONS[next];
  if (next === "archive") s.archivedAt = Date.now();
  return next;
}

export function getPhaseMsRemaining(session: SessionRecord): number {
  const elapsed = Date.now() - session.phaseEnteredAt;
  return Math.max(0, session.phaseDurationMs - elapsed);
}

// ── Voting ────────────────────────────────────────────────────────────────────

export function castVote(sessionId: string, targetParticipantId: string, _voterId: string): boolean {
  const s = _sessions.get(sessionId);
  if (!s || s.phase !== "vote") return false;
  if (!(targetParticipantId in s.voteMap)) return false;
  s.voteMap[targetParticipantId] = (s.voteMap[targetParticipantId] ?? 0) + 1;
  return true;
}

export function resolveWinner(sessionId: string): string | null {
  const s = _sessions.get(sessionId);
  if (!s) return null;
  const entries = Object.entries(s.voteMap);
  if (entries.length === 0) return null;
  const [winnerId] = entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
  s.winnerId = winnerId;
  return winnerId;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getSession(sessionId: string): SessionRecord | undefined {
  return _sessions.get(sessionId);
}

export function getActiveSessions(): SessionRecord[] {
  return Array.from(_sessions.values()).filter(
    (s) => s.phase !== "archive" && s.phase !== "next"
  );
}

export function getPhaseLabel(phase: SessionPhase): string {
  const LABELS: Record<SessionPhase, string> = {
    open:    "OPEN — Accepting Joins",
    join:    "LAST CALL",
    lock:    "LOCKING ROSTER",
    perform: "PERFORMING LIVE",
    vote:    "FAN VOTE OPEN",
    reward:  "WINNER ANNOUNCED",
    archive: "SESSION COMPLETE",
    next:    "NEXT SESSION LOADING",
  };
  return LABELS[phase];
}
