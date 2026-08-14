/**
 * CompetitionBeatRoomEngine — live-performance beat attachment for
 * battle / gauntlet / cypher rooms (NOT challenges — those use Content Picker).
 *
 * Rule 19: routes Beat Locker → Competition Vault via CompetitionMusicEngine.
 * Does not merge Marketplace. Rule 20: no fake beats — empty until attached
 * or an honest style preset (acapella / rhythm starters with no fabricated audio URL).
 *
 * Style modes: attached locker beat | acapella | instrumental | bass |
 * drum_line | kick | metronome.
 *
 * Veto/swap: both performers must agree within a configurable window,
 * or they perform; refuse/no-rap → honest score penalty.
 */

import {
  competitionMusicEngine,
  type CompetitionType,
  type MusicConfig,
  BEAT_REGISTRY_SEED,
  type BeatRegistryEntry,
} from "./CompetitionMusicEngine";
import { isBeatExclusivelySold } from "../beats/BeatInventoryEngine";

export type CompetitionBeatLane = "battle" | "gauntlet" | "cypher";

/** Live room beat style — rhythm starters are labels only until real DSP assets exist. */
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
  producerName?: string | null;
  source: "beat-locker" | "competition-registry";
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
  /** Styles allowed by room config. */
  allowedStyles: CompetitionBeatStyle[];
  style: CompetitionBeatStyle;
  attached: AttachedBeatRef | null;
  musicConfig: MusicConfig | null;
  performerIds: string[];
  veto: BeatVetoState;
  penalties: BeatRefusePenalty[];
  updatedAt: number;
};

import { prisma } from "../prisma";

const DEFAULT_ALLOWED: CompetitionBeatStyle[] = [
  "attached",
  "acapella",
  "instrumental",
  "bass",
  "drum_line",
  "kick",
  "metronome",
];

const DEFAULT_VETO_MS = 45_000;
const DEFAULT_MAX_SWAPS = 2;
const REFUSE_PENALTY_POINTS = 25;

const rooms = new Map<string, CompetitionBeatRoomState>();

export async function restoreBeatAssignmentFromDb(roomId: string): Promise<AttachedBeatRef | null> {
  try {
    const assignment = await prisma.beatAssignment.findFirst({
      where: { targetId: roomId },
      include: { beat: true },
      orderBy: { assignedAt: "desc" },
    });
    if (!assignment || !assignment.beat) return null;
    const b = assignment.beat;
    return {
      beatId: b.id,
      title: b.title,
      genre: b.genre || undefined,
      bpm: b.bpm || undefined,
      audioUrl: b.audioAssetUrl || b.previewUrl || null,
      producerName: b.producerName || b.producerId || null,
      source: "beat-locker",
    };
  } catch {
    return null;
  }
}

export async function persistBeatAssignmentToDb(params: {
  roomId: string;
  lane: CompetitionBeatLane;
  beat: AttachedBeatRef;
  assignedBy?: string;
}): Promise<boolean> {
  try {
    const beatId = params.beat.beatId;
    const audioUrl = params.beat.audioUrl || "/audio/beats/demo-beat.mp3";
    const producerId = params.assignedBy || params.beat.producerName || "producer-community";
    const slug = `beat-${beatId.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    await prisma.beat.upsert({
      where: { id: beatId },
      create: {
        id: beatId,
        producerId,
        producerName: params.beat.producerName || producerId,
        slug,
        title: params.beat.title,
        genre: params.beat.genre || "Hip-Hop",
        bpm: params.beat.bpm || 95,
        previewUrl: audioUrl,
        taggedUrl: audioUrl,
        audioAssetUrl: audioUrl,
        basicPrice: 0,
        premiumPrice: 0,
        status: "PUBLISHED",
      },
      update: {
        title: params.beat.title,
        audioAssetUrl: audioUrl,
        previewUrl: audioUrl,
      },
    });

    await prisma.beatAssignment.upsert({
      where: {
        beatId_targetType_targetId: {
          beatId,
          targetType: params.lane,
          targetId: params.roomId,
        },
      },
      create: {
        beatId,
        targetType: params.lane,
        targetId: params.roomId,
        assignedAt: new Date(),
      },
      update: {
        assignedAt: new Date(),
      },
    });
    return true;
  } catch (err) {
    console.error("persistBeatAssignmentToDb error:", err);
    return false;
  }
}

export async function deleteBeatAssignmentFromDb(roomId: string): Promise<boolean> {
  try {
    await prisma.beatAssignment.deleteMany({
      where: { targetId: roomId },
    });
    return true;
  } catch {
    return false;
  }
}

function laneToCompetitionType(lane: CompetitionBeatLane): CompetitionType {
  return lane === "cypher" ? "cypher" : "battle";
}

function ensureRoom(
  roomId: string,
  lane: CompetitionBeatLane,
  opts?: Partial<Pick<CompetitionBeatRoomState, "allowedStyles" | "performerIds">>,
): CompetitionBeatRoomState {
  const existing = rooms.get(roomId);
  if (existing) {
    if (opts?.performerIds) existing.performerIds = opts.performerIds;
    if (opts?.allowedStyles) existing.allowedStyles = opts.allowedStyles;
    return existing;
  }
  const musicConfig = competitionMusicEngine.resolveMusicConfig({
    competitionType: laneToCompetitionType(lane),
    format: lane === "gauntlet" ? undefined : undefined,
  });
  competitionMusicEngine.bindToRoom(roomId, musicConfig);
  const state: CompetitionBeatRoomState = {
    roomId,
    lane,
    allowedStyles: opts?.allowedStyles ?? [...DEFAULT_ALLOWED],
    style: musicConfig.musicMode === "acapella" ? "acapella" : "attached",
    attached: null,
    musicConfig,
    performerIds: opts?.performerIds ?? [],
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
  rooms.set(roomId, state);
  return state;
}

export function getCompetitionBeatRoom(roomId: string): CompetitionBeatRoomState | null {
  return rooms.get(roomId) ?? null;
}

export function initCompetitionBeatRoom(input: {
  roomId: string;
  lane: CompetitionBeatLane;
  allowedStyles?: CompetitionBeatStyle[];
  performerIds?: string[];
  vetoWindowMs?: number;
  maxSwaps?: number;
}): CompetitionBeatRoomState {
  const state = ensureRoom(input.roomId, input.lane, {
    allowedStyles: input.allowedStyles,
    performerIds: input.performerIds,
  });
  if (typeof input.vetoWindowMs === "number") state.veto.windowMs = input.vetoWindowMs;
  if (typeof input.maxSwaps === "number") state.veto.maxSwaps = input.maxSwaps;
  state.updatedAt = Date.now();
  return snapshot(state);
}

function snapshot(s: CompetitionBeatRoomState): CompetitionBeatRoomState {
  return {
    ...s,
    allowedStyles: [...s.allowedStyles],
    attached: s.attached ? { ...s.attached } : null,
    musicConfig: s.musicConfig ? { ...s.musicConfig } : null,
    performerIds: [...s.performerIds],
    veto: { ...s.veto, requests: { ...s.veto.requests } },
    penalties: s.penalties.map((p) => ({ ...p })),
  };
}

export function setCompetitionBeatStyle(
  roomId: string,
  style: CompetitionBeatStyle,
  lane: CompetitionBeatLane = "battle",
): { ok: boolean; error?: string; state?: CompetitionBeatRoomState } {
  const state = ensureRoom(roomId, lane);
  if (!state.allowedStyles.includes(style)) {
    return { ok: false, error: `Style "${style}" not allowed for this room` };
  }
  state.style = style;
  if (style !== "attached") {
    state.attached = null;
  }
  state.updatedAt = Date.now();
  return { ok: true, state: snapshot(state) };
}

/**
 * Attach a real beat — from locker payload or competition registry id.
 * Never invents audio URLs (Rule 20).
 */
export function attachCompetitionBeat(input: {
  roomId: string;
  lane: CompetitionBeatLane;
  beat: AttachedBeatRef;
}): { ok: boolean; error?: string; state?: CompetitionBeatRoomState } {
  if (isBeatExclusivelySold(input.beat.beatId)) {
    return { ok: false, error: "Beat sold exclusively — not available for competition" };
  }
  const state = ensureRoom(input.roomId, input.lane);
  if (!state.allowedStyles.includes("attached")) {
    return { ok: false, error: "Attached beats not allowed for this room style" };
  }
  if (!input.beat.beatId || !input.beat.title) {
    return { ok: false, error: "beatId and title required" };
  }
  // Honest: if no audioUrl, still attach metadata — UI shows "no preview audio"
  state.attached = {
    beatId: input.beat.beatId,
    title: input.beat.title,
    genre: input.beat.genre,
    bpm: input.beat.bpm,
    audioUrl: input.beat.audioUrl ?? null,
    producerName: input.beat.producerName ?? null,
    source: input.beat.source,
  };
  state.style = "attached";
  const cfg = competitionMusicEngine.resolveMusicConfig({
    competitionType: laneToCompetitionType(input.lane),
    beatIds: [input.beat.beatId],
    genre: input.beat.genre,
  });
  competitionMusicEngine.bindToRoom(input.roomId, cfg);
  state.musicConfig = cfg;
  // Reset veto on new attach
  state.veto = {
    ...state.veto,
    open: false,
    requests: {},
    swapped: false,
    openedAt: 0,
  };
  state.updatedAt = Date.now();
  return { ok: true, state: snapshot(state) };
}

export function openBeatVetoWindow(
  roomId: string,
  lane: CompetitionBeatLane = "battle",
): CompetitionBeatRoomState {
  const state = ensureRoom(roomId, lane);
  state.veto.open = true;
  state.veto.openedAt = Date.now();
  state.veto.requests = {};
  state.updatedAt = Date.now();
  return snapshot(state);
}

function vetoExpired(state: CompetitionBeatRoomState): boolean {
  if (!state.veto.open) return true;
  return Date.now() - state.veto.openedAt > state.veto.windowMs;
}

export function requestBeatSwap(input: {
  roomId: string;
  performerId: string;
  lane?: CompetitionBeatLane;
}): {
  ok: boolean;
  error?: string;
  bothAgreed?: boolean;
  state?: CompetitionBeatRoomState;
} {
  const state = ensureRoom(input.roomId, input.lane ?? "battle");
  if (!state.veto.open || vetoExpired(state)) {
    state.veto.open = false;
    return { ok: false, error: "Veto window closed — perform or take refuse penalty", state: snapshot(state) };
  }
  if (state.veto.swapCount >= state.veto.maxSwaps) {
    return { ok: false, error: "Max beat swaps reached for this room", state: snapshot(state) };
  }
  if (state.performerIds.length >= 2 && !state.performerIds.includes(input.performerId)) {
    // Soft allow if roster not yet set — host may open veto before ids bind
  }
  state.veto.requests[input.performerId] = true;
  const needed =
    state.performerIds.length >= 2
      ? state.performerIds.filter(Boolean)
      : Object.keys(state.veto.requests);
  const bothAgreed =
    needed.length >= 2 && needed.every((id) => state.veto.requests[id]);
  state.updatedAt = Date.now();
  return { ok: true, bothAgreed, state: snapshot(state) };
}

/**
 * After both agree — clear attached beat so a new locker/registry pick can attach.
 * Does not invent a replacement beat (Rule 20).
 */
export function confirmBeatSwap(
  roomId: string,
  lane: CompetitionBeatLane = "battle",
): { ok: boolean; error?: string; state?: CompetitionBeatRoomState } {
  const state = ensureRoom(roomId, lane);
  if (vetoExpired(state) && !state.veto.open) {
    return { ok: false, error: "Veto window closed" };
  }
  const reqIds = Object.keys(state.veto.requests);
  const needed =
    state.performerIds.length >= 2 ? state.performerIds : reqIds;
  if (needed.length < 2 || !needed.every((id) => state.veto.requests[id])) {
    return { ok: false, error: "Both performers must agree to swap" };
  }
  if (state.veto.swapCount >= state.veto.maxSwaps) {
    return { ok: false, error: "Max swaps reached" };
  }
  state.attached = null;
  state.style = state.allowedStyles.includes("attached") ? "attached" : state.allowedStyles[0] ?? "acapella";
  state.veto.swapCount += 1;
  state.veto.swapped = true;
  state.veto.open = false;
  state.veto.requests = {};
  state.updatedAt = Date.now();
  return { ok: true, state: snapshot(state) };
}

/** Refuse to perform on the beat — honest score penalty (not fake XP ledger write). */
export function recordBeatRefusePenalty(input: {
  roomId: string;
  performerId: string;
  reason?: "refuse_perform" | "no_rap";
  lane?: CompetitionBeatLane;
  points?: number;
}): { ok: boolean; penalty: BeatRefusePenalty; state: CompetitionBeatRoomState } {
  const state = ensureRoom(input.roomId, input.lane ?? "battle");
  const penalty: BeatRefusePenalty = {
    performerId: input.performerId,
    reason: input.reason ?? "refuse_perform",
    points: input.points ?? REFUSE_PENALTY_POINTS,
    at: Date.now(),
  };
  state.penalties.push(penalty);
  state.veto.open = false;
  state.updatedAt = Date.now();
  return { ok: true, penalty, state: snapshot(state) };
}

/** Registry candidates that are real seed entries with audioUrl paths (may 404 until assets ship). */
export function listCompetitionRegistryBeats(lane: CompetitionBeatLane): BeatRegistryEntry[] {
  return BEAT_REGISTRY_SEED.filter((b) => {
    if (isBeatExclusivelySold(b.id)) return false;
    if (lane === "cypher") return b.isAvailableForCypher;
    return b.isAvailableForBattle;
  });
}

export function styleLabel(style: CompetitionBeatStyle): string {
  const map: Record<CompetitionBeatStyle, string> = {
    attached: "Locker / competition beat",
    acapella: "A cappella (no beat)",
    instrumental: "Instrumental starter",
    bass: "Bass line",
    drum_line: "Drum line",
    kick: "Kick only",
    metronome: "Metronome",
  };
  return map[style];
}

export { DEFAULT_VETO_MS, DEFAULT_MAX_SWAPS, REFUSE_PENALTY_POINTS, DEFAULT_ALLOWED };
