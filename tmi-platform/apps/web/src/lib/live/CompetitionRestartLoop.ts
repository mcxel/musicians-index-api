/**
 * CompetitionRestartLoop — one auto-restart sequence for all competition rooms.
 *
 * Marcel lock (2026-08-19) — order is NON-NEGOTIABLE:
 *   SESSION/MATCH FINISH
 *     → ending animation (type-appropriate; not this module)
 *     → RESET  (clear stage / match / completed slots — honest empty)
 *     → SHUFFLE (reseed recruiting pool ONLY after reset)
 *     → ROOM RESTART into RECRUITING
 *     → new performers join → next session
 *
 * Do NOT shuffle while old match state is live.
 * Rule 20: never invent fill. Empty recruiting is honest.
 */

import {
  getQueueSnapshot,
  resetQueueForRecruiting,
  shuffleWaitingSlots,
  type VenueQueue,
} from "@/lib/live/queueEngine";
import {
  allowsWinnerUi,
  resolveExperiencePersonality,
  type ExperiencePersonality,
} from "@/lib/live/ExperiencePersonality";
import { setGauntletCurrentRun, getGauntletRoom } from "@/lib/gauntlet/GauntletRoomRuntime";

export type CompetitionRestartPhase = "ENDING" | "RESET" | "SHUFFLE" | "RECRUITING";

export const COMPETITION_RESTART_SEQUENCE: readonly CompetitionRestartPhase[] = [
  "RESET",
  "SHUFFLE",
  "RECRUITING",
] as const;

/**
 * Canonical automated event window (UTC instants — not device-local clock).
 * Stagger: hash(roomId) → 15 one-minute slots so rooms do not share one expiry.
 */
export const COMPETITION_EVENT_WINDOW_MS = 15 * 60 * 1000;
export const COMPETITION_STAGGER_SLOTS = 15;

export function hashRoomId(roomId: string): number {
  let h = 2166136261;
  for (let i = 0; i < roomId.length; i++) {
    h ^= roomId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function competitionStaggerOffsetMs(roomId: string): number {
  const slotMs = COMPETITION_EVENT_WINDOW_MS / COMPETITION_STAGGER_SLOTS;
  return (hashRoomId(roomId) % COMPETITION_STAGGER_SLOTS) * slotMs;
}

export type CompetitionEventWindow = {
  index: number;
  startMs: number;
  endMs: number;
  offsetMs: number;
  remainingMs: number;
};

export function getCompetitionEventWindow(
  roomId: string,
  nowMs: number = Date.now(),
): CompetitionEventWindow {
  const offsetMs = competitionStaggerOffsetMs(roomId);
  const index = Math.floor((nowMs - offsetMs) / COMPETITION_EVENT_WINDOW_MS);
  const startMs = index * COMPETITION_EVENT_WINDOW_MS + offsetMs;
  const endMs = startMs + COMPETITION_EVENT_WINDOW_MS;
  return {
    index,
    startMs,
    endMs,
    offsetMs,
    remainingMs: Math.max(0, endMs - nowMs),
  };
}

export type CompetitionRestartResult = {
  ok: boolean;
  reason?: string;
  /** Phases completed in order. SHUFFLE never appears before RESET. */
  completed: CompetitionRestartPhase[];
  recruiting: boolean;
  discoveryLabel: string;
  queue?: VenueQueue;
};

export type CompetitionRestartInput = {
  venueSlug: string;
  personality?: ExperiencePersonality;
  roomKind?: string | null;
  cypherKing?: boolean;
  /** After winner/result reveal, still restart (battle/challenge/gauntlet). */
  afterResultReveal?: boolean;
};

export function recruitingLabel(personality: ExperiencePersonality): string {
  if (personality.id === "CYPHER" || personality.id === "CYPHER_KING") {
    return "Looking for performers";
  }
  if (personality.id === "BATTLE") return "Looking for next challengers";
  if (personality.id === "CHALLENGE") return "Looking for next submissions";
  if (personality.id === "GAUNTLET") return "Looking for next gauntlet set";
  return "Looking for performers";
}

/**
 * Refuse shuffle if match slots still live (on-stage / staging / next-up).
 * Callers MUST reset first — this is the lock.
 */
export function canShuffleRecruitingPool(venueSlug: string): boolean {
  const snap = getQueueSnapshot(venueSlug);
  return !snap.slots.some(
    (s) => s.status === "on-stage" || s.status === "staging" || s.status === "next-up",
  );
}

/**
 * Run RESET → SHUFFLE → RECRUITING on the same venueSlug.
 * Ending animation is owned by the room overlay; this loop starts after it.
 */
export function runCompetitionRestartLoop(
  input: CompetitionRestartInput,
): CompetitionRestartResult {
  const personality =
    input.personality ??
    resolveExperiencePersonality({
      roomKind: input.roomKind,
      cypherKing: input.cypherKing,
    });

  if (!personality.restartOnEmpty && !input.afterResultReveal) {
    return {
      ok: false,
      reason: "restart-disabled",
      completed: [],
      recruiting: false,
      discoveryLabel: recruitingLabel(personality),
    };
  }

  const completed: CompetitionRestartPhase[] = [];

  // 1. RESET — clear stage, match slots, completed participants. Never shuffle yet.
  const afterReset = resetQueueForRecruiting(input.venueSlug);
  completed.push("RESET");

  if (personality.id === "GAUNTLET" && getGauntletRoom(input.venueSlug)) {
    setGauntletCurrentRun(input.venueSlug, null);
  }

  // 2. SHUFFLE — only legal after reset (no live match slots).
  if (!canShuffleRecruitingPool(input.venueSlug)) {
    return {
      ok: false,
      reason: "shuffle-blocked-match-still-live",
      completed,
      recruiting: false,
      discoveryLabel: recruitingLabel(personality),
      queue: afterReset,
    };
  }
  shuffleWaitingSlots(input.venueSlug);
  completed.push("SHUFFLE");

  // 3. RECRUITING — same room stays discoverable; honest empty.
  completed.push("RECRUITING");

  return {
    ok: true,
    reason: "recruiting-open",
    completed,
    recruiting: true,
    discoveryLabel: recruitingLabel(personality),
    queue: afterReset,
  };
}

/** End-motion kind hint after match finish — winner overlay only when personality allows. */
export function restartEndMotionKind(personality: ExperiencePersonality): "winner" | "result" | "session_wrap" {
  if (personality.id === "CYPHER") return "session_wrap";
  if (personality.id === "CYPHER_KING" || allowsWinnerUi(personality)) {
    if (personality.id === "CHALLENGE") return "result";
    return "winner";
  }
  return "session_wrap";
}
