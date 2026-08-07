/**
 * FanRubricVotingEngine — real-time fan rubric votes for battles / gauntlet / challenges.
 * Distinct from Gauntlet audience elimination. Gifts never count as votes.
 * Rule 20: real ballots only; tallies start at zero.
 */

import { getXpValue } from "@/lib/xp/XpActionRegistry";

export type RubricCriterion =
  | "who_won"
  | "originality"
  | "style"
  | "delivery"
  | "stage_presence"
  | "showmanship"
  | string;

export const DEFAULT_RUBRIC_CRITERIA: Array<{ id: RubricCriterion; label: string }> = [
  { id: "who_won", label: "Who won" },
  { id: "originality", label: "Originality" },
  { id: "style", label: "Style" },
  { id: "delivery", label: "Delivery" },
  { id: "stage_presence", label: "Stage presence" },
  { id: "showmanship", label: "Showmanship" },
];

export type RubricVoteBallot = {
  roomId: string;
  eventId: string;
  voterId: string;
  performerId: string;
  /** 1–5 per criterion (who_won may be binary via score 5 = selected). */
  scores: Record<string, number>;
  at: number;
  isGift?: boolean;
};

export type PerformerRubricStats = {
  performerId: string;
  ballotCount: number;
  averages: Record<string, number>;
  whoWonCount: number;
  xpHint: number;
};

type WindowState = {
  roomId: string;
  eventId: string;
  open: boolean;
  performerIds: string[];
  criteria: Array<{ id: string; label: string }>;
  ballots: Map<string, RubricVoteBallot>;
  openedAt: number;
  closedAt?: number;
};

const windows = new Map<string, WindowState>();
/** performerId → cumulative accuracy / feedback ledger */
const performerLedger = new Map<string, PerformerRubricStats>();

function windowKey(roomId: string, eventId: string): string {
  return `${roomId}::${eventId}`;
}

export function openRubricVoteWindow(input: {
  roomId: string;
  eventId: string;
  performerIds: string[];
  criteria?: Array<{ id: string; label: string }>;
}): WindowState {
  const key = windowKey(input.roomId, input.eventId);
  const existing = windows.get(key);
  if (existing?.open) return existing;

  const next: WindowState = {
    roomId: input.roomId,
    eventId: input.eventId,
    open: true,
    performerIds: [...input.performerIds],
    criteria: input.criteria ?? DEFAULT_RUBRIC_CRITERIA,
    ballots: new Map(),
    openedAt: Date.now(),
  };
  windows.set(key, next);
  return next;
}

export function closeRubricVoteWindow(roomId: string, eventId: string): void {
  const w = windows.get(windowKey(roomId, eventId));
  if (!w) return;
  w.open = false;
  w.closedAt = Date.now();
  recomputeLedger(w);
}

export function isRubricVoteOpen(roomId: string, eventId: string): boolean {
  return Boolean(windows.get(windowKey(roomId, eventId))?.open);
}

export function getRubricWindow(roomId: string, eventId: string): WindowState | undefined {
  return windows.get(windowKey(roomId, eventId));
}

export function castRubricVote(input: {
  roomId: string;
  eventId: string;
  voterId: string;
  performerId: string;
  scores: Record<string, number>;
  isGift?: boolean;
}): { ok: true; ballot: RubricVoteBallot; xp: number } | { ok: false; reason: string } {
  if (input.isGift) {
    return { ok: false, reason: "gifts-never-count-as-votes" };
  }
  const w = windows.get(windowKey(input.roomId, input.eventId));
  if (!w || !w.open) {
    return { ok: false, reason: "voting-window-closed" };
  }
  if (!input.voterId.trim()) {
    return { ok: false, reason: "voter-required" };
  }
  if (!w.performerIds.includes(input.performerId)) {
    return { ok: false, reason: "performer-not-in-window" };
  }

  const scores: Record<string, number> = {};
  for (const c of w.criteria) {
    const raw = input.scores[c.id];
    if (typeof raw !== "number" || Number.isNaN(raw)) continue;
    scores[c.id] = Math.max(1, Math.min(5, Math.round(raw)));
  }
  if (Object.keys(scores).length === 0) {
    return { ok: false, reason: "no-scores" };
  }

  const ballot: RubricVoteBallot = {
    roomId: input.roomId,
    eventId: input.eventId,
    voterId: input.voterId,
    performerId: input.performerId,
    scores,
    at: Date.now(),
  };
  w.ballots.set(input.voterId, ballot);
  recomputeLedger(w);

  return { ok: true, ballot, xp: getXpValue("vote_battle") };
}

export function getRubricTallies(roomId: string, eventId: string): {
  open: boolean;
  totalBallots: number;
  byPerformer: PerformerRubricStats[];
  criteria: Array<{ id: string; label: string }>;
} {
  const w = windows.get(windowKey(roomId, eventId));
  if (!w) {
    return { open: false, totalBallots: 0, byPerformer: [], criteria: DEFAULT_RUBRIC_CRITERIA };
  }
  return {
    open: w.open,
    totalBallots: w.ballots.size,
    byPerformer: w.performerIds.map((id) => statsForWindow(w, id)),
    criteria: w.criteria,
  };
}

export function getPerformerRubricStats(performerId: string): PerformerRubricStats | null {
  return performerLedger.get(performerId) ?? null;
}

function statsForWindow(w: WindowState, performerId: string): PerformerRubricStats {
  const ballots = [...w.ballots.values()].filter((b) => b.performerId === performerId);
  const averages: Record<string, number> = {};
  for (const c of w.criteria) {
    const vals = ballots.map((b) => b.scores[c.id]).filter((n): n is number => typeof n === "number");
    averages[c.id] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  }
  const whoWonCount = ballots.filter((b) => (b.scores.who_won ?? 0) >= 4).length;
  return {
    performerId,
    ballotCount: ballots.length,
    averages,
    whoWonCount,
    xpHint: ballots.length * getXpValue("vote_battle"),
  };
}

function recomputeLedger(w: WindowState): void {
  for (const id of w.performerIds) {
    const snap = statsForWindow(w, id);
    const prev = performerLedger.get(id);
    if (!prev) {
      performerLedger.set(id, snap);
      continue;
    }
    // Merge averages weighted by ballot counts (honest accumulation).
    const totalBallots = prev.ballotCount + snap.ballotCount;
    const averages: Record<string, number> = { ...prev.averages };
    for (const [k, v] of Object.entries(snap.averages)) {
      const prevAvg = prev.averages[k] ?? 0;
      averages[k] =
        totalBallots === 0
          ? 0
          : Math.round(((prevAvg * prev.ballotCount + v * snap.ballotCount) / totalBallots) * 10) / 10;
    }
    performerLedger.set(id, {
      performerId: id,
      ballotCount: totalBallots,
      averages,
      whoWonCount: prev.whoWonCount + snap.whoWonCount,
      xpHint: (prev.xpHint ?? 0) + snap.xpHint,
    });
  }
}
