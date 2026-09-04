/**
 * ExperiencePersonality — visual/queue shell config separate from competition logic.
 *
 * Cypher ≠ Battle ≠ Challenge. Competition engines stay; this registry only
 * drives queue drawer mode + which confrontation overlays may mount.
 *
 * Marcel lock (2026-08-19):
 *   CYPHER votes = STATS_ONLY (engagement metrics) — no winner/VS/elimination.
 *   CYPHER_KING = competitive voting + winner reveal allowed.
 * Rule 20: never invent viewer counts or vote percentages here.
 */

// Avoid importing ThemeRegistry (hooks) — keep this file server/runtime-safe.

export type QueueMode = "PERSISTENT" | "TRANSIENT" | "ROUND_BASED";
export type CompetitionMode = "NONE" | "HEAD_TO_HEAD" | "CATEGORY_COMPARE";
export type VotingMode = "OFF" | "STATS_ONLY" | "COMPETITIVE";
export type WinnerState = "DISABLED" | "ENABLED";
export type ParticipantVisibility = "HIGH" | "LOW_WHILE_ACTIVE";

export type ExperiencePersonalityId =
  | "CYPHER"
  | "CYPHER_KING"
  | "BATTLE"
  | "CHALLENGE"
  | "GAUNTLET"
  | "GAME"
  | "LIVE_GUEST_QUEUE"
  | "SLOW_JAM";

export type ExperiencePersonality = {
  id: ExperiencePersonalityId;
  queueMode: QueueMode;
  competitionMode: CompetitionMode;
  votingMode: VotingMode;
  winnerState: WinnerState;
  participantVisibility: ParticipantVisibility;
  collaborationMode: boolean;
  /** Battle transient UP NEXT card duration (ms). */
  upNextCardMs: number;
  allowsWinnerStays: boolean;
  allowsVsOverlay: boolean;
  allowsFinalVoteOverlay: boolean;
  allowsElimination: boolean;
  /**
   * After match/session finish: RESET → SHUFFLE → RECRUITING (same roomId).
   * Locked for Cypher, Cypher King, Battle, Challenge, Gauntlet.
   */
  restartOnEmpty: boolean;
};

/** Sunday Slow Jams motion / energy — sultry lounge, not EDM drop. */
export const SLOW_JAM_MOTION = {
  crossfadeMs: 8_000,
  ambientPulseMs: 6_000,
  transitionMs: 1_200,
  glowOpacity: 0.35,
  accentCyan: "rgba(0,255,255,0.35)",
  accentFuchsia: "rgba(255,45,170,0.28)",
  accentGold: "rgba(255,215,0,0.4)",
  accentPurple: "rgba(170,45,255,0.45)",
  copyJoin: "Enter the lounge",
  copyLive: "Sunday Slow Jams · soft rotation",
  copyClosed: "Closed · next Sunday ET",
} as const;

const CYPHER_BASE = {
  queueMode: "PERSISTENT" as const,
  competitionMode: "NONE" as const,
  participantVisibility: "HIGH" as const,
  collaborationMode: true,
  upNextCardMs: 0,
  allowsWinnerStays: false,
  allowsElimination: false,
  restartOnEmpty: true,
};

export const EXPERIENCE_PERSONALITY: Record<ExperiencePersonalityId, ExperiencePersonality> = {
  CYPHER: {
    id: "CYPHER",
    ...CYPHER_BASE,
    votingMode: "STATS_ONLY",
    winnerState: "DISABLED",
    allowsVsOverlay: false,
    allowsFinalVoteOverlay: false,
  },
  CYPHER_KING: {
    id: "CYPHER_KING",
    ...CYPHER_BASE,
    votingMode: "COMPETITIVE",
    winnerState: "ENABLED",
    allowsVsOverlay: true,
    allowsFinalVoteOverlay: true,
  },
  BATTLE: {
    id: "BATTLE",
    queueMode: "TRANSIENT",
    competitionMode: "HEAD_TO_HEAD",
    votingMode: "COMPETITIVE",
    winnerState: "ENABLED",
    participantVisibility: "LOW_WHILE_ACTIVE",
    collaborationMode: false,
    upNextCardMs: 15_000,
    allowsWinnerStays: true,
    allowsVsOverlay: true,
    allowsFinalVoteOverlay: true,
    allowsElimination: true,
    restartOnEmpty: true,
  },
  CHALLENGE: {
    id: "CHALLENGE",
    queueMode: "ROUND_BASED",
    competitionMode: "CATEGORY_COMPARE",
    votingMode: "COMPETITIVE",
    winnerState: "ENABLED",
    participantVisibility: "LOW_WHILE_ACTIVE",
    collaborationMode: false,
    upNextCardMs: 15_000,
    allowsWinnerStays: false,
    allowsVsOverlay: true,
    allowsFinalVoteOverlay: true,
    allowsElimination: false,
    restartOnEmpty: true,
  },
  GAUNTLET: {
    id: "GAUNTLET",
    queueMode: "ROUND_BASED",
    competitionMode: "HEAD_TO_HEAD",
    votingMode: "COMPETITIVE",
    winnerState: "ENABLED",
    participantVisibility: "HIGH",
    collaborationMode: false,
    upNextCardMs: 15_000,
    allowsWinnerStays: true,
    allowsVsOverlay: true,
    allowsFinalVoteOverlay: true,
    allowsElimination: true,
    restartOnEmpty: true,
  },
  GAME: {
    id: "GAME",
    queueMode: "ROUND_BASED",
    competitionMode: "CATEGORY_COMPARE",
    votingMode: "COMPETITIVE",
    winnerState: "ENABLED",
    participantVisibility: "HIGH",
    collaborationMode: false,
    upNextCardMs: 10_000,
    allowsWinnerStays: false,
    allowsVsOverlay: true,
    allowsFinalVoteOverlay: true,
    allowsElimination: true,
    restartOnEmpty: true,
  },
  LIVE_GUEST_QUEUE: {
    id: "LIVE_GUEST_QUEUE",
    queueMode: "PERSISTENT",
    competitionMode: "NONE",
    votingMode: "OFF",
    winnerState: "DISABLED",
    participantVisibility: "HIGH",
    collaborationMode: true,
    upNextCardMs: 0,
    allowsWinnerStays: false,
    allowsVsOverlay: false,
    allowsFinalVoteOverlay: false,
    allowsElimination: false,
    restartOnEmpty: true,
  },
  SLOW_JAM: {
    id: "SLOW_JAM",
    queueMode: "PERSISTENT",
    competitionMode: "NONE",
    votingMode: "OFF",
    winnerState: "DISABLED",
    participantVisibility: "HIGH",
    collaborationMode: true,
    upNextCardMs: 0,
    allowsWinnerStays: false,
    allowsVsOverlay: false,
    allowsFinalVoteOverlay: false,
    allowsElimination: false,
    restartOnEmpty: false,
  },
};

export type ExperiencePersonalityResolveInput = {
  personalityId?: ExperiencePersonalityId | string | null;
  roomKind?: string | null;
  eventType?: string | null;
  experienceId?: string | null;
  category?: string | null;
  format?: "BATTLE" | "CHALLENGE" | "CYPHER" | string | null;
  featureFlags?: readonly string[] | null;
  /** CipherArenaConfig.mode — clash/faceoff ⇒ CYPHER_KING */
  cipherMode?: "cypher" | "clash" | "faceoff" | string | null;
  /** Explicit Cypher King contest flag */
  cypherKing?: boolean | null;
};

function hasCypherKingSignal(input: ExperiencePersonalityResolveInput): boolean {
  if (input.cypherKing === true) return true;
  if (input.cipherMode === "clash" || input.cipherMode === "faceoff") return true;
  const flags = (input.featureFlags ?? []).map((f) => f.toLowerCase());
  if (flags.some((f) => f === "cypher_king" || f === "cypherking" || f.includes("cypher-king"))) {
    return true;
  }
  const blob = [
    input.personalityId,
    input.experienceId,
    input.eventType,
    input.roomKind,
    input.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return blob.includes("cypher_king") || blob.includes("cypher-king") || blob.includes("cypherking");
}

export function getExperiencePersonality(
  id: ExperiencePersonalityId,
): ExperiencePersonality {
  return EXPERIENCE_PERSONALITY[id];
}

/**
 * Resolve shell personality from room/event signals.
 * Defaults conservatively: unknown → LIVE_GUEST_QUEUE (no confrontation UI).
 */
export function resolveExperiencePersonality(
  input: ExperiencePersonalityResolveInput = {},
): ExperiencePersonality {
  const explicit = (input.personalityId ?? "").toString().trim().toUpperCase().replace(/-/g, "_");
  if (explicit && explicit in EXPERIENCE_PERSONALITY) {
    return EXPERIENCE_PERSONALITY[explicit as ExperiencePersonalityId];
  }

  const kind = (input.roomKind ?? input.eventType ?? input.category ?? input.format ?? "")
    .toString()
    .toLowerCase();
  const expId = (input.experienceId ?? "").toLowerCase();

  const isCypher =
    kind.includes("cypher") ||
    kind.includes("cipher") ||
    expId.includes("cypher") ||
    expId.includes("cipher") ||
    input.format === "CYPHER";

  if (isCypher) {
    return hasCypherKingSignal(input)
      ? EXPERIENCE_PERSONALITY.CYPHER_KING
      : EXPERIENCE_PERSONALITY.CYPHER;
  }

  if (kind.includes("gauntlet") || kind.includes("dirty") || expId.includes("gauntlet")) {
    return EXPERIENCE_PERSONALITY.GAUNTLET;
  }
  if (kind.includes("battle") || input.format === "BATTLE" || expId.includes("battle")) {
    return EXPERIENCE_PERSONALITY.BATTLE;
  }
  if (kind.includes("challenge") || input.format === "CHALLENGE" || expId.includes("challenge")) {
    return EXPERIENCE_PERSONALITY.CHALLENGE;
  }
  if (kind.includes("game") || kind.includes("deal-or-feud")) {
    return EXPERIENCE_PERSONALITY.GAME;
  }
  if (
    kind.includes("slow-jam") ||
    kind.includes("slow_jam") ||
    expId.includes("slow-jam") ||
    expId.includes("slow_jam")
  ) {
    return EXPERIENCE_PERSONALITY.SLOW_JAM;
  }

  return EXPERIENCE_PERSONALITY.LIVE_GUEST_QUEUE;
}

/** Votes may be cast (stats and/or competitive). */
export function allowsVoting(p: ExperiencePersonality): boolean {
  return p.votingMode !== "OFF";
}

/** Votes feed metrics only — no winner framing. */
export function isStatsOnlyVoting(p: ExperiencePersonality): boolean {
  return p.votingMode === "STATS_ONLY";
}

export function allowsWinnerUi(p: ExperiencePersonality): boolean {
  return p.winnerState === "ENABLED";
}

export function allowsVsUi(p: ExperiencePersonality): boolean {
  return p.allowsVsOverlay;
}

/** Persistent NEXT UP wall (cypher / guest queue). */
export function isPersistentQueue(p: ExperiencePersonality): boolean {
  return p.queueMode === "PERSISTENT";
}

/** BotQueueDirector policy hint from personality. */
export function directorPolicyForPersonality(
  p: ExperiencePersonality,
): "fifo" | "rotation" | "winner_stays" | "challenge_acceptance" {
  if (p.allowsWinnerStays) return "winner_stays";
  if (p.queueMode === "PERSISTENT" && p.collaborationMode) return "rotation";
  if (p.id === "CHALLENGE") return "challenge_acceptance";
  return "fifo";
}

/**
 * Map presentation / empty-queue signals → cypher end motion kind.
 * CHAMPION only when personality.winnerState is ENABLED (Cypher King).
 */
export function resolveCypherEndKind(input: {
  personality: ExperiencePersonality;
  emptyParticipants?: boolean;
  memoryMoment?: boolean;
  statsVoteClosed?: boolean;
  groupJam?: boolean;
  rotationHandoff?: boolean;
}): import("@/lib/eos/CypherRuntimeEngine").CypherEndKind {
  if (input.personality.winnerState === "ENABLED" && !input.emptyParticipants) {
    return "CHAMPION";
  }
  if (input.emptyParticipants) return "NO_MORE_PARTICIPANTS";
  if (input.memoryMoment) return "MEMORY_MOMENT";
  if (input.statsVoteClosed) return "STATS_VOTE_END";
  if (input.groupJam) return "GROUP_JAM_CLOSE";
  if (input.rotationHandoff) return "ROTATION_COMPLETE";
  return "SESSION_WRAP";
}
