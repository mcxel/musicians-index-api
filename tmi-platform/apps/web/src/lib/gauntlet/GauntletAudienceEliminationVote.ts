/**
 * GauntletAudienceEliminationVote — audience picks who is eliminated (ladder / battle-royal).
 * Real vote tallies only. Gifts never become silent votes (Rule 20 + GauntletJudgingConfig).
 */

import {
  getGauntletJudgingConfig,
  giftContributesToVote,
  type GauntletJudgingMode,
} from "@/lib/gauntlet/GauntletJudgingConfig";

export type EliminationVoteWindow = {
  runId: string;
  roomId: string;
  open: boolean;
  opensAt: number;
  closesAt: number;
  /** competitorId → elimination vote count (audience wants them out). */
  tallies: Map<string, number>;
  /** voterId → competitorId they voted to eliminate (one vote per window). */
  ballots: Map<string, string>;
  /** Optional judge eliminate marks (HYBRID / JUDGES_ONLY). */
  judgeTallies: Map<string, number>;
  mode: GauntletJudgingMode;
};

export type EliminationTallyRow = {
  competitorId: string;
  audienceVotes: number;
  judgeMarks: number;
  weightedScore: number;
};

const windows = new Map<string, EliminationVoteWindow>();

export function openEliminationVoteWindow(input: {
  runId: string;
  roomId: string;
  durationSeconds: number;
  eligibleCompetitorIds: string[];
}): EliminationVoteWindow {
  const config = getGauntletJudgingConfig(input.roomId);
  const now = Date.now();
  const tallies = new Map<string, number>();
  const judgeTallies = new Map<string, number>();
  for (const id of input.eligibleCompetitorIds) {
    tallies.set(id, 0);
    judgeTallies.set(id, 0);
  }
  const window: EliminationVoteWindow = {
    runId: input.runId,
    roomId: input.roomId,
    open: true,
    opensAt: now,
    closesAt: now + Math.max(5, input.durationSeconds) * 1000,
    tallies,
    ballots: new Map(),
    judgeTallies,
    mode: config.mode,
  };
  windows.set(input.runId, window);
  return window;
}

export function getEliminationVoteWindow(runId: string): EliminationVoteWindow | null {
  return windows.get(runId) ?? null;
}

export function isEliminationVoteOpen(runId: string): boolean {
  const w = windows.get(runId);
  if (!w || !w.open) return false;
  if (Date.now() > w.closesAt) {
    w.open = false;
    return false;
  }
  return true;
}

/**
 * Audience casts one elimination vote. Returns honest failure reasons.
 * Gifts are explicitly rejected — tip XP never mutates tallies.
 */
export function castAudienceEliminationVote(input: {
  runId: string;
  voterId: string;
  eliminateCompetitorId: string;
  /** If caller mistakenly passes a gift tip as a vote, reject. */
  fromGift?: boolean;
}): { ok: boolean; reason?: string } {
  if (input.fromGift || giftContributesToVote()) {
    return { ok: false, reason: "gifts-never-count-as-votes" };
  }
  const w = windows.get(input.runId);
  if (!w || !isEliminationVoteOpen(input.runId)) {
    return { ok: false, reason: "voting-closed" };
  }
  if (w.mode === "JUDGES_ONLY") {
    return { ok: false, reason: "judges-only-mode" };
  }
  if (!w.tallies.has(input.eliminateCompetitorId)) {
    return { ok: false, reason: "competitor-not-eligible" };
  }
  const prev = w.ballots.get(input.voterId);
  if (prev) {
    w.tallies.set(prev, Math.max(0, (w.tallies.get(prev) ?? 0) - 1));
  }
  w.ballots.set(input.voterId, input.eliminateCompetitorId);
  w.tallies.set(
    input.eliminateCompetitorId,
    (w.tallies.get(input.eliminateCompetitorId) ?? 0) + 1,
  );
  return { ok: true };
}

export function castJudgeEliminationMark(input: {
  runId: string;
  judgeId: string;
  eliminateCompetitorId: string;
}): { ok: boolean; reason?: string } {
  const w = windows.get(input.runId);
  if (!w || !isEliminationVoteOpen(input.runId)) {
    return { ok: false, reason: "voting-closed" };
  }
  if (w.mode === "CROWD_ONLY") {
    return { ok: false, reason: "crowd-only-mode" };
  }
  if (!w.judgeTallies.has(input.eliminateCompetitorId)) {
    return { ok: false, reason: "competitor-not-eligible" };
  }
  w.judgeTallies.set(
    input.eliminateCompetitorId,
    (w.judgeTallies.get(input.eliminateCompetitorId) ?? 0) + 1,
  );
  return { ok: true };
}

export function closeEliminationVoteWindow(runId: string): EliminationVoteWindow | null {
  const w = windows.get(runId);
  if (!w) return null;
  w.open = false;
  w.closesAt = Math.min(w.closesAt, Date.now());
  return w;
}

export function getEliminationTallies(runId: string): EliminationTallyRow[] {
  const w = windows.get(runId);
  if (!w) return [];
  const config = getGauntletJudgingConfig(w.roomId);
  const crowdW = config.mode === "JUDGES_ONLY" ? 0 : config.mode === "CROWD_ONLY" ? 1 : config.crowdWeight;
  const judgeW = 1 - crowdW;
  const rows: EliminationTallyRow[] = [];
  for (const competitorId of w.tallies.keys()) {
    const audienceVotes = w.tallies.get(competitorId) ?? 0;
    const judgeMarks = w.judgeTallies.get(competitorId) ?? 0;
    rows.push({
      competitorId,
      audienceVotes,
      judgeMarks,
      weightedScore: audienceVotes * crowdW + judgeMarks * judgeW,
    });
  }
  rows.sort((a, b) => b.weightedScore - a.weightedScore || b.audienceVotes - a.audienceVotes);
  return rows;
}

/**
 * Pick who is eliminated: highest weighted elimination score.
 * Honest empty: if no votes/marks exist, returns null (do not invent a loser).
 */
export function resolveEliminatedCompetitor(runId: string): {
  eliminatedId: string | null;
  reason: "voted" | "no-votes" | "window-missing";
  tallies: EliminationTallyRow[];
} {
  const w = windows.get(runId);
  if (!w) return { eliminatedId: null, reason: "window-missing", tallies: [] };
  const tallies = getEliminationTallies(runId);
  const totalAudience = tallies.reduce((s, r) => s + r.audienceVotes, 0);
  const totalJudge = tallies.reduce((s, r) => s + r.judgeMarks, 0);
  if (totalAudience === 0 && totalJudge === 0) {
    return { eliminatedId: null, reason: "no-votes", tallies };
  }
  const top = tallies[0];
  if (!top || top.weightedScore <= 0) {
    return { eliminatedId: null, reason: "no-votes", tallies };
  }
  return { eliminatedId: top.competitorId, reason: "voted", tallies };
}

export function getVoteWindowRemainingSeconds(runId: string): number {
  const w = windows.get(runId);
  if (!w || !w.open) return 0;
  return Math.max(0, Math.ceil((w.closesAt - Date.now()) / 1000));
}
