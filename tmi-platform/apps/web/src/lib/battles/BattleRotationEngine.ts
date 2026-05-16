// State machine: queued → open → joining → locked → performing → voting
//                → resolved → rewarded → archived → rotated

export type BattlePhase =
  | "queued"
  | "open"
  | "joining"
  | "locked"
  | "performing"
  | "voting"
  | "resolved"
  | "rewarded"
  | "archived"
  | "rotated";

export type BattleGenre =
  | "rap"
  | "rock"
  | "country"
  | "jazz"
  | "r&b"
  | "edm"
  | "classical"
  | "global_fusion"
  | "open";

export type BattleType = "crown_duel" | "semifinal" | "open_bracket" | "challenge";

export type BeatLockState = "pending" | "locked" | "skipped" | "committed";

export interface Beat {
  id: string;
  title: string;
  genre: BattleGenre;
  bpm: number;
  durationSeconds: number;
  lockState: BeatLockState;
  skipVotes: number;
  lockVotes: number;
}

export interface BattleSlot {
  userId: string;
  name: string;
  role: string;
  accentColor: string;
  isBot: boolean;
  joinedAt: Date;
  score: number;
  voteCount: number;
  performanceScore: number;
}

export interface BattleTimers {
  joinWindowMs: number;        // 180s default
  performanceWindowMs: number; // configurable per type
  voteWindowMs: number;        // 60s
  rewardWindowMs: number;      // 20s
  phaseStartedAt: Date;
}

export interface BattleSession {
  id: string;
  type: BattleType;
  genre: BattleGenre;
  phase: BattlePhase;
  slots: BattleSlot[];
  maxSlots: number;
  beatQueue: Beat[];
  activeBeat?: Beat;
  timers: BattleTimers;
  botOwned: boolean;
  openedAt: Date;
  lockedAt?: Date;
  resolvedAt?: Date;
  archivedAt?: Date;
  winnerId?: string;
  prizeId?: string;
  contestId?: string;
}

export interface PhaseResult {
  success: boolean;
  session?: BattleSession;
  error?: string;
}

export interface VoteResult {
  success: boolean;
  session?: BattleSession;
  error?: string;
}

export interface BeatQueueResult {
  success: boolean;
  beat?: Beat;
  session?: BattleSession;
  action: "skip" | "lock" | "commit" | "timeout_commit";
}

// ── Genre beat pools ──────────────────────────────────────────────────────────

const GENRE_BEATS: Record<BattleGenre, Beat[]> = {
  "rap": [
    { id: "rap_001", title: "Crown Bounce",   genre: "rap",          bpm: 92,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "rap_002", title: "Block Pressure", genre: "rap",          bpm: 88,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "rock": [
    { id: "rck_001", title: "Voltage Surge",  genre: "rock",         bpm: 128, durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "rck_002", title: "Iron Riff",      genre: "rock",         bpm: 120, durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "country": [
    { id: "cty_001", title: "Dusty Road",     genre: "country",      bpm: 96,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "cty_002", title: "Porch Session",  genre: "country",      bpm: 100, durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "jazz": [
    { id: "jaz_001", title: "Blue Quarter",   genre: "jazz",         bpm: 110, durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "jaz_002", title: "Late Night",     genre: "jazz",         bpm: 95,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "r&b": [
    { id: "rnb_001", title: "Velvet Drop",    genre: "r&b",          bpm: 78,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "rnb_002", title: "Crown Melt",     genre: "r&b",          bpm: 82,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "edm": [
    { id: "edm_001", title: "Pulse Grid",     genre: "edm",          bpm: 140, durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "edm_002", title: "Drop Zero",      genre: "edm",          bpm: 138, durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "classical": [
    { id: "cls_001", title: "March Sonata",   genre: "classical",    bpm: 72,  durationSeconds: 240, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "cls_002", title: "Overture II",    genre: "classical",    bpm: 68,  durationSeconds: 240, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "global_fusion": [
    { id: "gf_001",  title: "Silk Route",     genre: "global_fusion",bpm: 90,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "gf_002",  title: "Delta Fire",     genre: "global_fusion",bpm: 94,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
  "open": [
    { id: "opn_001", title: "Free Canvas",    genre: "open",         bpm: 100, durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
    { id: "opn_002", title: "Blank Stage",    genre: "open",         bpm: 90,  durationSeconds: 180, lockState: "pending", skipVotes: 0, lockVotes: 0 },
  ],
};

const PHASE_ORDER: BattlePhase[] = [
  "queued", "open", "joining", "locked", "performing",
  "voting", "resolved", "rewarded", "archived", "rotated",
];

const DEFAULT_TIMERS: Omit<BattleTimers, "phaseStartedAt"> = {
  joinWindowMs:        180_000,
  performanceWindowMs: 180_000,
  voteWindowMs:         60_000,
  rewardWindowMs:       20_000,
};

const PERFORMANCE_WINDOW_BY_TYPE: Record<BattleType, number> = {
  crown_duel:    300_000,
  semifinal:     240_000,
  open_bracket:  180_000,
  challenge:     120_000,
};

const TERMINAL_PHASES: BattlePhase[] = ["archived", "rotated"];

// ── In-memory store ───────────────────────────────────────────────────────────

const _sessions: Map<string, BattleSession> = new Map();
let _counter = 1;

function generateId(): string {
  return `battle_${Date.now()}_${_counter++}`;
}

function buildBeatQueue(genre: BattleGenre): Beat[] {
  const pool = GENRE_BEATS[genre] ?? GENRE_BEATS["open"]!;
  return pool.map((b) => ({ ...b, skipVotes: 0, lockVotes: 0, lockState: "pending" as BeatLockState }));
}

// ── Bot seed data ─────────────────────────────────────────────────────────────

const BOT_POOL: Array<Omit<BattleSlot, "joinedAt" | "voteCount" | "score" | "performanceScore">> = [
  { userId: "bot_kova",     name: "KOVA",         role: "Vocalist",   accentColor: "#FFD700", isBot: true },
  { userId: "bot_neravex",  name: "Nera Vex",     role: "Vocalist",   accentColor: "#00FFFF", isBot: true },
  { userId: "bot_beatarch", name: "BeatArchitect",role: "Producer",   accentColor: "#FF6B35", isBot: true },
  { userId: "bot_bassNero", name: "Bass.Nero",    role: "Producer",   accentColor: "#AA2DFF", isBot: true },
  { userId: "bot_driftsnd", name: "Drift Sound",  role: "Guitarist",  accentColor: "#00FFFF", isBot: true },
  { userId: "bot_kaseDuro", name: "Kase Duro",    role: "Guitarist",  accentColor: "#FFD700", isBot: true },
  { userId: "bot_ashawave", name: "Asha Wave",    role: "Songwriter", accentColor: "#FF2DAA", isBot: true },
  { userId: "bot_808king",  name: "808.King",     role: "Producer",   accentColor: "#FFD700", isBot: true },
];

// ── Beat queue helpers ────────────────────────────────────────────────────────

function advanceBeat(sessionId: string, action: "skip" | "timeout_commit"): BeatQueueResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, action };

  const remaining = s.beatQueue.filter((b) => b.lockState === "pending");
  if (remaining.length === 0) {
    const fallback = s.beatQueue[Math.floor(Math.random() * s.beatQueue.length)];
    const updated: BattleSession = { ...s, activeBeat: fallback };
    _sessions.set(sessionId, updated);
    return { success: true, beat: fallback, session: updated, action: "timeout_commit" };
  }

  const next = remaining[0]!;
  const updated: BattleSession = {
    ...s,
    activeBeat: next,
    beatQueue: s.beatQueue.map((b) =>
      b.id === next.id ? { ...b, lockState: "locked" as BeatLockState } : b
    ),
  };
  _sessions.set(sessionId, updated);
  return { success: true, beat: next, session: updated, action };
}

// ── Core API ──────────────────────────────────────────────────────────────────

export function queueBattle(opts: {
  type: BattleType;
  genre: BattleGenre;
  maxSlots?: number;
  prizeId?: string;
  contestId?: string;
  botOwned?: boolean;
  performanceWindowMs?: number;
}): BattleSession {
  const session: BattleSession = {
    id: generateId(),
    type: opts.type,
    genre: opts.genre,
    phase: "queued",
    slots: [],
    maxSlots: opts.maxSlots ?? 2,
    beatQueue: buildBeatQueue(opts.genre),
    timers: {
      ...DEFAULT_TIMERS,
      performanceWindowMs: opts.performanceWindowMs ?? PERFORMANCE_WINDOW_BY_TYPE[opts.type],
      phaseStartedAt: new Date(),
    },
    botOwned: opts.botOwned ?? true,
    openedAt: new Date(),
    prizeId: opts.prizeId,
    contestId: opts.contestId,
  };
  _sessions.set(session.id, session);
  return session;
}

export function openSession(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "queued") return { success: false, error: `Cannot open from phase: ${s.phase}` };
  const updated: BattleSession = {
    ...s, phase: "open",
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function botSeedSlots(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (!s.botOwned) return { success: false, error: "Not a bot-owned session" };

  const needed = s.maxSlots - s.slots.length;
  const picks = BOT_POOL
    .filter((b) => !s.slots.some((slot) => slot.userId === b.userId))
    .slice(0, needed);

  const newSlots: BattleSlot[] = picks.map((b) => ({
    ...b, joinedAt: new Date(), voteCount: 0, score: 0, performanceScore: 0,
  }));

  const updated: BattleSession = { ...s, slots: [...s.slots, ...newSlots] };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function joinSession(
  sessionId: string,
  slot: Omit<BattleSlot, "joinedAt" | "voteCount" | "score" | "performanceScore">
): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "open" && s.phase !== "joining") {
    return { success: false, error: `Cannot join in phase: ${s.phase}` };
  }
  if (s.slots.length >= s.maxSlots) return { success: false, error: "Session is full" };
  if (s.slots.some((x) => x.userId === slot.userId)) return { success: false, error: "Already joined" };

  const newSlots = [
    ...s.slots,
    { ...slot, joinedAt: new Date(), voteCount: 0, score: 0, performanceScore: 0 },
  ];
  const isFull = newSlots.length >= s.maxSlots;

  const updated: BattleSession = {
    ...s,
    slots: newSlots,
    phase: isFull ? "locked" : "joining",
    ...(isFull ? { lockedAt: new Date() } : {}),
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function lockSession(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "joining" && s.phase !== "open") {
    return { success: false, error: `Cannot lock from phase: ${s.phase}` };
  }
  const updated: BattleSession = {
    ...s, phase: "locked", lockedAt: new Date(),
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

// ── Beat queue system ─────────────────────────────────────────────────────────
// majority skip → next beat | single lock → commit beat | timeout → random commit

export function voteBeatSkip(sessionId: string): BeatQueueResult {
  const s = _sessions.get(sessionId);
  if (!s || !s.activeBeat) return { success: false, action: "skip" };

  const beat = { ...s.activeBeat, skipVotes: s.activeBeat.skipVotes + 1 };
  const majority = Math.ceil(s.slots.length / 2);

  if (beat.skipVotes >= majority) {
    return advanceBeat(sessionId, "skip");
  }

  const updated: BattleSession = { ...s, activeBeat: beat };
  _sessions.set(sessionId, updated);
  return { success: true, beat, session: updated, action: "skip" };
}

export function voteBeatLock(sessionId: string): BeatQueueResult {
  const s = _sessions.get(sessionId);
  if (!s || !s.activeBeat) return { success: false, action: "lock" };

  const beat: Beat = { ...s.activeBeat, lockVotes: s.activeBeat.lockVotes + 1, lockState: "locked" };
  const updated: BattleSession = { ...s, activeBeat: beat };
  _sessions.set(sessionId, updated);
  return { success: true, beat, session: updated, action: "commit" };
}

export function botDJPickBeat(sessionId: string): BeatQueueResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, action: "timeout_commit" };
  if (s.activeBeat?.lockState === "locked") {
    return { success: true, beat: s.activeBeat, session: s, action: "commit" };
  }
  return advanceBeat(sessionId, "timeout_commit");
}

// ── Perform / vote / resolve ──────────────────────────────────────────────────

export function startPerformance(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "locked") return { success: false, error: `Cannot perform from phase: ${s.phase}` };

  const updated: BattleSession = {
    ...s,
    phase: "performing",
    activeBeat: s.activeBeat ?? s.beatQueue[0],
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function openVoting(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "performing") return { success: false, error: `Cannot open voting from phase: ${s.phase}` };

  const updated: BattleSession = {
    ...s, phase: "voting",
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function castVote(sessionId: string, voterId: string, targetUserId: string): VoteResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "voting") return { success: false, error: "Voting not open" };
  if (voterId === targetUserId) return { success: false, error: "Cannot vote for yourself" };
  if (!s.slots.some((x) => x.userId === targetUserId)) return { success: false, error: "Target not in session" };

  const updated: BattleSession = {
    ...s,
    slots: s.slots.map((x) =>
      x.userId === targetUserId ? { ...x, voteCount: x.voteCount + 1 } : x
    ),
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function resolveSession(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "voting" && s.phase !== "performing") {
    return { success: false, error: `Cannot resolve from phase: ${s.phase}` };
  }

  const winner = s.slots.reduce<BattleSlot | null>(
    (best, slot) => (!best || slot.voteCount > best.voteCount ? slot : best),
    null
  );

  const updated: BattleSession = {
    ...s, phase: "resolved", winnerId: winner?.userId, resolvedAt: new Date(),
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function distributeRewards(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "resolved") return { success: false, error: `Cannot reward from phase: ${s.phase}` };

  const updated: BattleSession = {
    ...s, phase: "rewarded",
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function archiveSession(sessionId: string): PhaseResult {
  const s = _sessions.get(sessionId);
  if (!s) return { success: false, error: "Session not found" };
  if (s.phase !== "rewarded") return { success: false, error: `Cannot archive from phase: ${s.phase}` };

  const updated: BattleSession = {
    ...s, phase: "archived", archivedAt: new Date(),
    timers: { ...s.timers, phaseStartedAt: new Date() },
  };
  _sessions.set(sessionId, updated);
  return { success: true, session: updated };
}

export function rotateBattle(sessionId: string): BattleSession | null {
  const s = _sessions.get(sessionId);
  if (!s) return null;

  _sessions.set(sessionId, { ...s, phase: "rotated" });

  return queueBattle({
    type: s.type,
    genre: s.genre,
    maxSlots: s.maxSlots,
    prizeId: s.prizeId,
    contestId: s.contestId,
    botOwned: s.botOwned,
    performanceWindowMs: s.timers.performanceWindowMs,
  });
}

// ── Bot full auto-cycle ───────────────────────────────────────────────────────

export function botRunCycle(opts: {
  type: BattleType;
  genre: BattleGenre;
  prizeId?: string;
  contestId?: string;
}): BattleSession {
  const s = queueBattle({ ...opts, botOwned: true });
  openSession(s.id);
  botSeedSlots(s.id);
  lockSession(s.id);
  botDJPickBeat(s.id);
  startPerformance(s.id);
  openVoting(s.id);
  const live = _sessions.get(s.id)!;
  if (live.slots.length >= 2) {
    castVote(s.id, live.slots[0]!.userId, live.slots[1]!.userId);
    castVote(s.id, live.slots[1]!.userId, live.slots[0]!.userId);
  }
  resolveSession(s.id);
  distributeRewards(s.id);
  archiveSession(s.id);
  return _sessions.get(s.id)!;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getSession(id: string): BattleSession | undefined {
  return _sessions.get(id);
}

export function getActiveSessions(): BattleSession[] {
  return Array.from(_sessions.values()).filter((s) => !TERMINAL_PHASES.includes(s.phase));
}

export function getSessionsByPhase(phase: BattlePhase): BattleSession[] {
  return Array.from(_sessions.values()).filter((s) => s.phase === phase);
}

export function getSessionsByGenre(genre: BattleGenre): BattleSession[] {
  return Array.from(_sessions.values()).filter((s) => s.genre === genre);
}

export function getPhaseElapsedMs(session: BattleSession): number {
  return Date.now() - session.timers.phaseStartedAt.getTime();
}

export function isPhaseTimedOut(session: BattleSession): boolean {
  const elapsed = getPhaseElapsedMs(session);
  switch (session.phase) {
    case "joining":    return elapsed > session.timers.joinWindowMs;
    case "performing": return elapsed > session.timers.performanceWindowMs;
    case "voting":     return elapsed > session.timers.voteWindowMs;
    case "rewarded":   return elapsed > session.timers.rewardWindowMs;
    default:           return false;
  }
}

export function getAllSessions(): BattleSession[] {
  return Array.from(_sessions.values());
}
