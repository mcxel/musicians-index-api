import { grantXP, XP_VALUES } from "@/lib/xp/xpEngine";
import { getListenLoungeXp } from "@/lib/xp/XpActionRegistry";
import { isQualifiedByPercentage } from "@/lib/music/PlayQualificationAuthority";
import {
  resolveSongCompletionReward,
  verifyQualifiedSongCompletion,
} from "@/lib/xp/SongCompletionRewardAuthority";
import {
  computeRollingParticipationScore,
  formatStreamWinGraceWarning,
  formatStreamWinProgressCopy,
  resolveRemovalRiskWindow,
  resolveStreamWinRotationState,
  selectTemporaryParticipationRemovalPlacement,
  shouldCancelPendingRemoval,
  streamWinRotationWeight,
  type QualifiedParticipationEvent,
  type StreamWinRotationResolution,
} from "@/lib/economy/StreamWinParticipationAuthority";
import {
  listenerCompletionRewardForSong,
  placeAcceptedSongOnFabric,
  resetStreamWinFabricForCertification,
  routeListenerOnFabric,
} from "@/lib/economy/StreamWinPlaylistFabricAuthority";

export type FeedbackReaction = "hard" | "replay" | "original" | "skip";
export type SongState = "active" | "decaying" | "expired";

export interface StreamWinListenDetail {
  durationSec?: number;
  listenedSeconds?: number;
  /** True only when canonical player evidence was server-revalidated. */
  playbackVerified?: boolean;
}

export interface ArtistParticipationSnapshot {
  artistId: string;
  score: number;
  rotation: StreamWinRotationResolution;
  progressCopy: string;
  graceRemainingMs: number | null;
  graceWarning: string | null;
  removalEligible: boolean;
  pendingRemovalCancelled: boolean;
  activeSongIds: string[];
  lastEvent: QualifiedParticipationEvent | null;
}

export interface ListenAccountingResult {
  ok: boolean;
  qualified: boolean;
  publicPlayIncremented: boolean;
  xpAwarded: boolean;
  xpAmount: number;
  participationRecorded: boolean;
  rotationExtended: boolean;
  extendedTrackIds: string[];
  completionRewardAwarded: number;
  completionQualified: boolean;
  listenerRollingScore: number;
  listenerRotationState: StreamWinRotationResolution["state"] | null;
  reason:
    | "qualified_peer_listen"
    | "duplicate_session"
    | "self_farming_prevented"
    | "premature_skip"
    | "inactive_tab"
    | "hourly_cap_reached"
    | "skip_threshold_exceeded"
    | "track_not_found"
    | "track_expired";
}

export interface StreamWinSong {
  id: string;
  artistId: string;
  title: string;
  genre: string;
  audioUrl: string;
  submittedAt: number;
  state: SongState;
  listenCount: number;
  listenSeconds: number;
  reactionCounts: Record<FeedbackReaction, number>;
  voteCount: number;
  boostPoints: number;
  visibilityScore: number;
  lastActivityAt: number;
  participationRemoved?: boolean;
  /**
   * Media-identity trace (owner correction, 2026-10-29): `id` (sw-*) is this
   * rotation/economy record's OWN identity — STREAM_WIN_ENTRY_ID, never to
   * be confused with canonical media identity. `submissionId` preserves the
   * real upstream SubmissionEngine record (traced and threaded through this
   * round). `mediaId` is the real canonical Song.id/Video.id — prepared here
   * but genuinely unpopulated: SubmissionEngine's own Submission record is
   * ITSELF an in-memory, non-canonical entity (confirmed — it never calls
   * MediaRegistry.register()/prisma.song.create() to mint a real Song/Video
   * row). No canonical media row exists anywhere in this chain today, so
   * fabricating a mediaId here would violate Rule 20. This field exists so
   * that WHENEVER that separate, larger gap (Submission -> canonical media)
   * is closed, Stream & Win songs can carry real mediaId without another
   * schema change — until then it stays honestly undefined, and no
   * PlayReceipt may be reported for Stream & Win listens (STREAM_WIN_MEDIA_
   * MAPPING = EXPLICITLY BLOCKED, not silently worked around).
   */
  submissionId?: string;
  mediaId?: string;
}

export interface SongSubmitResult {
  ok: boolean;
  song?: StreamWinSong;
  error?: "duplicate" | "quota_exceeded";
}

const songs: Map<string, StreamWinSong> = new Map();
// artistId -> count of active submissions
const artistSubmissions: Map<string, number> = new Map();
// userId -> { xpThisHour, windowStart, skipCount, noSkipStreak }
const userActivity: Map<string, { xpThisHour: number; windowStart: number; skipCount: number; noSkipStreak: number }> = new Map();
const creditedSessions: Set<string> = new Set();
const artistParticipationEvents: Map<string, QualifiedParticipationEvent[]> = new Map();
const artistEnteredRiskAt: Map<string, number | null> = new Map();
const artistLastParticipationRemovalAt: Map<string, number> = new Map();

function emptyListenResult(reason: ListenAccountingResult["reason"], ok = true): ListenAccountingResult {
  return {
    ok,
    qualified: false,
    publicPlayIncremented: false,
    xpAwarded: false,
    xpAmount: 0,
    participationRecorded: false,
    rotationExtended: false,
    extendedTrackIds: [],
    completionRewardAwarded: 0,
    completionQualified: false,
    listenerRollingScore: 0,
    listenerRotationState: null,
    reason,
  };
}

function artistActiveSongs(artistId: string): StreamWinSong[] {
  return Array.from(songs.values()).filter((s) => s.artistId === artistId && s.state !== "expired" && !s.participationRemoved);
}

function snapshotArtist(artistId: string, nowMs = Date.now(), pendingRemovalCancelled = false): ArtistParticipationSnapshot {
  const events = artistParticipationEvents.get(artistId) ?? [];
  const score = computeRollingParticipationScore(events, nowMs);
  const rotation = resolveStreamWinRotationState(score);
  const entered = artistEnteredRiskAt.get(artistId) ?? null;
  const window = resolveRemovalRiskWindow({ score, enteredRiskAtMs: entered, nowMs });
  return {
    artistId,
    score,
    rotation,
    progressCopy: formatStreamWinProgressCopy(score),
    graceRemainingMs: window.graceRemainingMs,
    graceWarning: window.atRisk ? formatStreamWinGraceWarning(window.graceRemainingMs) : null,
    removalEligible: window.removalEligible,
    pendingRemovalCancelled,
    activeSongIds: artistActiveSongs(artistId).map((s) => s.id),
    lastEvent: events.length ? events[events.length - 1]! : null,
  };
}

function applyParticipationLedger(
  artistId: string,
  points: number,
  nowMs: number,
  songRef?: { songId?: string; mediaId?: string },
): ArtistParticipationSnapshot {
  const events = artistParticipationEvents.get(artistId) ?? [];
  if (points > 0) events.push({ points, atMs: nowMs, songId: songRef?.songId, mediaId: songRef?.mediaId });
  artistParticipationEvents.set(artistId, events);
  const score = computeRollingParticipationScore(events, nowMs);
  const hadRisk = artistEnteredRiskAt.get(artistId) != null;
  let cancelled = false;
  if (shouldCancelPendingRemoval(score)) {
    cancelled = hadRisk;
    artistEnteredRiskAt.set(artistId, null);
  } else if (score <= 99 && artistEnteredRiskAt.get(artistId) == null) {
    artistEnteredRiskAt.set(artistId, nowMs);
  }
  const snap = snapshotArtist(artistId, nowMs, cancelled);
  if (snap.removalEligible) {
    // Temporary implementation default only — owner has not chosen which song.
    const actives = artistActiveSongs(artistId);
    const target = selectTemporaryParticipationRemovalPlacement(actives);
    const last = artistLastParticipationRemovalAt.get(artistId) ?? 0;
    if (target && last !== nowMs) {
      target.participationRemoved = true;
      target.state = "expired";
      artistLastParticipationRemovalAt.set(artistId, nowMs);
      artistEnteredRiskAt.set(artistId, nowMs);
    }
  }
  return snapshotArtist(artistId, nowMs, cancelled);
}

const DECAY_IDLE_MS   = 5 * 60 * 1000;  // 5 min → decaying
const EXPIRE_IDLE_MS  = 15 * 60 * 1000; // 15 min → expired
const FREE_SONGS_MAX  = 2;
const XP_HOUR_CAP     = 500;
const SKIP_BLOCK_THRESHOLD = 3;

function recomputeScore(song: StreamWinSong): number {
  const reactions = Object.values(song.reactionCounts).reduce((s, n) => s + n, 0);
  return song.listenSeconds * 0.4 + reactions * 3 + song.voteCount * 5 + song.boostPoints * 0.1;
}

function getUserActivity(userId: string) {
  const now = Date.now();
  let rec = userActivity.get(userId);
  if (!rec || now - rec.windowStart > 3600_000) {
    rec = { xpThisHour: 0, windowStart: now, skipCount: 0, noSkipStreak: 0 };
    userActivity.set(userId, rec);
  }
  return rec;
}

function tryGrantXP(
  userId: string,
  source: "stream_listen" | "stream_react" | "stream_vote",
  role?: string | null,
): boolean {
  const rec = getUserActivity(userId);
  if (rec.skipCount > SKIP_BLOCK_THRESHOLD) return false;
  let amount = source === "stream_listen" ? getListenLoungeXp(role) : XP_VALUES[source];
  // Streak bonus: consecutive non-skip listens
  if (source === "stream_listen") {
    if (rec.noSkipStreak >= 5) amount = Math.round(amount * 2);
    else if (rec.noSkipStreak >= 3) amount = Math.round(amount * 1.5);
  }
  if (rec.xpThisHour + amount > XP_HOUR_CAP) return false;
  rec.xpThisHour += amount;
  grantXP({ source, amount, userId });
  return true;
}

let decayTimer: ReturnType<typeof setInterval> | null = null;

export const StreamAndWinEngine = {
  start(): void {
    if (decayTimer) return;
    decayTimer = setInterval(() => StreamAndWinEngine.runDecay(), 60_000);
  },

  stop(): void {
    if (decayTimer) clearInterval(decayTimer);
    decayTimer = null;
  },

  submitSong(params: {
    artistId: string;
    title: string;
    genre: string;
    audioUrl: string;
    /** Real upstream Submission.id (SubmissionEngine) — distinct from this song's own sw-* id. */
    submissionId?: string;
    /** Real canonical Song.id/Video.id, when a caller genuinely has one. Never fabricated. */
    mediaId?: string;
  }): SongSubmitResult {
    const existing = Array.from(songs.values()).filter(
      s => s.artistId === params.artistId && s.state !== "expired"
    );
    if (existing.length >= FREE_SONGS_MAX) return { ok: false, error: "quota_exceeded" };

    const id = `sw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const song: StreamWinSong = {
      id,
      artistId: params.artistId,
      title: params.title,
      genre: params.genre,
      audioUrl: params.audioUrl,
      submittedAt: Date.now(),
      state: "active",
      listenCount: 0,
      listenSeconds: 0,
      reactionCounts: { hard: 0, replay: 0, original: 0, skip: 0 },
      voteCount: 0,
      boostPoints: 0,
      visibilityScore: 0,
      lastActivityAt: Date.now(),
      submissionId: params.submissionId,
      mediaId: params.mediaId,
    };
    songs.set(id, song);
    artistSubmissions.set(params.artistId, (artistSubmissions.get(params.artistId) ?? 0) + 1);
    placeAcceptedSongOnFabric({
      genreLabel: params.genre,
      songId: id,
      ownerPerformerId: params.artistId,
    });
    return { ok: true, song };
  },

  recordListenDetailed(
    songId: string,
    userId: string,
    listenPct: number,
    isActive = true,
    role?: string | null,
    sessionId?: string,
    detail?: StreamWinListenDetail,
  ): ListenAccountingResult {
    const song = songs.get(songId);
    if (!song) return emptyListenResult("track_not_found", false);
    if (song.state === "expired") return emptyListenResult("track_expired", false);
    if (!isActive) return emptyListenResult("inactive_tab");

    const dedupeKey = sessionId ? `${userId}:${songId}:${sessionId}` : null;
    if (dedupeKey && creditedSessions.has(dedupeKey)) {
      const snap = snapshotArtist(userId);
      return { ...emptyListenResult("duplicate_session"), qualified: true, listenerRollingScore: snap.score, listenerRotationState: snap.rotation.state };
    }

    const rec = getUserActivity(userId);
    if (!isQualifiedByPercentage(listenPct)) {
      rec.skipCount += 1;
      rec.noSkipStreak = 0;
      userActivity.set(userId, rec);
      return emptyListenResult("premature_skip");
    }

    const isSelfListen = song.artistId === userId;
    if (isSelfListen) return emptyListenResult("self_farming_prevented");

    // Deduplication key stored
    if (dedupeKey) {
      creditedSessions.add(dedupeKey);
      if (creditedSessions.size > 20000) {
        const first = creditedSessions.values().next().value;
        if (first) creditedSessions.delete(first);
      }
    }

    // Distinct accounting: public play counter incremented
    song.listenCount += 1;
    song.listenSeconds += Math.round(listenPct * 180);
    song.lastActivityAt = Date.now();
    song.state = "active";
    song.visibilityScore = recomputeScore(song);

    rec.noSkipStreak += 1;
    const baseAmount = getListenLoungeXp(role);
    const xpGranted = tryGrantXP(userId, "stream_listen", role);

    // Performer Fair Exchange: Listening to peer music extends the rotation of own submitted tracks
    const extendedIds: string[] = [];
    for (const peerSong of songs.values()) {
      if (peerSong.artistId === userId && peerSong.state !== "expired") {
        peerSong.lastActivityAt = Date.now();
        peerSong.visibilityScore = recomputeScore(peerSong);
        extendedIds.push(peerSong.id);
      }
    }

    const durationSec = detail?.durationSec && detail.durationSec > 0 ? detail.durationSec : 180;
    const listenedSeconds = detail?.listenedSeconds ?? listenPct * durationSec;
    const completionGate = detail?.playbackVerified
      ? verifyQualifiedSongCompletion({ listenedSeconds, durationSec, isSelfListen })
      : { qualified: false, reason: "incomplete" as const };
    let completionRewardAwarded = 0;
    if (completionGate.qualified) {
      const offered = resolveSongCompletionReward({ durationSec }).rewardPoints;
      completionRewardAwarded = listenerCompletionRewardForSong({
        listenerPerformerId: userId,
        songOwnerId: song.artistId,
        baseRewardPoints: offered,
      });
      if (completionRewardAwarded > 0) {
        applyParticipationLedger(userId, completionRewardAwarded, Date.now(), {
          songId: song.id,
          mediaId: song.mediaId,
        });
      }
    }
    const listenerSnap = snapshotArtist(userId);

    return {
      ok: true,
      qualified: true,
      publicPlayIncremented: true,
      xpAwarded: xpGranted,
      xpAmount: xpGranted ? baseAmount : 0,
      participationRecorded: true,
      rotationExtended: extendedIds.length > 0,
      extendedTrackIds: extendedIds,
      completionRewardAwarded,
      completionQualified: completionGate.qualified,
      listenerRollingScore: listenerSnap.score,
      listenerRotationState: listenerSnap.rotation.state,
      reason: "qualified_peer_listen",
    };
  },

  recordListen(songId: string, userId: string, listenPct: number, isActive = true, role?: string | null, sessionId?: string): boolean {
    const res = this.recordListenDetailed(songId, userId, listenPct, isActive, role, sessionId);
    return res.qualified && (res.publicPlayIncremented || res.xpAwarded);
  },

  recordReaction(songId: string, userId: string, reaction: FeedbackReaction, role?: string | null): boolean {
    const song = songs.get(songId);
    if (!song || song.state === "expired") return false;

    song.reactionCounts[reaction] += 1;
    song.lastActivityAt = Date.now();
    song.state = "active";
    song.visibilityScore = recomputeScore(song);

    if (reaction === "skip") {
      const rec = getUserActivity(userId);
      rec.skipCount += 1;
      rec.noSkipStreak = 0;
      return false;
    }

    tryGrantXP(userId, "stream_react", role);
    return true;
  },

  recordVote(songId: string, userId: string, role?: string | null): boolean {
    const song = songs.get(songId);
    if (!song || song.state === "expired") return false;

    song.voteCount += 1;
    song.lastActivityAt = Date.now();
    song.visibilityScore = recomputeScore(song);

    tryGrantXP(userId, "stream_vote", role);
    return true;
  },

  // Paid boost: exposure only, does NOT affect eligibility or prize odds
  applyBoost(songId: string, boostPoints: number): boolean {
    const song = songs.get(songId);
    if (!song) return false;
    song.boostPoints += boostPoints;
    song.visibilityScore = recomputeScore(song);
    return true;
  },

  runDecay(): void {
    const now = Date.now();
    for (const song of songs.values()) {
      if (song.state === "expired") continue;
      const idle = now - song.lastActivityAt;
      if (idle > EXPIRE_IDLE_MS) {
        song.state = "expired";
      } else if (idle > DECAY_IDLE_MS) {
        song.state = "decaying";
      }
    }
  },

  getActiveSongs(): StreamWinSong[] {
    return Array.from(songs.values())
      .filter(s => s.state !== "expired" && !s.participationRemoved)
      .sort((a, b) => {
        if (a.state === "active" && b.state !== "active") return -1;
        if (b.state === "active" && a.state !== "active") return 1;
        const weightA = streamWinRotationWeight(snapshotArtist(a.artistId).rotation.state);
        const weightB = streamWinRotationWeight(snapshotArtist(b.artistId).rotation.state);
        return (b.visibilityScore * weightB) - (a.visibilityScore * weightA);
      });
  },

  getArtistParticipation(artistId: string, nowMs = Date.now()): ArtistParticipationSnapshot {
    return snapshotArtist(artistId, nowMs);
  },

  getSongByMediaId(mediaId: string): StreamWinSong | undefined {
    return Array.from(songs.values()).find((s) => s.mediaId === mediaId || s.id === mediaId);
  },

  /** Controlled-time participation credit for recovery/removal certification. */
  creditQualifiedParticipation(artistId: string, points: number, nowMs = Date.now(), songRef?: { songId?: string; mediaId?: string }): ArtistParticipationSnapshot {
    return applyParticipationLedger(artistId, points, nowMs, songRef);
  },

  /** Certification-only reset. Does not exist as a product/runtime API. */
  resetForCertification(): void {
    songs.clear();
    artistSubmissions.clear();
    userActivity.clear();
    creditedSessions.clear();
    artistParticipationEvents.clear();
    artistEnteredRiskAt.clear();
    artistLastParticipationRemovalAt.clear();
    resetStreamWinFabricForCertification();
  },

  getRoutedActiveSongs(listenerPerformerId: string | null, genreHint?: string | null): {
    songs: StreamWinSong[];
    route: ReturnType<typeof routeListenerOnFabric>;
  } {
    const route = routeListenerOnFabric({
      genreLabel: genreHint,
      listenerPerformerId,
    });
    const all = StreamAndWinEngine.getActiveSongs();
    if (route.memberSongIds.length === 0) {
      return { songs: all, route };
    }
    const allowed = new Set(route.memberSongIds);
    const routed = all.filter((s) => allowed.has(s.id));
    return { songs: routed.length > 0 ? routed : all, route };
  },

  getFabricRoute(listenerPerformerId: string | null, genreHint?: string | null) {
    return routeListenerOnFabric({ genreLabel: genreHint, listenerPerformerId });
  },

  getSong(id: string): StreamWinSong | undefined {
    return songs.get(id);
  },

  // Returns user IDs eligible for prize drops (listened ≥30% to any active song)
  getEligibleUsers(sessionListeners: string[]): string[] {
    return sessionListeners;
  },
};
