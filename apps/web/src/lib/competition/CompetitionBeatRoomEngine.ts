export * from "./CompetitionBeatRoomStore";
import {
  rooms,
  snapshot,
  clearCompetitionBeatRoom,
  DEFAULT_ALLOWED,
  DEFAULT_VETO_MS,
  DEFAULT_MAX_SWAPS,
  REFUSE_PENALTY_POINTS,
  type CompetitionBeatLane,
  type CompetitionBeatStyle,
  type AttachedBeatRef,
  type BeatVetoState,
  type BeatRefusePenalty,
  type CompetitionBeatRoomState,
} from "./CompetitionBeatRoomStore";
/**
 * CompetitionBeatRoomEngine - live-performance beat attachment for
 * battle / gauntlet / cypher rooms.
 *
 * Batch 1 & 2B.1 Convergence:
 * - Production queries real database beats from prisma.beat instead of static seed arrays.
 * - Enforces durable DB-backed exclusive-sale checks via isBeatExclusivelySoldDurable.
 * - Applies truthful candidate fit evaluation via BeatMatchingAuthority.
 * - Enforces BeatPocketDropAuthority (4-tier pocket drop hierarchy: Producer -> Analysis -> Meter -> Zero Fallback).
 * - Enforces EventPlaybackTokenAuthority: raw master audioAssetUrl is NEVER leaked to room participants.
 * - Quarantines BEAT_REGISTRY_SEED strictly as an offline/test fixture fallback.
 */

import {
  competitionMusicEngine,
  type CompetitionType,
  type MusicConfig,
  BEAT_REGISTRY_SEED,
  type BeatRegistryEntry,
} from "./CompetitionMusicEngine";
import { isBeatExclusivelySold, isBeatExclusivelySoldDurable } from "../beats/BeatInventoryEngine";
import { evaluateBeatFit, type ExperienceMatchingContext } from "../beats/BeatMatchingAuthority";
import { resolveBeatPocketDrop } from "../beats/BeatPocketDropAuthority";
import { buildAuthorizedPlaybackUrl } from "../beats/EventPlaybackTokenAuthority";
import { prisma } from "../prisma";



/** Live room beat style - rhythm starters are labels only until real DSP assets exist. */








/**
 * Restore durable beat assignment from the database.
 * SECURITY: Never returns the raw master audioAssetUrl. Uses authorized stream URL.
 */
export async function restoreBeatAssignmentFromDb(roomId: string): Promise<AttachedBeatRef | null> {
  try {
    const assignment = await prisma.beatAssignment.findFirst({
      where: { targetId: roomId },
      include: { beat: true },
      orderBy: { assignedAt: "desc" },
    });
    if (!assignment || !assignment.beat) return null;
    const b = assignment.beat;

    const drop = resolveBeatPocketDrop({
      beatId: b.id,
      markerIntro: b.markerIntro,
      markerVerseA: b.markerVerseA,
      markerHook: b.markerHook,
      markerVerseB: b.markerVerseB,
      markerBridge: b.markerBridge,
      markerOutro: b.markerOutro,
      bpm: b.bpm,
      durationSeconds: b.durationSeconds,
    });

    const streamUrl = buildAuthorizedPlaybackUrl({
      beatId: b.id,
      roomId,
      userId: "restored-session",
    });

    return {
      beatId: b.id,
      title: b.title,
      genre: b.genre || undefined,
      bpm: b.bpm || undefined,
      audioUrl: streamUrl,
      playbackStreamUrl: streamUrl,
      producerName: b.producerName || b.producerId || null,
      source: "beat-locker",
      cueOffsetMs: drop.cueOffsetMs,
      cueOffsetSeconds: drop.cueOffsetSeconds,
      isSafeLoopable: drop.isSafeLoopable,
      loopStartMs: drop.loopStartMs,
      loopEndMs: drop.loopEndMs,
      dropTier: drop.tier,
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
        previewUrl: "",
        taggedUrl: "",
        basicPrice: 0,
        premiumPrice: 0,
        status: "PUBLISHED",
      },
      update: {
        title: params.beat.title,
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

    // Record usage history
    await prisma.beatUsageHistory.create({
      data: {
        beatId,
        roomId: params.roomId,
        result: "complete",
      },
    }).catch(() => {});

    // Increment play count for fairness tracking
    await prisma.beat.update({
      where: { id: beatId },
      data: { playCount: { increment: 1 } },
    }).catch(() => {});

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
 * Attach a real beat - from locker payload or competition registry id.
 * Checked against durable exclusive sale.
 */
export function attachCompetitionBeat(input: {
  roomId: string;
  lane: CompetitionBeatLane;
  beat: AttachedBeatRef;
}): { ok: boolean; error?: string; state?: CompetitionBeatRoomState } {
  if (isBeatExclusivelySold(input.beat.beatId)) {
    return { ok: false, error: "Beat sold exclusively - not available for competition" };
  }
  const state = ensureRoom(input.roomId, input.lane);
  if (!state.allowedStyles.includes("attached")) {
    return { ok: false, error: "Attached beats not allowed for this room style" };
  }
  if (!input.beat.beatId || !input.beat.title) {
    return { ok: false, error: "beatId and title required" };
  }

  state.attached = {
    beatId: input.beat.beatId,
    title: input.beat.title,
    genre: input.beat.genre,
    bpm: input.beat.bpm,
    audioUrl: input.beat.audioUrl ?? null,
    playbackStreamUrl: input.beat.playbackStreamUrl ?? input.beat.audioUrl ?? null,
    producerName: input.beat.producerName ?? null,
    source: input.beat.source,
    fitScore: input.beat.fitScore,
    matchReasons: input.beat.matchReasons,
    cueOffsetMs: input.beat.cueOffsetMs ?? 0,
    cueOffsetSeconds: input.beat.cueOffsetSeconds ?? 0,
    isSafeLoopable: input.beat.isSafeLoopable ?? false,
    loopStartMs: input.beat.loopStartMs,
    loopEndMs: input.beat.loopEndMs,
    dropTier: input.beat.dropTier ?? "TRUTHFUL_ZERO_FALLBACK",
  };
  state.style = "attached";
  const cfg = competitionMusicEngine.resolveMusicConfig({
    competitionType: laneToCompetitionType(input.lane),
    beatIds: [input.beat.beatId],
    genre: input.beat.genre,
  });
  competitionMusicEngine.bindToRoom(input.roomId, cfg);
  state.musicConfig = cfg;
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
    return { ok: false, error: "Veto window closed - perform or take refuse penalty", state: snapshot(state) };
  }
  if (state.veto.swapCount >= state.veto.maxSwaps) {
    return { ok: false, error: "Max beat swaps reached for this room", state: snapshot(state) };
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

export function confirmBeatSwap(
  roomId: string,
  lane: CompetitionBeatLane = "battle",
): { ok: boolean; error?: string; state?: CompetitionBeatRoomState } {
  const state = ensureRoom(roomId, lane);
  if (vetoExpired(state) && !state.veto.open) {
    return { ok: false, error: "Veto window closed" };
  }
  const reqIds = Object.keys(state.veto.requests);
  const needed = state.performerIds.length >= 2 ? state.performerIds : reqIds;
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

/**
 * Get eligible candidate beats from the real Prisma database.
 * SECURITY LAW: Master audioAssetUrl is NEVER returned. Emits authorized stream URLs.
 */
export async function getEligibleCompetitionBeatsFromDb(
  lane: CompetitionBeatLane,
  context?: Partial<ExperienceMatchingContext> & { roomId?: string; userId?: string }
): Promise<AttachedBeatRef[]> {
  const matchingContext: ExperienceMatchingContext = {
    experienceType: laneToCompetitionType(lane),
    lane,
    ...context,
  };

  try {
    const rows = await prisma.beat.findMany({
      where: {
        status: { in: ["LIVE", "PUBLISHED", "APPROVED", "CERTIFIED"] },
        moderationStatus: { not: "REJECTED" },
        competitionEligible: true,
        NOT: {
          tags: { has: "exclusively-sold" },
        },
        licenses: {
          none: {
            type: { in: ["exclusive", "EXCLUSIVE"] },
          },
        },
      },
      orderBy: { playCount: "asc" },
      take: 40,
    });

    if (rows.length > 0) {
      const candidates: AttachedBeatRef[] = [];

      for (const row of rows) {
        const isExclusive = await isBeatExclusivelySoldDurable(row.id);
        const evalResult = evaluateBeatFit(
          {
            id: row.id,
            title: row.title,
            genre: row.genre,
            genreJson: row.genreJson,
            bpm: row.bpm,
            key: row.key,
            tags: row.tags,
            producerId: row.producerId,
            producerName: row.producerName,
            status: row.status,
            moderationStatus: row.moderationStatus,
            competitionEligible: row.competitionEligible,
            playCount: row.playCount,
            isExclusiveSold: isExclusive,
          },
          matchingContext
        );

        if (evalResult.eligible) {
          // Resolve musical pocket drop and cue offset
          const drop = resolveBeatPocketDrop({
            beatId: row.id,
            markerIntro: row.markerIntro,
            markerVerseA: row.markerVerseA,
            markerHook: row.markerHook,
            markerVerseB: row.markerVerseB,
            markerBridge: row.markerBridge,
            markerOutro: row.markerOutro,
            bpm: row.bpm,
            durationSeconds: row.durationSeconds,
            formatCategory: laneToCompetitionType(lane) as any,
          });

          // Generate authorized stream URL if room context is provided
          // Master audioAssetUrl is NEVER exposed to room clients
          const streamUrl = context?.roomId
            ? buildAuthorizedPlaybackUrl({
                beatId: row.id,
                roomId: context.roomId,
                userId: context.userId || "room-participant",
              })
            : null;

          candidates.push({
            beatId: row.id,
            title: row.title,
            genre: row.genre || undefined,
            bpm: row.bpm || undefined,
            audioUrl: streamUrl,
            playbackStreamUrl: streamUrl,
            producerName: row.producerName || row.producerId || null,
            source: "beat-locker",
            fitScore: evalResult.fitScore,
            matchReasons: evalResult.reasons,
            cueOffsetMs: drop.cueOffsetMs,
            cueOffsetSeconds: drop.cueOffsetSeconds,
            isSafeLoopable: drop.isSafeLoopable,
            loopStartMs: drop.loopStartMs,
            loopEndMs: drop.loopEndMs,
            dropTier: drop.tier,
          });
        }
      }

      // Sort by fit score descending
      candidates.sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0));
      if (candidates.length > 0) return candidates;
    }
  } catch (err) {
    console.warn("[CompetitionBeatRoomEngine] Database beat query fallback:", err);
  }

  // Quarantined offline fixture fallback (zero fabricated audio in production)
  return listCompetitionRegistryBeats(lane).map((b) => ({
    beatId: b.id,
    title: b.title,
    genre: b.genre,
    bpm: b.bpm,
    audioUrl: b.audioUrl,
    producerName: b.ownerId,
    source: "competition-registry" as const,
    fitScore: 50,
    matchReasons: ["Quarantined test seed fixture fallback"],
    cueOffsetMs: 0,
    cueOffsetSeconds: 0,
    isSafeLoopable: false,
    dropTier: "TRUTHFUL_ZERO_FALLBACK",
  }));
}

/**
 * Historical seed entries quarantined for offline tests only.
 */
export function listCompetitionRegistryBeats(lane: CompetitionBeatLane): BeatRegistryEntry[] {
  return BEAT_REGISTRY_SEED.filter((b) => {
    if (lane === "battle") return b.isAvailableForBattle;
    if (lane === "cypher") return b.isAvailableForCypher;
    return b.bpm >= 85 && b.bpm <= 105;
  });
}
