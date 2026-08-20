/**
 * WorldDancePartyRotationPool — weekly submit → Friday play → clear (Rule 20/21).
 * One canonical store; cleared after each Friday ends. No indefinite holds.
 */

import { participationEconomyEngine } from "@/lib/economy/ParticipationEconomyEngine";
import {
  getWorldDanceFridayWeekKey,
  getWorldDancePartyWindow,
  getSubmitWindowForWeekKey,
  isWorldDancePartyLive,
} from "@/lib/dance/WorldDancePartyShowtime";
import { pickBeat, type DJAction } from "@/engines/performance/BotDJEngine";
import type { BeatEntry } from "@/engines/performance/BeatQueueEngine";
import {
  beginTrackReception,
  clearActiveFade,
  clearTrackReception,
  evaluateTrackReception,
  getActiveFade,
  recordWdpReceptionSignal,
  startFadeToNextTrack,
  WDP_OFFICIAL_ROOM_IDS,
  WDP_SKIP_FADE_MS,
} from "@/lib/dance/WorldDancePartySkipEngine";

export const WDP_SUBMIT_COIN_RESERVE = 50;
export const WDP_VOTE_DOWN_COINS = 5;
export const WDP_DEFAULT_TRACK_MS = 4 * 60 * 1000;
export const WDP_FRIDAY_SLOT_MS = 24 * 60 * 60 * 1000;
export const RECORD_RALPH_BOT_ID = "record-ralph";
export const WDP_OFFICIAL_ROOM_ID = WDP_OFFICIAL_ROOM_IDS[0];

export type WdpTrackStatus =
  | "pending_review"
  | "queued"
  | "scheduled"
  | "overflow"
  | "playing"
  | "played"
  | "rejected"
  | "refunded";

export interface WdpRotationEntry {
  id: string;
  weekKey: string;
  submitterId: string;
  artistName: string;
  title: string;
  audioUrl: string;
  genre: string;
  bpm: number | null;
  durationMs: number;
  creditLine: string;
  status: WdpTrackStatus;
  reservedCoins: number;
  coinsCharged: boolean;
  queuePosition: number | null;
  scheduledEstimate: string | null;
  voteDownCount: number;
  submittedAtMs: number;
  playedAtMs: number | null;
  /** Set when cut early due to poor reception — charge still applies. */
  skipReason: string | null;
  endedEarlyMs: number | null;
  tags: string[];
}

export interface WdpPoolCapacityReport {
  weekKey: string;
  totalSubmitted: number;
  scheduledCount: number;
  overflowCount: number;
  estimatedSlots: number;
  avgSlotMs: number;
  submitWindowOpen: boolean;
  phase: string;
}

export interface WdpNowPlaying {
  active: boolean;
  entry: WdpRotationEntry | null;
  overlayArtist: string;
  overlayTitle: string;
  djLine: string | null;
  phase: string;
  weekKey: string;
  /** Crossfade in progress (poor reception skip). */
  fadeActive: boolean;
  fadeProgress: number;
  skipReason: string | null;
  transitioningOverlay: string | null;
}

const pools = new Map<string, WdpRotationEntry[]>();
const pendingCoinReserve = new Map<string, number>();
let playCursor = 0;
let currentPlayingId: string | null = null;
let currentPlayingStartedMs = 0;
let shuffleOrder: string[] = [];

function idleNowPlaying(
  partial: Pick<WdpNowPlaying, "active" | "phase" | "weekKey"> &
    Partial<Omit<WdpNowPlaying, "active" | "phase" | "weekKey">>,
): WdpNowPlaying {
  return {
    entry: null,
    overlayArtist: "",
    overlayTitle: "",
    djLine: null,
    fadeActive: false,
    fadeProgress: 0,
    skipReason: null,
    transitioningOverlay: null,
    ...partial,
  };
}

function skipTrackEarly(entry: WdpRotationEntry, reason: string, nowMs: number): void {
  entry.status = "played";
  entry.playedAtMs = nowMs;
  entry.skipReason = reason;
  entry.endedEarlyMs = Math.max(0, nowMs - currentPlayingStartedMs);
  clearTrackReception(WDP_OFFICIAL_ROOM_ID, entry.id);
  clearActiveFade();
  currentPlayingId = null;
  shuffleOrder = shuffleOrder.filter((id) => id !== entry.id);
}

function genId(): string {
  return `wdp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getPool(weekKey: string): WdpRotationEntry[] {
  if (!pools.has(weekKey)) pools.set(weekKey, []);
  return pools.get(weekKey)!;
}

function reserveCoins(userId: string, amount: number): { ok: boolean; reason?: string } {
  const wallet = participationEconomyEngine.getWallet(userId);
  const pending = pendingCoinReserve.get(userId) ?? 0;
  if (wallet.coins < pending + amount) {
    return { ok: false, reason: "insufficient_coins" };
  }
  pendingCoinReserve.set(userId, pending + amount);
  return { ok: true };
}

function releaseReserve(userId: string, amount: number): void {
  const pending = pendingCoinReserve.get(userId) ?? 0;
  pendingCoinReserve.set(userId, Math.max(0, pending - amount));
}

function finalizePlayCharge(entry: WdpRotationEntry): void {
  if (entry.coinsCharged || entry.reservedCoins <= 0) return;
  const spend = participationEconomyEngine.spend(entry.submitterId, "wdp_track_play", {
    entryId: entry.id,
    weekKey: entry.weekKey,
  });
  releaseReserve(entry.submitterId, entry.reservedCoins);
  if (spend.ok) {
    entry.coinsCharged = true;
  } else {
    entry.status = "overflow";
    entry.scheduledEstimate = "Could not finalize points — track skipped";
  }
}

function refundEntry(entry: WdpRotationEntry, reason: string): void {
  if (entry.coinsCharged) return;
  releaseReserve(entry.submitterId, entry.reservedCoins);
  entry.reservedCoins = 0;
  entry.status = "refunded";
  entry.scheduledEstimate = reason;
}

function computeCapacity(entries: WdpRotationEntry[]): WdpPoolCapacityReport {
  const weekKey = entries[0]?.weekKey ?? getWorldDanceFridayWeekKey();
  const window = getWorldDancePartyWindow();
  const playable = entries.filter(
    (e) => e.status !== "rejected" && e.status !== "refunded" && e.status !== "pending_review",
  );
  const durations = playable.map((e) => e.durationMs);
  const avgSlotMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : WDP_DEFAULT_TRACK_MS;
  const estimatedSlots = Math.max(1, Math.floor(WDP_FRIDAY_SLOT_MS / avgSlotMs));
  const { opensAt, closesAt } = getSubmitWindowForWeekKey(weekKey);
  const now = Date.now();
  return {
    weekKey,
    totalSubmitted: playable.length,
    scheduledCount: playable.filter((e) => e.status === "scheduled" || e.status === "queued").length,
    overflowCount: playable.filter((e) => e.status === "overflow").length,
    estimatedSlots,
    avgSlotMs,
    submitWindowOpen: now >= opensAt.getTime() && now <= closesAt.getTime(),
    phase: window.phase,
  };
}

function reshuffleWeek(weekKey: string): void {
  const pool = getPool(weekKey).filter(
    (e) => e.status === "queued" || e.status === "scheduled" || e.status === "overflow",
  );
  shuffleOrder = pool.map((e) => e.id);
  for (let i = shuffleOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffleOrder[i], shuffleOrder[j]] = [shuffleOrder[j]!, shuffleOrder[i]!];
  }
  playCursor = 0;
}

function assignQueuePositions(weekKey: string): void {
  const cap = computeCapacity(getPool(weekKey));
  const candidates = getPool(weekKey)
    .filter((e) => e.status === "pending_review" || e.status === "queued")
    .sort((a, b) => {
      const aBoost = a.tags.includes("wdp-boost-active") ? 0 : 1;
      const bBoost = b.tags.includes("wdp-boost-active") ? 0 : 1;
      if (aBoost !== bBoost) return aBoost - bBoost;
      return a.submittedAtMs - b.submittedAtMs;
    });

  let scheduled = 0;
  for (const entry of candidates) {
    if (entry.status === "pending_review") continue;
    scheduled += 1;
    if (scheduled <= cap.estimatedSlots) {
      entry.status = "scheduled";
      entry.queuePosition = scheduled;
      entry.scheduledEstimate = `Scheduled for Friday rotation · slot ~${scheduled} of ${cap.estimatedSlots}`;
    } else {
      entry.status = "overflow";
      entry.queuePosition = scheduled;
      entry.scheduledEstimate = `Overflow — may not play; points refunded if not aired`;
    }
  }
}

export function submitToWorldDancePool(input: {
  submitterId: string;
  artistName: string;
  title: string;
  audioUrl: string;
  genre?: string;
  bpm?: number | null;
  durationMs?: number;
  creditLine?: string;
  tags?: string[];
}): { ok: boolean; entry?: WdpRotationEntry; error?: string; capacity?: WdpPoolCapacityReport } {
  const window = getWorldDancePartyWindow();
  const weekKey = window.weekKey;
  const { opensAt, closesAt } = getSubmitWindowForWeekKey(weekKey);
  const now = Date.now();
  if (now < opensAt.getTime() || now > closesAt.getTime()) {
    return { ok: false, error: "submit_window_closed" };
  }

  const reserve = reserveCoins(input.submitterId, WDP_SUBMIT_COIN_RESERVE);
  if (!reserve.ok) {
    return { ok: false, error: reserve.reason ?? "insufficient_coins" };
  }

  const entry: WdpRotationEntry = {
    id: genId(),
    weekKey,
    submitterId: input.submitterId,
    artistName: input.artistName.trim(),
    title: input.title.trim(),
    audioUrl: input.audioUrl.trim(),
    genre: (input.genre ?? "Dance").trim(),
    bpm: input.bpm ?? null,
    durationMs: input.durationMs && input.durationMs > 0 ? input.durationMs : WDP_DEFAULT_TRACK_MS,
    creditLine: (input.creditLine ?? `${input.artistName} · ${input.title}`).trim(),
    status: "queued",
    reservedCoins: WDP_SUBMIT_COIN_RESERVE,
    coinsCharged: false,
    queuePosition: null,
    scheduledEstimate: null,
    voteDownCount: 0,
    submittedAtMs: now,
    playedAtMs: null,
    skipReason: null,
    endedEarlyMs: null,
    tags: [...(input.tags ?? []), "world-dance-party"],
  };

  getPool(weekKey).push(entry);
  assignQueuePositions(weekKey);
  return { ok: true, entry, capacity: computeCapacity(getPool(weekKey)) };
}

export function approveWdpEntry(entryId: string): WdpRotationEntry | null {
  for (const [, pool] of pools) {
    const entry = pool.find((e) => e.id === entryId);
    if (entry && entry.status === "pending_review") {
      entry.status = "queued";
      assignQueuePositions(entry.weekKey);
      return entry;
    }
  }
  return null;
}

export function rejectWdpEntry(entryId: string): WdpRotationEntry | null {
  for (const [, pool] of pools) {
    const entry = pool.find((e) => e.id === entryId);
    if (entry) {
      entry.status = "rejected";
      refundEntry(entry, "Rejected by moderation — no charge");
      return entry;
    }
  }
  return null;
}

export function voteDownWdpTrack(
  entryId: string,
  voterId: string,
  roomId: string = WDP_OFFICIAL_ROOM_ID,
): { ok: boolean; error?: string; voteDownCount?: number; skipTriggered?: boolean } {
  for (const [, pool] of pools) {
    const entry = pool.find((e) => e.id === entryId);
    if (!entry) continue;
    if (entry.status === "played" || entry.status === "rejected") {
      return { ok: false, error: "voting_closed" };
    }
    const spend = participationEconomyEngine.spend(voterId, "wdp_vote_down", {
      entryId,
      weekKey: entry.weekKey,
    });
    if (!spend.ok) {
      return { ok: false, error: spend.error ?? "insufficient_coins" };
    }
    entry.voteDownCount += 1;
    if (entry.status === "playing") {
      recordWdpReceptionSignal(roomId, entryId, "vote_down");
      const verdict = evaluateTrackReception(roomId, entryId);
      if (verdict.shouldSkip && !getActiveFade()) {
        startFadeToNextTrack(entryId, roomId, verdict.reason ?? "vote_down_threshold");
      }
    }
    return { ok: true, voteDownCount: entry.voteDownCount, skipTriggered: Boolean(getActiveFade()) };
  }
  return { ok: false, error: "not_found" };
}

function entryToBeat(entry: WdpRotationEntry): BeatEntry {
  return {
    id: entry.id,
    title: entry.title,
    genre: entry.genre,
    energy: (entry.bpm ?? 120) >= 120 ? "high" : "mid",
    bpm: entry.bpm ?? 120,
    producerId: entry.submitterId,
    producerName: entry.artistName,
    license: "producer-submitted",
    royaltyBps: 500,
    isActive: true,
    compatibleModes: ["beat-backed"],
    compatibleGenres: [entry.genre],
    votes: 0,
    skipCount: entry.voteDownCount,
    usageCount: 0,
  };
}

/** Advance DJ Record Ralph rotation — Fridays only; honest idle when pool empty. */
export function tickWorldDanceDJ(nowMs: number = Date.now()): WdpNowPlaying {
  purgeExpiredWeeks(nowMs);
  const window = getWorldDancePartyWindow(new Date(nowMs));

  if (window.phase !== "LIVE") {
    currentPlayingId = null;
    clearActiveFade();
    return idleNowPlaying({ active: false, phase: window.phase, weekKey: window.weekKey });
  }

  const weekKey = window.weekKey;
  const fade = getActiveFade(nowMs);
  if (fade?.complete && fade.entryId) {
    const fading = getPool(weekKey).find((e) => e.id === fade.entryId);
    if (fading && fading.status === "playing") {
      skipTrackEarly(fading, fade.reason, nowMs);
    } else {
      clearActiveFade();
    }
  }

  if (shuffleOrder.length === 0) {
    reshuffleWeek(weekKey);
  }

  const current = currentPlayingId
    ? getPool(weekKey).find((e) => e.id === currentPlayingId)
    : null;

  const activeFade = getActiveFade(nowMs);
  if (activeFade && !activeFade.complete && current) {
    const dj = pickBeat(RECORD_RALPH_BOT_ID, entryToBeat(current), playCursor);
    return buildNowPlaying(current, dj, window.phase, weekKey, {
      fadeActive: true,
      fadeProgress: activeFade.progress,
      skipReason: activeFade.reason,
      transitioningOverlay: "Crossfade · next track",
    });
  }

  if (
    current &&
    current.status === "playing" &&
    nowMs - currentPlayingStartedMs < current.durationMs
  ) {
    if (!getActiveFade(nowMs)) {
      const verdict = evaluateTrackReception(WDP_OFFICIAL_ROOM_ID, current.id, nowMs);
      if (verdict.shouldSkip) {
        startFadeToNextTrack(current.id, WDP_OFFICIAL_ROOM_ID, verdict.reason ?? "poor_reception", nowMs);
        const dj = pickBeat(RECORD_RALPH_BOT_ID, entryToBeat(current), playCursor);
        return buildNowPlaying(current, dj, window.phase, weekKey, {
          fadeActive: true,
          fadeProgress: 0,
          skipReason: verdict.reason,
          transitioningOverlay: "Crossfade · next track",
        });
      }
    }
    const dj = pickBeat(RECORD_RALPH_BOT_ID, entryToBeat(current), playCursor);
    return buildNowPlaying(current, dj, window.phase, weekKey);
  }

  if (current && current.status === "playing") {
    current.status = "played";
    current.playedAtMs = nowMs;
    clearTrackReception(WDP_OFFICIAL_ROOM_ID, current.id);
  }

  while (playCursor < shuffleOrder.length) {
    const id = shuffleOrder[playCursor]!;
    playCursor += 1;
    const next = getPool(weekKey).find((e) => e.id === id);
    if (!next || next.status === "played" || next.status === "refunded" || next.status === "rejected") {
      continue;
    }
    if (next.status === "overflow") {
      refundEntry(next, "Overflow — not aired this Friday");
      continue;
    }
    next.status = "playing";
    currentPlayingId = next.id;
    currentPlayingStartedMs = nowMs;
    beginTrackReception(WDP_OFFICIAL_ROOM_ID, next.id, nowMs);
    finalizePlayCharge(next);
    const dj = pickBeat(RECORD_RALPH_BOT_ID, entryToBeat(next), playCursor);
    return buildNowPlaying(next, dj, window.phase, weekKey);
  }

  reshuffleWeek(weekKey);
  return idleNowPlaying({
    active: true,
    phase: window.phase,
    weekKey,
    overlayTitle: "Waiting for approved submissions",
    djLine: "DJ Record Ralph · pool recruiting for next spin",
  });
}

function buildNowPlaying(
  entry: WdpRotationEntry,
  dj: DJAction,
  phase: string,
  weekKey: string,
  fade?: Partial<Pick<WdpNowPlaying, "fadeActive" | "fadeProgress" | "skipReason" | "transitioningOverlay">>,
): WdpNowPlaying {
  return {
    active: true,
    entry,
    overlayArtist: entry.artistName,
    overlayTitle: entry.title,
    djLine: dj.text,
    phase,
    weekKey,
    fadeActive: fade?.fadeActive ?? false,
    fadeProgress: fade?.fadeProgress ?? 0,
    skipReason: fade?.skipReason ?? null,
    transitioningOverlay: fade?.transitioningOverlay ?? null,
  };
}

/** After Friday ends — refund overflow + clear pool (weekly law). */
export function purgeExpiredWeeks(nowMs: number = Date.now()): string[] {
  const cleared: string[] = [];
  for (const [weekKey, pool] of [...pools.entries()]) {
    const { closesAt } = getSubmitWindowForWeekKey(weekKey);
    if (nowMs <= closesAt.getTime() + 60_000) continue;
    for (const entry of pool) {
      if (entry.status !== "played" && entry.status !== "rejected") {
        refundEntry(entry, "Week ended — not played; points released");
      }
    }
    pools.delete(weekKey);
    cleared.push(weekKey);
  }
  if (cleared.length > 0) {
    shuffleOrder = [];
    currentPlayingId = null;
  }
  return cleared;
}

export function getPoolStatus(weekKey?: string): {
  capacity: WdpPoolCapacityReport;
  entries: WdpRotationEntry[];
  nowPlaying: WdpNowPlaying;
} {
  purgeExpiredWeeks();
  const key = weekKey ?? getWorldDanceFridayWeekKey();
  const entries = [...getPool(key)].sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999));
  const capEntries = entries.length ? entries : [];
  const capacity: WdpPoolCapacityReport = capEntries.length
    ? computeCapacity(capEntries)
    : {
        weekKey: key,
        totalSubmitted: 0,
        scheduledCount: 0,
        overflowCount: 0,
        estimatedSlots: Math.floor(WDP_FRIDAY_SLOT_MS / WDP_DEFAULT_TRACK_MS),
        avgSlotMs: WDP_DEFAULT_TRACK_MS,
        submitWindowOpen: getSubmitWindowForWeekKey(key).opensAt.getTime() <= Date.now(),
        phase: getWorldDancePartyWindow().phase,
      };
  return {
    capacity,
    entries,
    nowPlaying: tickWorldDanceDJ(),
  };
}

export function getNowPlaying(): WdpNowPlaying {
  return tickWorldDanceDJ();
}

export function isOfficialWorldDanceLive(): boolean {
  return isWorldDancePartyLive();
}

/** Paid WDP submission boost — priority band, not guaranteed play (Rule 20). */
export function applyWdpSubmissionBoost(entryId: string): WdpRotationEntry | null {
  for (const [, pool] of pools) {
    const entry = pool.find((e) => e.id === entryId);
    if (!entry) continue;
    if (entry.status === "played" || entry.status === "rejected" || entry.status === "refunded") {
      return null;
    }
    if (!entry.tags.includes("wdp-boost-active")) {
      entry.tags.push("wdp-boost-active");
    }
    entry.scheduledEstimate =
      "Paid boost active — priority rotation band (airtime not guaranteed)";
    assignQueuePositions(entry.weekKey);
    return entry;
  }
  return null;
}
