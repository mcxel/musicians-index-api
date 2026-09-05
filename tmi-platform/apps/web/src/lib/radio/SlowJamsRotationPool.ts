/**
 * SlowJamsRotationPool — Sat→Sun submit → Sunday play → clear (Rule 20/21/25).
 * Separate from WorldDancePartyRotationPool. Soft fades, chill DJ energy.
 */

import { participationEconomyEngine } from "@/lib/economy/ParticipationEconomyEngine";
import {
  getSlowJamsSundayWeekKey,
  getSlowJamsWindow,
  getSlowJamsSubmitWindowForWeekKey,
  isSlowJamsLive,
} from "@/lib/radio/SlowJamsShowtime";
import { pickBeat, type DJAction } from "@/engines/performance/BotDJEngine";
import type { BeatEntry } from "@/engines/performance/BeatQueueEngine";
import { SLOW_JAM_MOTION } from "@/lib/live/ExperiencePersonality";

export const SJ_SUBMIT_COIN_RESERVE = 50;
export const SJ_DEFAULT_TRACK_MS = 4 * 60 * 1000;
export const SJ_SUNDAY_SLOT_MS = 24 * 60 * 60 * 1000;
/** Longer than WDP skip fade (3s) — smooth lounge crossfade. */
export const SJ_CROSSFADE_MS = SLOW_JAM_MOTION.crossfadeMs;
export const SJ_OFFICIAL_ROOM_ID = "slow-jams";
export const SJ_OFFICIAL_ROOM_IDS = [
  "slow-jams",
  "sunday-slow-jams",
  "live/rooms/slow-jam",
  "live/rooms/slow-jams",
] as const;

export type SjTrackStatus =
  | "pending_review"
  | "queued"
  | "scheduled"
  | "overflow"
  | "playing"
  | "played"
  | "rejected"
  | "refunded";

export interface SjRotationEntry {
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
  status: SjTrackStatus;
  reservedCoins: number;
  coinsCharged: boolean;
  queuePosition: number | null;
  scheduledEstimate: string | null;
  submittedAtMs: number;
  playedAtMs: number | null;
  tags: string[];
}

export interface SjPoolCapacityReport {
  weekKey: string;
  totalSubmitted: number;
  scheduledCount: number;
  overflowCount: number;
  estimatedSlots: number;
  avgSlotMs: number;
  submitWindowOpen: boolean;
  phase: string;
}

export interface SjNowPlaying {
  active: boolean;
  entry: SjRotationEntry | null;
  overlayArtist: string;
  overlayTitle: string;
  djLine: string | null;
  phase: string;
  weekKey: string;
  fadeActive: boolean;
  fadeProgress: number;
  transitioningOverlay: string | null;
}

const pools = new Map<string, SjRotationEntry[]>();
const pendingCoinReserve = new Map<string, number>();
let playCursor = 0;
let currentPlayingId: string | null = null;
let currentPlayingStartedMs = 0;
let shuffleOrder: string[] = [];
let fadeUntilMs = 0;
let fadeReason: string | null = null;

function idleNowPlaying(
  partial: Pick<SjNowPlaying, "active" | "phase" | "weekKey"> &
    Partial<Omit<SjNowPlaying, "active" | "phase" | "weekKey">>,
): SjNowPlaying {
  return {
    entry: null,
    overlayArtist: "",
    overlayTitle: "",
    djLine: null,
    fadeActive: false,
    fadeProgress: 0,
    transitioningOverlay: null,
    ...partial,
  };
}

function genId(): string {
  return `sj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getPool(weekKey: string): SjRotationEntry[] {
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

function finalizePlayCharge(entry: SjRotationEntry): void {
  if (entry.coinsCharged || entry.reservedCoins <= 0) return;
  const spend = participationEconomyEngine.spend(entry.submitterId, "sj_track_play", {
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

function refundEntry(entry: SjRotationEntry, reason: string): void {
  if (entry.coinsCharged) return;
  releaseReserve(entry.submitterId, entry.reservedCoins);
  entry.reservedCoins = 0;
  entry.status = "refunded";
  entry.scheduledEstimate = reason;
}

function computeCapacity(entries: SjRotationEntry[]): SjPoolCapacityReport {
  const weekKey = entries[0]?.weekKey ?? getSlowJamsSundayWeekKey();
  const window = getSlowJamsWindow();
  const playable = entries.filter(
    (e) => e.status !== "rejected" && e.status !== "refunded" && e.status !== "pending_review",
  );
  const durations = playable.map((e) => e.durationMs);
  const avgSlotMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : SJ_DEFAULT_TRACK_MS;
  const estimatedSlots = Math.max(1, Math.floor(SJ_SUNDAY_SLOT_MS / avgSlotMs));
  const { opensAt, closesAt } = getSlowJamsSubmitWindowForWeekKey(weekKey);
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
      const aBoost = a.tags.includes("sj-boost-active") ? 0 : 1;
      const bBoost = b.tags.includes("sj-boost-active") ? 0 : 1;
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
      entry.scheduledEstimate = `Scheduled for Sunday Slow Jams · slot ~${scheduled} of ${cap.estimatedSlots}`;
    } else {
      entry.status = "overflow";
      entry.queuePosition = scheduled;
      entry.scheduledEstimate = `Overflow — may not play; points refunded if not aired`;
    }
  }
}

export function submitToSlowJamsPool(input: {
  submitterId: string;
  artistName: string;
  title: string;
  audioUrl: string;
  genre?: string;
  bpm?: number | null;
  durationMs?: number;
  creditLine?: string;
  tags?: string[];
}): { ok: boolean; entry?: SjRotationEntry; error?: string; capacity?: SjPoolCapacityReport } {
  const window = getSlowJamsWindow();
  const weekKey = window.weekKey;
  const { opensAt, closesAt } = getSlowJamsSubmitWindowForWeekKey(weekKey);
  const now = Date.now();
  if (now < opensAt.getTime() || now > closesAt.getTime()) {
    return { ok: false, error: "submit_window_closed" };
  }

  const reserve = reserveCoins(input.submitterId, SJ_SUBMIT_COIN_RESERVE);
  if (!reserve.ok) {
    return { ok: false, error: reserve.reason ?? "insufficient_coins" };
  }

  const entry: SjRotationEntry = {
    id: genId(),
    weekKey,
    submitterId: input.submitterId,
    artistName: input.artistName.trim(),
    title: input.title.trim(),
    audioUrl: input.audioUrl.trim(),
    genre: (input.genre ?? "R&B Slow").trim(),
    bpm: input.bpm ?? null,
    durationMs: input.durationMs && input.durationMs > 0 ? input.durationMs : SJ_DEFAULT_TRACK_MS,
    creditLine: (input.creditLine ?? `${input.artistName} · ${input.title}`).trim(),
    status: "queued",
    reservedCoins: SJ_SUBMIT_COIN_RESERVE,
    coinsCharged: false,
    queuePosition: null,
    scheduledEstimate: null,
    submittedAtMs: now,
    playedAtMs: null,
    tags: [...(input.tags ?? []), "slow-jams", "slow"],
  };

  getPool(weekKey).push(entry);
  assignQueuePositions(weekKey);
  return { ok: true, entry, capacity: computeCapacity(getPool(weekKey)) };
}

function entryToBeat(entry: SjRotationEntry): BeatEntry {
  return {
    id: entry.id,
    title: entry.title,
    genre: entry.genre,
    energy: "low",
    bpm: entry.bpm ?? 75,
    producerId: entry.submitterId,
    producerName: entry.artistName,
    license: "producer-submitted",
    royaltyBps: 500,
    isActive: true,
    compatibleModes: ["beat-backed"],
    compatibleGenres: [entry.genre],
    votes: 0,
    skipCount: 0,
    usageCount: 0,
  };
}

function startSmoothFade(nowMs: number, reason: string): void {
  fadeUntilMs = nowMs + SJ_CROSSFADE_MS;
  fadeReason = reason;
}

/** Advance Stream & Win Slow Jams DJ — Sundays only; honest idle when pool empty. */
export function tickSlowJamsDJ(nowMs: number = Date.now()): SjNowPlaying {
  purgeExpiredSlowJamsWeeks(nowMs);
  const window = getSlowJamsWindow(new Date(nowMs));

  if (window.phase !== "LIVE") {
    currentPlayingId = null;
    fadeUntilMs = 0;
    return idleNowPlaying({ active: false, phase: window.phase, weekKey: window.weekKey });
  }

  const weekKey = window.weekKey;
  if (shuffleOrder.length === 0) {
    reshuffleWeek(weekKey);
  }

  const current = currentPlayingId
    ? getPool(weekKey).find((e) => e.id === currentPlayingId)
    : null;

  if (fadeUntilMs > nowMs && current) {
    const progress = 1 - (fadeUntilMs - nowMs) / SJ_CROSSFADE_MS;
    const dj = pickBeat("bot-dj-2", entryToBeat(current), playCursor);
    return buildNowPlaying(current, dj, window.phase, weekKey, {
      fadeActive: true,
      fadeProgress: Math.min(1, Math.max(0, progress)),
      transitioningOverlay: "Soft fade · next chill",
    });
  }

  if (fadeUntilMs > 0 && fadeUntilMs <= nowMs && current?.status === "playing") {
    current.status = "played";
    current.playedAtMs = nowMs;
    currentPlayingId = null;
    fadeUntilMs = 0;
    fadeReason = null;
  }

  if (
    current &&
    current.status === "playing" &&
    nowMs - currentPlayingStartedMs < current.durationMs
  ) {
    const dj = pickBeat("bot-dj-2", entryToBeat(current), playCursor);
    return buildNowPlaying(current, dj, window.phase, weekKey);
  }

  if (current && current.status === "playing") {
    startSmoothFade(nowMs, "natural_end");
    const dj = pickBeat("bot-dj-2", entryToBeat(current), playCursor);
    return buildNowPlaying(current, dj, window.phase, weekKey, {
      fadeActive: true,
      fadeProgress: 0,
      transitioningOverlay: "Soft fade · next chill",
    });
  }

  while (playCursor < shuffleOrder.length) {
    const id = shuffleOrder[playCursor]!;
    playCursor += 1;
    const next = getPool(weekKey).find((e) => e.id === id);
    if (!next || next.status === "played" || next.status === "refunded" || next.status === "rejected") {
      continue;
    }
    if (next.status === "overflow") {
      refundEntry(next, "Overflow — not aired this Sunday");
      continue;
    }
    next.status = "playing";
    currentPlayingId = next.id;
    currentPlayingStartedMs = nowMs;
    finalizePlayCharge(next);
    const dj = pickBeat("bot-dj-2", entryToBeat(next), playCursor);
    return buildNowPlaying(next, dj, window.phase, weekKey);
  }

  reshuffleWeek(weekKey);
  return idleNowPlaying({
    active: true,
    phase: window.phase,
    weekKey,
    overlayTitle: "Waiting for slow submissions",
    djLine: "Sunday Slow Jams · lounge recruiting soft spins",
  });
}

function buildNowPlaying(
  entry: SjRotationEntry,
  dj: DJAction,
  phase: string,
  weekKey: string,
  fade?: Partial<Pick<SjNowPlaying, "fadeActive" | "fadeProgress" | "transitioningOverlay">>,
): SjNowPlaying {
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
    transitioningOverlay: fade?.transitioningOverlay ?? null,
  };
}

/** After Sunday ends — refund overflow + clear pool (weekly law). */
export function purgeExpiredSlowJamsWeeks(nowMs: number = Date.now()): string[] {
  const cleared: string[] = [];
  for (const [weekKey, pool] of [...pools.entries()]) {
    const { closesAt } = getSlowJamsSubmitWindowForWeekKey(weekKey);
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
    fadeUntilMs = 0;
  }
  return cleared;
}

export function getSlowJamsPoolStatus(weekKey?: string): {
  capacity: SjPoolCapacityReport;
  entries: SjRotationEntry[];
  nowPlaying: SjNowPlaying;
} {
  purgeExpiredSlowJamsWeeks();
  const key = weekKey ?? getSlowJamsSundayWeekKey();
  const entries = [...getPool(key)].sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999));
  const capacity: SjPoolCapacityReport = entries.length
    ? computeCapacity(entries)
    : {
        weekKey: key,
        totalSubmitted: 0,
        scheduledCount: 0,
        overflowCount: 0,
        estimatedSlots: Math.floor(SJ_SUNDAY_SLOT_MS / SJ_DEFAULT_TRACK_MS),
        avgSlotMs: SJ_DEFAULT_TRACK_MS,
        submitWindowOpen: getSlowJamsSubmitWindowForWeekKey(key).opensAt.getTime() <= Date.now(),
        phase: getSlowJamsWindow().phase,
      };
  return {
    capacity,
    entries,
    nowPlaying: tickSlowJamsDJ(),
  };
}

export function getSlowJamsNowPlaying(): SjNowPlaying {
  return tickSlowJamsDJ();
}

export function isOfficialSlowJamsLive(): boolean {
  return isSlowJamsLive();
}

/** Optional paid boost — reuse WDP pattern (priority band, not guaranteed play). */
export function applySjSubmissionBoost(entryId: string): SjRotationEntry | null {
  for (const [, pool] of pools) {
    const entry = pool.find((e) => e.id === entryId);
    if (!entry) continue;
    if (entry.status === "played" || entry.status === "rejected" || entry.status === "refunded") {
      return null;
    }
    if (!entry.tags.includes("sj-boost-active")) {
      entry.tags.push("sj-boost-active");
    }
    entry.scheduledEstimate =
      "Paid boost active — priority rotation band (airtime not guaranteed)";
    assignQueuePositions(entry.weekKey);
    return entry;
  }
  return null;
}
