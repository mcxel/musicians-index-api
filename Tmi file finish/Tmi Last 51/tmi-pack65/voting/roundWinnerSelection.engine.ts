// apps/web/src/lib/engines/roundWinnerSelection.engine.ts
// Selects winner from audience votes OR room energy fallback.
// Audience-led first. Fallback when not enough votes.

import { VoteState, VoteOption } from "./audienceVote.engine";

export interface WinnerResult {
  winnerId: string;
  winnerOptionId: string;
  winnerLabel: string;
  method: "audience_vote" | "room_energy_fallback" | "no_contest";
  votePercent: number;
  margin: number;
  isTie: boolean;
  confidence: "high" | "medium" | "low";
  auditReason: string;
  decisionAtMs: number;
}

export const AUDIENCE_THRESHOLD = {
  MIN_VOTES_FOR_AUDIENCE_WIN: 10, // below this → use fallback
  MIN_PERCENT_FOR_CLEAR_WIN: 55,  // below this → may be contested
} as const;

export function selectRoundWinner(
  state: VoteState,
  roomEnergy?: { [contestantId: string]: number }
): WinnerResult {
  const now = Date.now();
  const sorted = [...state.options].sort((a, b) => b.voteCount - a.voteCount);

  // Case 1: No options
  if (sorted.length === 0) {
    return { winnerId:"", winnerOptionId:"", winnerLabel:"No contest", method:"no_contest",
      votePercent:0, margin:0, isTie:false, confidence:"low",
      auditReason:"No options available", decisionAtMs:now };
  }

  // Case 2: Not enough votes → fallback
  if (state.totalValidVotes < AUDIENCE_THRESHOLD.MIN_VOTES_FOR_AUDIENCE_WIN) {
    return selectFallbackWinner(state, roomEnergy, sorted, now);
  }

  // Case 3: Audience vote — highest vote count wins
  const leader = sorted[0];
  const second = sorted[1] ?? null;
  const margin = second ? leader.votePercent - second.votePercent : 100;
  const isTie = second ? Math.abs(margin) <= 1 : false;

  if (isTie) {
    // Tie-break: use room energy if available, else timestamp
    if (roomEnergy && leader.contestantId && second?.contestantId) {
      const energyLeader = (roomEnergy[leader.contestantId] ?? 0) > (roomEnergy[second.contestantId] ?? 0)
        ? leader : second;
      return buildWinnerResult(energyLeader, "audience_vote", margin, true, "Audience tied — room energy used as tie-breaker", now);
    }
    return buildWinnerResult(leader, "audience_vote", margin, true, "Tie — first past threshold wins by timestamp", now);
  }

  const confidence = leader.votePercent >= AUDIENCE_THRESHOLD.MIN_PERCENT_FOR_CLEAR_WIN ? "high" : "medium";
  return buildWinnerResult(leader, "audience_vote", margin, false, `Audience winner with ${leader.votePercent}% of votes`, now);
}

function selectFallbackWinner(
  state: VoteState,
  roomEnergy: { [id: string]: number } | undefined,
  sorted: VoteOption[],
  now: number
): WinnerResult {
  if (roomEnergy && Object.keys(roomEnergy).length > 0) {
    const topEnergyId = Object.entries(roomEnergy).sort(([,a],[,b]) => b - a)[0][0];
    const winnerOption = state.options.find(o => o.contestantId === topEnergyId) ?? sorted[0];
    return buildWinnerResult(winnerOption, "room_energy_fallback", 0, false,
      `Not enough audience votes (${state.totalValidVotes} < ${AUDIENCE_THRESHOLD.MIN_VOTES_FOR_AUDIENCE_WIN}) — room energy used`, now);
  }
  return buildWinnerResult(sorted[0], "room_energy_fallback", 0, false,
    `Not enough audience votes — random selection from highest engagement`, now);
}

function buildWinnerResult(option: VoteOption, method: WinnerResult["method"], margin: number, isTie: boolean, reason: string, now: number): WinnerResult {
  return {
    winnerId: option.contestantId ?? option.optionId,
    winnerOptionId: option.optionId,
    winnerLabel: option.label,
    method, votePercent: option.votePercent, margin, isTie,
    confidence: option.votePercent >= 55 ? "high" : option.votePercent >= 40 ? "medium" : "low",
    auditReason: reason,
    decisionAtMs: now,
  };
}
