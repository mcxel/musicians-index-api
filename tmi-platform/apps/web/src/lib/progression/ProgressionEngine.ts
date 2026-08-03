/**
 * ProgressionEngine — four pillars separated (Phase 2B).
 *
 *   1. TMI Points  — spendable currency (does NOT feed championship ladder)
 *   2. XP          — level via XpActionRegistry
 *   3. Achievements — permanent milestones
 *   4. Ranking Score — competitive only (wins / defenses / form)
 *      Commerce sales → commerce leaderboard only (never ranking score)
 *
 * WIN_BATTLE (and similar) dispatch Command Bus → XP + points + achievements
 * + ranking update + championship check + timeline append + observatory log.
 */

import { getXpAction, getXpValue, type XpActionKey } from "@/lib/xp/XpActionRegistry";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import { listTitlesForHolder } from "@/lib/championship/ChampionshipRegistry";
import { updateArtistProgression } from "@/lib/progression/ArtistProgressionEngine";

// ─── Pillar stores (in-memory + localStorage when available) ──────────────────

const POINTS_KEY = "tmi_progression_points_v1";
const XP_KEY = "tmi_progression_xp_v1";
const RANK_KEY = "tmi_progression_rank_v1";
const ACHIEVE_KEY = "tmi_progression_achievements_v1";
const TIMELINE_KEY = "tmi_progression_timeline_v1";
const DAILY_XP_KEY = "tmi_progression_daily_xp_v1";

/** Soft fair-play cap — stub until server-side enforcement. */
export const DAILY_XP_CAP = 5_000;

export type ProgressionPillar =
  | "points"
  | "xp"
  | "achievements"
  | "ranking_score";

export interface CareerTimelineEntry {
  id: string;
  at: string;
  kind: string;
  label: string;
  meta?: Record<string, string | number | boolean>;
}

export interface ProgressionSnapshot {
  userId: string;
  points: number;
  xp: number;
  level: number;
  rankingScore: number;
  achievementIds: string[];
  commerceSalesScore: number;
  dailyXpEarned: number;
  dailyXpCap: number;
  titlesHeld: number;
}

function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function storageSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function mapGet(key: string): Record<string, number> {
  return storageGet<Record<string, number>>(key, {});
}

function mapSet(key: string, map: Record<string, number>): void {
  storageSet(key, map);
}

function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyXpBucket(userId: string): { date: string; xp: number } {
  const all = storageGet<Record<string, { date: string; xp: number }>>(DAILY_XP_KEY, {});
  const bucket = all[userId];
  if (!bucket || bucket.date !== todayKey()) return { date: todayKey(), xp: 0 };
  return bucket;
}

function setDailyXpBucket(userId: string, xp: number): void {
  const all = storageGet<Record<string, { date: string; xp: number }>>(DAILY_XP_KEY, {});
  all[userId] = { date: todayKey(), xp };
  storageSet(DAILY_XP_KEY, all);
}

// ─── Pillar APIs ─────────────────────────────────────────────────────────────

/** Spendable TMI Points — never used for championship eligibility. */
export function getTmiPoints(userId: string): number {
  return mapGet(POINTS_KEY)[userId] ?? 0;
}

export function grantTmiPoints(userId: string, amount: number, reason?: string): number {
  if (amount <= 0) return getTmiPoints(userId);
  const map = mapGet(POINTS_KEY);
  map[userId] = (map[userId] ?? 0) + amount;
  mapSet(POINTS_KEY, map);
  appendTimeline(userId, {
    kind: "POINTS_GRANT",
    label: `+${amount} TMI Points${reason ? ` · ${reason}` : ""}`,
    meta: { amount, reason: reason ?? "" },
  });
  return map[userId]!;
}

export function getXpTotal(userId: string): number {
  return mapGet(XP_KEY)[userId] ?? 0;
}

/**
 * Grant XP via XpActionRegistry values. Respects daily cap stub.
 * Returns { granted, capped } — capped=true when daily limit hit.
 */
export function grantXp(
  userId: string,
  actionKey: XpActionKey | "custom",
  overrideXp?: number,
): { granted: number; capped: boolean; total: number; level: number; leveledUp: boolean } {
  const raw = overrideXp ?? (actionKey === "custom" ? 0 : getXpValue(actionKey));
  if (raw <= 0) {
    const total = getXpTotal(userId);
    return { granted: 0, capped: false, total, level: levelFromXp(total), leveledUp: false };
  }

  const bucket = getDailyXpBucket(userId);
  const room = Math.max(0, DAILY_XP_CAP - bucket.xp);
  const granted = Math.min(raw, room);
  const capped = granted < raw;

  const prev = getXpTotal(userId);
  const prevLevel = levelFromXp(prev);
  const map = mapGet(XP_KEY);
  map[userId] = prev + granted;
  mapSet(XP_KEY, map);
  setDailyXpBucket(userId, bucket.xp + granted);

  const total = map[userId]!;
  const level = levelFromXp(total);
  const leveledUp = level > prevLevel;

  if (granted > 0) {
    appendTimeline(userId, {
      kind: "XP_GRANT",
      label: `+${granted} XP${actionKey !== "custom" ? ` · ${actionKey}` : ""}`,
      meta: { amount: granted, actionKey, capped },
    });
  }

  if (leveledUp) {
    livingOsCommandBus.dispatch({
      type: "LEVEL_UP",
      category: "competitions",
      userId,
      payload: { level, previousLevel: prevLevel, xp: total },
      idempotencyKey: `level_up_${userId}_${level}`,
    });
    appendTimeline(userId, {
      kind: "LEVEL_UP",
      label: `Reached level ${level}`,
      meta: { level },
    });
  }

  updateArtistProgression({ artistId: userId });
  return { granted, capped, total, level, leveledUp };
}

/** Competitive ranking score — wins/defenses/form only. */
export function getRankingScore(userId: string): number {
  return mapGet(RANK_KEY)[userId] ?? 0;
}

export function addRankingScore(
  userId: string,
  delta: number,
  reason: string,
): number {
  if (delta === 0) return getRankingScore(userId);
  const map = mapGet(RANK_KEY);
  map[userId] = Math.max(0, (map[userId] ?? 0) + delta);
  mapSet(RANK_KEY, map);
  appendTimeline(userId, {
    kind: "RANKING_SCORE",
    label: `${delta >= 0 ? "+" : ""}${delta} ranking · ${reason}`,
    meta: { delta, reason },
  });
  return map[userId]!;
}

/**
 * Commerce sales score — SEPARATE from ranking. Never feeds championship ladder.
 */
const COMMERCE_KEY = "tmi_progression_commerce_v1";

export function getCommerceSalesScore(userId: string): number {
  return mapGet(COMMERCE_KEY)[userId] ?? 0;
}

export function recordCommerceSale(userId: string, amount: number): number {
  if (amount <= 0) return getCommerceSalesScore(userId);
  const map = mapGet(COMMERCE_KEY);
  map[userId] = (map[userId] ?? 0) + amount;
  mapSet(COMMERCE_KEY, map);
  appendTimeline(userId, {
    kind: "COMMERCE_SALE",
    label: `Commerce sale recorded (+${amount} commerce score)`,
    meta: { amount },
  });
  return map[userId]!;
}

export function listAchievements(userId: string): string[] {
  const all = storageGet<Record<string, string[]>>(ACHIEVE_KEY, {});
  return all[userId] ?? [];
}

export function unlockAchievement(
  userId: string,
  achievementId: string,
  label?: string,
): boolean {
  const all = storageGet<Record<string, string[]>>(ACHIEVE_KEY, {});
  const current = all[userId] ?? [];
  if (current.includes(achievementId)) return false;
  all[userId] = [...current, achievementId];
  storageSet(ACHIEVE_KEY, all);
  livingOsCommandBus.dispatch({
    type: "UNLOCK_ACHIEVEMENT",
    category: "competitions",
    userId,
    payload: { achievementId, label: label ?? achievementId },
    idempotencyKey: `achieve_${userId}_${achievementId}`,
  });
  appendTimeline(userId, {
    kind: "UNLOCK_ACHIEVEMENT",
    label: label ?? `Unlocked ${achievementId}`,
    meta: { achievementId },
  });
  return true;
}

export function appendTimeline(
  userId: string,
  entry: Omit<CareerTimelineEntry, "id" | "at"> & { at?: string },
): CareerTimelineEntry {
  const all = storageGet<Record<string, CareerTimelineEntry[]>>(TIMELINE_KEY, {});
  const row: CareerTimelineEntry = {
    id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    at: entry.at ?? new Date().toISOString(),
    kind: entry.kind,
    label: entry.label,
    meta: entry.meta,
  };
  all[userId] = [row, ...(all[userId] ?? [])].slice(0, 200);
  storageSet(TIMELINE_KEY, all);
  return row;
}

export function getCareerTimeline(userId: string): CareerTimelineEntry[] {
  const all = storageGet<Record<string, CareerTimelineEntry[]>>(TIMELINE_KEY, {});
  return all[userId] ?? [];
}

export function getProgressionSnapshot(userId: string): ProgressionSnapshot {
  const xp = getXpTotal(userId);
  const daily = getDailyXpBucket(userId);
  return {
    userId,
    points: getTmiPoints(userId),
    xp,
    level: levelFromXp(xp),
    rankingScore: getRankingScore(userId),
    achievementIds: listAchievements(userId),
    commerceSalesScore: getCommerceSalesScore(userId),
    dailyXpEarned: daily.xp,
    dailyXpCap: DAILY_XP_CAP,
    titlesHeld: listTitlesForHolder(userId).length,
  };
}

/**
 * Route a competitive win through all four pillars + championship check + bus.
 * Points grant is separate from ranking — points never unlock titles.
 */
export function processCompetitiveWin(input: {
  userId: string;
  role?: "fan" | "performer" | "admin";
  kind: "battle" | "cypher" | "challenge";
  eventId?: string;
}): ProgressionSnapshot {
  const actionKey: XpActionKey =
    input.kind === "cypher" ? "win_cypher" : "win_battle";
  const xpAction = getXpAction(actionKey);

  livingOsCommandBus.dispatch({
    type: "WIN_BATTLE",
    category: "competitions",
    userId: input.userId,
    role: input.role,
    payload: {
      kind: input.kind,
      eventId: input.eventId,
      actionKey,
      viaProgressionEngine: true,
      processed: true,
    },
    idempotencyKey: `win_${input.kind}_${input.userId}_${input.eventId ?? Date.now()}`,
  });

  grantXp(input.userId, actionKey);
  grantTmiPoints(input.userId, Math.round((xpAction?.xp ?? 100) / 10), `${input.kind}_win`);
  addRankingScore(input.userId, input.kind === "battle" ? 100 : 60, `${input.kind}_win`);

  if (xpAction?.achievementUnlock) {
    unlockAchievement(
      input.userId,
      xpAction.achievementUnlock,
      xpAction.label,
    );
  }

  // Championship check — titles held listed; no auto-award without real match engine
  const held = listTitlesForHolder(input.userId);
  appendTimeline(input.userId, {
    kind: "CHAMPIONSHIP_CHECK",
    label:
      held.length > 0
        ? `Championship check · holding ${held.length} title(s)`
        : "Championship check · no active titles (honest empty)",
    meta: { titlesHeld: held.length },
  });

  return getProgressionSnapshot(input.userId);
}

let _busWired = false;

/** Wire ProgressionEngine listeners on the Living OS Command Bus (idempotent). */
export function wireProgressionCommandBus(): void {
  if (_busWired || typeof window === "undefined") return;
  _busWired = true;

  livingOsCommandBus.on("WIN_BATTLE", (cmd) => {
    const userId = cmd.userId;
    if (!userId) return;
    // Avoid double-grant when processCompetitiveWin already ran — only react to external wins
    if (cmd.payload?.viaProgressionEngine === true) return;
    // External emitters should set viaProgressionEngine; if absent, process lightly
    if (!cmd.payload?.processed) {
      grantXp(userId, "win_battle");
      grantTmiPoints(userId, 80, "win_battle");
      addRankingScore(userId, 100, "win_battle");
    }
  });
}
