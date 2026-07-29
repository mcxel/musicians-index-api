/**
 * EOS Layer 5 — ProgramBoard contracts (registry-first).
 *
 * Owns **what** content is queued for rotation / Flight Deck suggestions.
 * Auto-Director still owns **where** idle monitor slots land.
 *
 * Rule 20: honest empty allowed — never attach fabricated viewer counts,
 * live occupancy, or opponents. LIVE_PREVIEW rows must come from a real
 * session source when wired; until then omit them (empty is valid).
 *
 * Universal Playlist System = FUTURE APPROVED (embed/link only) — not here.
 * Matchmaking / Audience Merge = FUTURE — not here.
 */

/** Content origin for a program-board row. */
export type ProgramBoardSource =
  | "EXPERIENCE"
  | "LIVE_PREVIEW"
  | "SPONSOR"
  | "NEWS"
  | "FRIEND_ACTIVITY";

/** Lifecycle of a board slot within a rotation block. */
export type ProgramSlotState =
  | "NOW_PLAYING"
  | "STARTING_SOON"
  | "QUEUED"
  | "EMPTY";

/**
 * One schedulable unit. EXPERIENCE rows carry ExperienceRegistry ids;
 * other sources may omit experienceId (honest empty / future wiring).
 */
export interface ProgramQueueItem {
  id: string;
  source: ProgramBoardSource;
  /** ExperienceRegistry id when source is EXPERIENCE */
  experienceId?: string;
  /** Relative weight inside ProgramQueueRegistry sequences */
  weight: number;
  /** Optional absolute start; omit → pure sequence order / block math */
  scheduledStartMs?: number;
  title?: string;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
}

/** One board surface slot (not a Flight Deck monitor id). */
export interface ProgramSlot {
  slotIndex: number;
  state: ProgramSlotState;
  /** null = honest empty */
  item: ProgramQueueItem | null;
  blockStartMs?: number;
  blockEndMs?: number;
  /** Resolved ExperienceRegistry.entryRoute when available */
  entryRoute?: string;
}

/** Current rotation-block highlight. item null = nothing scheduled. */
export interface NowPlaying {
  item: ProgramQueueItem | null;
  entryRoute?: string;
  blockStartsAtMs?: number;
  blockEndsAtMs?: number;
}

/** Upcoming blocks. items may be [] (honest empty). */
export interface StartingSoon {
  items: Array<{
    item: ProgramQueueItem;
    entryRoute?: string;
    blockStartsAtMs: number;
    blockEndsAtMs: number;
  }>;
}

/** Full board snapshot for consumers (Auto-Director, future public board UI). */
export interface ProgramBoard {
  nowPlaying: NowPlaying;
  startingSoon: StartingSoon;
  /** Remaining queued items after now + starting-soon window */
  queue: ProgramQueueItem[];
  slots: ProgramSlot[];
  generatedAtMs: number;
  /** Configured block length used for this snapshot */
  blockDurationMs: number;
}

/** Event emitted when an experience block ends — drives next suggestions. */
export interface ExperienceFinishedEvent {
  experienceId: string;
  finishedAtMs: number;
  /** Optional queue id that just completed */
  queueItemId?: string;
}
