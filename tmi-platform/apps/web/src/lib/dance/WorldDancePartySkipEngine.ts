/**
 * WorldDancePartySkipEngine — auto-skip on poor in-room reception (Rule 20).
 * Uses real signals only: vote-down, negative/positive reactions, dance engagement,
 * human occupancy from audienceRuntimeEngine. No fabricated ratings.
 */

import { getVenueOccupancy } from "@/lib/live/audienceRuntimeEngine";

/** Minimum play time before skip evaluation (honest sample window). */
export const WDP_SKIP_MIN_ELAPSED_MS = 45_000;

/** Crossfade duration when skipping to next track (2–4s DJ-style). */
export const WDP_SKIP_FADE_MS = 3_000;

/** Absolute vote-down count on the playing track triggers skip. */
export const WDP_SKIP_VOTE_DOWN_ABSOLUTE = 5;

/** Vote-down ratio vs humans in room (requires minimum humans). */
export const WDP_SKIP_VOTE_DOWN_RATIO = 0.4;
export const WDP_SKIP_MIN_HUMANS_FOR_RATIO = 3;

/** Negative reaction emotes / thumbs-down in room. */
export const WDP_SKIP_NEGATIVE_REACTIONS = 8;

/** Low engagement: enough humans but almost no positive signal. */
export const WDP_SKIP_MIN_HUMANS_FOR_ENGAGEMENT = 4;
export const WDP_SKIP_MAX_POSITIVE_SIGNALS = 1;

export const WDP_OFFICIAL_ROOM_IDS = [
  "world-dance-party",
  "anchor-world-dance-room",
  "live/rooms/world-dance-party",
] as const;

export type WdpReceptionSignal =
  | "vote_down"
  | "negative_reaction"
  | "positive_reaction"
  | "dance_engagement";

export interface WdpTrackReceptionSnapshot {
  roomId: string;
  trackId: string;
  startedAtMs: number;
  voteDown: number;
  negativeReactions: number;
  positiveReactions: number;
  danceEngagements: number;
  humansInRoom: number;
  elapsedMs: number;
}

export interface WdpReceptionVerdict {
  shouldSkip: boolean;
  insufficientData: boolean;
  reason: string | null;
  /** Higher = worse reception (internal only — never shown as fake metric). */
  poorScore: number;
  snapshot: WdpTrackReceptionSnapshot;
}

interface TrackReceptionSession {
  roomId: string;
  trackId: string;
  startedAtMs: number;
  voteDown: number;
  negativeReactions: number;
  positiveReactions: number;
  danceEngagements: number;
}

const sessions = new Map<string, TrackReceptionSession>();

function sessionKey(roomId: string, trackId: string): string {
  return `${roomId}:${trackId}`;
}

function resolveRoomIds(roomId: string): string[] {
  const ids = new Set<string>([roomId, ...WDP_OFFICIAL_ROOM_IDS]);
  return [...ids];
}

/** Real humans in room — bots excluded (Rule 20). */
export function countHumansInWdpRoom(roomId: string): number {
  let max = 0;
  for (const id of resolveRoomIds(roomId)) {
    const occ = getVenueOccupancy(id);
    const humans = occ.members.filter((m) => m.active && m.role !== "bot").length;
    if (humans > max) max = humans;
  }
  return max;
}

export function beginTrackReception(
  roomId: string,
  trackId: string,
  startedAtMs: number = Date.now(),
): void {
  sessions.set(sessionKey(roomId, trackId), {
    roomId,
    trackId,
    startedAtMs,
    voteDown: 0,
    negativeReactions: 0,
    positiveReactions: 0,
    danceEngagements: 0,
  });
}

export function clearTrackReception(roomId: string, trackId: string): void {
  sessions.delete(sessionKey(roomId, trackId));
}

export function recordWdpReceptionSignal(
  roomId: string,
  trackId: string,
  signal: WdpReceptionSignal,
): WdpTrackReceptionSnapshot | null {
  const key = sessionKey(roomId, trackId);
  let session = sessions.get(key);
  if (!session) {
    session = {
      roomId,
      trackId,
      startedAtMs: Date.now(),
      voteDown: 0,
      negativeReactions: 0,
      positiveReactions: 0,
      danceEngagements: 0,
    };
    sessions.set(key, session);
  }

  switch (signal) {
    case "vote_down":
      session.voteDown += 1;
      break;
    case "negative_reaction":
      session.negativeReactions += 1;
      break;
    case "positive_reaction":
      session.positiveReactions += 1;
      break;
    case "dance_engagement":
      session.danceEngagements += 1;
      break;
  }

  return buildSnapshot(session, Date.now());
}

function buildSnapshot(session: TrackReceptionSession, nowMs: number): WdpTrackReceptionSnapshot {
  return {
    roomId: session.roomId,
    trackId: session.trackId,
    startedAtMs: session.startedAtMs,
    voteDown: session.voteDown,
    negativeReactions: session.negativeReactions,
    positiveReactions: session.positiveReactions,
    danceEngagements: session.danceEngagements,
    humansInRoom: countHumansInWdpRoom(session.roomId),
    elapsedMs: Math.max(0, nowMs - session.startedAtMs),
  };
}

/**
 * Evaluate whether DJ Record Ralph should crossfade to the next track.
 * Returns insufficientData=true when sample size is too small — caller must NOT skip.
 */
export function evaluateTrackReception(
  roomId: string,
  trackId: string,
  nowMs: number = Date.now(),
): WdpReceptionVerdict {
  const session = sessions.get(sessionKey(roomId, trackId));
  const snapshot: WdpTrackReceptionSnapshot = session
    ? buildSnapshot(session, nowMs)
    : {
        roomId,
        trackId,
        startedAtMs: nowMs,
        voteDown: 0,
        negativeReactions: 0,
        positiveReactions: 0,
        danceEngagements: 0,
        humansInRoom: countHumansInWdpRoom(roomId),
        elapsedMs: 0,
      };

  if (snapshot.elapsedMs < WDP_SKIP_MIN_ELAPSED_MS) {
    return {
      shouldSkip: false,
      insufficientData: true,
      reason: null,
      poorScore: 0,
      snapshot,
    };
  }

  const hasVoteSignal = snapshot.voteDown >= 3;
  const hasReactionSignal = snapshot.negativeReactions >= 2;
  const hasRoomSample = snapshot.humansInRoom >= WDP_SKIP_MIN_HUMANS_FOR_RATIO;

  if (!hasVoteSignal && !hasReactionSignal && !hasRoomSample) {
    return {
      shouldSkip: false,
      insufficientData: true,
      reason: null,
      poorScore: 0,
      snapshot,
    };
  }

  const poorScore =
    snapshot.voteDown * 18 +
    snapshot.negativeReactions * 10 -
    snapshot.positiveReactions * 8 -
    snapshot.danceEngagements * 6;

  let shouldSkip = false;
  let reason: string | null = null;

  if (snapshot.voteDown >= WDP_SKIP_VOTE_DOWN_ABSOLUTE) {
    shouldSkip = true;
    reason = "vote_down_threshold";
  } else if (
    snapshot.humansInRoom >= WDP_SKIP_MIN_HUMANS_FOR_RATIO &&
    snapshot.voteDown / snapshot.humansInRoom >= WDP_SKIP_VOTE_DOWN_RATIO
  ) {
    shouldSkip = true;
    reason = "vote_down_ratio";
  } else if (snapshot.negativeReactions >= WDP_SKIP_NEGATIVE_REACTIONS) {
    shouldSkip = true;
    reason = "negative_reactions";
  } else if (
    snapshot.humansInRoom >= WDP_SKIP_MIN_HUMANS_FOR_ENGAGEMENT &&
    snapshot.positiveReactions <= WDP_SKIP_MAX_POSITIVE_SIGNALS &&
    snapshot.danceEngagements <= WDP_SKIP_MAX_POSITIVE_SIGNALS &&
    snapshot.voteDown >= 2
  ) {
    shouldSkip = true;
    reason = "low_engagement";
  }

  return {
    shouldSkip,
    insufficientData: false,
    reason,
    poorScore,
    snapshot,
  };
}

export interface WdpFadeState {
  entryId: string;
  roomId: string;
  startedAtMs: number;
  durationMs: number;
  reason: string;
}

let activeFade: WdpFadeState | null = null;

export function startFadeToNextTrack(
  entryId: string,
  roomId: string,
  reason: string,
  nowMs: number = Date.now(),
  durationMs: number = WDP_SKIP_FADE_MS,
): WdpFadeState {
  activeFade = {
    entryId,
    roomId,
    startedAtMs: nowMs,
    durationMs,
    reason,
  };
  return activeFade;
}

export function getActiveFade(nowMs: number = Date.now()): (WdpFadeState & { progress: number; complete: boolean }) | null {
  if (!activeFade) return null;
  const elapsed = nowMs - activeFade.startedAtMs;
  const progress = Math.min(1, elapsed / activeFade.durationMs);
  return {
    ...activeFade,
    progress,
    complete: progress >= 1,
  };
}

export function clearActiveFade(): void {
  activeFade = null;
}
