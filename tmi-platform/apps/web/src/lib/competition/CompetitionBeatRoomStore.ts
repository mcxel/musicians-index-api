/**
 * CompetitionBeatRoomStore.ts
 *
 * Client-safe in-memory store for competition beat attachment in live rooms.
 * Pure in-memory state — ZERO server-only database imports (prisma, pg, pg-native).
 * Imported by WinnerStaysLifecycleEngine, BattleMatchLifecycleEngine, and client UI.
 */

import type { MusicConfig } from "./CompetitionMusicEngine";

export type CompetitionBeatLane = "battle" | "gauntlet" | "cypher";

/** Live room beat style - rhythm starters are labels only until real DSP assets exist. */
export type CompetitionBeatStyle =
  | "attached"
  | "acapella"
  | "instrumental"
  | "bass"
  | "drum_line"
  | "kick"
  | "metronome";

export type AttachedBeatRef = {
  beatId: string;
  title: string;
  genre?: string;
  bpm?: number;
  audioUrl?: string | null;
  playbackStreamUrl?: string | null;
  producerName?: string | null;
  source: "beat-locker" | "competition-registry";
  fitScore?: number;
  matchReasons?: string[];
  cueOffsetMs?: number;
  cueOffsetSeconds?: number;
  isSafeLoopable?: boolean;
  loopStartMs?: number;
  loopEndMs?: number;
  dropTier?: string;
};

export type BeatVetoState = {
  open: boolean;
  openedAt: number;
  windowMs: number;
  requests: Record<string, true>;
  swapped: boolean;
  swapCount: number;
  maxSwaps: number;
};

export type BeatRefusePenalty = {
  performerId: string;
  reason: "refuse_perform" | "no_rap";
  points: number;
  at: number;
};

export type CompetitionBeatRoomState = {
  roomId: string;
  lane: CompetitionBeatLane;
  allowedStyles: CompetitionBeatStyle[];
  style: CompetitionBeatStyle;
  attached: AttachedBeatRef | null;
  musicConfig: MusicConfig | null;
  performerIds: string[];
  veto: BeatVetoState;
  penalties: BeatRefusePenalty[];
  updatedAt: number;
};

export const DEFAULT_ALLOWED: CompetitionBeatStyle[] = [
  "attached",
  "acapella",
  "instrumental",
  "bass",
  "drum_line",
  "kick",
  "metronome",
];

export const DEFAULT_VETO_MS = 45_000;
export const DEFAULT_MAX_SWAPS = 2;
export const REFUSE_PENALTY_POINTS = 25;

export const rooms = new Map<string, CompetitionBeatRoomState>();

export function ensureRoom(
  roomId: string,
  lane: CompetitionBeatLane = "battle",
  opts?: {
    allowedStyles?: CompetitionBeatStyle[];
    performerIds?: string[];
  },
): CompetitionBeatRoomState {
  let existing = rooms.get(roomId);
  if (!existing) {
    existing = {
      roomId,
      lane,
      allowedStyles: opts?.allowedStyles && opts.allowedStyles.length > 0 ? opts.allowedStyles : DEFAULT_ALLOWED,
      style: "attached",
      attached: null,
      musicConfig: null,
      performerIds: opts?.performerIds ? [...opts.performerIds] : [],
      veto: {
        open: false,
        openedAt: 0,
        windowMs: DEFAULT_VETO_MS,
        requests: {},
        swapped: false,
        swapCount: 0,
        maxSwaps: DEFAULT_MAX_SWAPS,
      },
      penalties: [],
      updatedAt: Date.now(),
    };
    rooms.set(roomId, existing);
  }
  return existing;
}

export function snapshot(state: CompetitionBeatRoomState): CompetitionBeatRoomState {
  return {
    ...state,
    allowedStyles: [...state.allowedStyles],
    performerIds: [...state.performerIds],
    veto: { ...state.veto, requests: { ...state.veto.requests } },
    penalties: state.penalties.map((p) => ({ ...p })),
  };
}

export function getCompetitionBeatRoom(roomId: string): CompetitionBeatRoomState | null {
  return rooms.get(roomId) ?? null;
}

export function clearCompetitionBeatRoom(roomId: string): void {
  rooms.delete(roomId);
}
