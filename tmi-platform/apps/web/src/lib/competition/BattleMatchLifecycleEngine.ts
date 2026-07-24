/**
 * BattleMatchLifecycleEngine
 * 18-minute lifecycle for battle/game windows.
 */

import { BattleFormatType } from "@/lib/competition/BattleFormatRulesEngine";
import { competitionIntegrityEngine, type CompetitorRatings } from "@/lib/competition/CompetitionIntegrityEngine";
import { matchHistoryEngine, type MatchHistoryRecord } from "@/lib/competition/MatchHistoryEngine";

export const UNIVERSAL_BATTLE_WINDOW_SECONDS = 18 * 60;

export type BattleLifecycleStatus =
  | "queued"
  | "countdown"
  | "open"
  | "live"
  | "completed"
  | "rewarded"
  | "archived";

export interface BattleMatchLifecycle {
  battleId: string;
  format: BattleFormatType;
  typeLabel: string;
  status: BattleLifecycleStatus;
  createdAt: number;
  windowSeconds: number;
  endsAt: number;
  leaderboardLocked: boolean;
  winnerId?: string;
}

export class BattleMatchLifecycleEngine {
  private matches: Map<string, BattleMatchLifecycle> = new Map();

  createMatch(battleId: string, format: BattleFormatType, typeLabel: string): BattleMatchLifecycle {
    const now = Date.now();
    const match: BattleMatchLifecycle = {
      battleId,
      format,
      typeLabel,
      status: "queued",
      createdAt: now,
      windowSeconds: UNIVERSAL_BATTLE_WINDOW_SECONDS,
      endsAt: now + UNIVERSAL_BATTLE_WINDOW_SECONDS * 1000,
      leaderboardLocked: false,
    };
    this.matches.set(battleId, match);
    return match;
  }

  getMatch(battleId: string): BattleMatchLifecycle | null {
    return this.matches.get(battleId) ?? null;
  }

  setStatus(battleId: string, status: BattleLifecycleStatus): BattleMatchLifecycle | null {
    const match = this.matches.get(battleId);
    if (!match) return null;
    match.status = status;
    return match;
  }

  advanceStatus(battleId: string): BattleMatchLifecycle | null {
    const match = this.matches.get(battleId);
    if (!match) return null;

    const transitions: Record<BattleLifecycleStatus, BattleLifecycleStatus> = {
      queued: "countdown",
      countdown: "open",
      open: "live",
      live: "completed",
      completed: "rewarded",
      rewarded: "archived",
      archived: "archived",
    };

    match.status = transitions[match.status];
    if (match.status === "completed") {
      match.leaderboardLocked = true;
    }
    return match;
  }

  markCompleted(battleId: string, winnerId: string): BattleMatchLifecycle | null {
    const match = this.matches.get(battleId);
    if (!match) return null;
    match.status = "completed";
    match.winnerId = winnerId;
    match.leaderboardLocked = true;
    return match;
  }

  getRemainingSeconds(battleId: string): number {
    const match = this.matches.get(battleId);
    if (!match) return 0;
    return Math.max(0, Math.floor((match.endsAt - Date.now()) / 1000));
  }

  /**
   * Finalizes the match (marks completed + locks leaderboard) AND persists CIS rating
   * updates for both participants via CompetitionIntegrityEngine.
   *
   * Use this instead of markCompleted() whenever both participant IDs are known.
   * Records: Elo outcome, successful completion for winner and loser, immutable MatchHistory row.
   *
   * @param opts.venueType  e.g. "battle" | "cypher" | "challenge" — defaults to "battle"
   * @param opts.competitionType  e.g. "BATTLE" | "CYPHER" | "DANCE_OFF" — defaults to "BATTLE"
   */
  async finalizeWithIntegrity(
    battleId: string,
    winnerId: string,
    loserId: string,
    opts?: { venueType?: string; competitionType?: string }
  ): Promise<{
    match: BattleMatchLifecycle | null;
    winnerRatings: CompetitorRatings;
    loserRatings: CompetitorRatings;
    historyRecord: MatchHistoryRecord;
  }> {
    const match = this.markCompleted(battleId, winnerId);

    // Capture pre-match ratings so the delta can be persisted
    const [priorWinner, priorLoser] = await Promise.all([
      competitionIntegrityEngine.fetchRatings(winnerId),
      competitionIntegrityEngine.fetchRatings(loserId),
    ]);

    // Elo update: winner score=1, loser score=0 (inserts unified MatchHistory record with idempotency key)
    const { challenger: winnerRatings, opponent: loserRatings, historyRecord } =
      await competitionIntegrityEngine.recordMatchOutcome(winnerId, loserId, 1, {
        venueType: opts?.venueType ?? "battle",
        venueId: battleId,
        competitionType: opts?.competitionType ?? "BATTLE",
        matchId: battleId, // Ensures exact 1:1 finalization mapping on duplicate retries
      });

    // Attendance credit for both — restores CIR/AR gradually
    await Promise.all([
      competitionIntegrityEngine.recordSuccessfulCompletion(winnerId),
      competitionIntegrityEngine.recordSuccessfulCompletion(loserId),
    ]);

    return { match, winnerRatings, loserRatings, historyRecord };
  }
}

export const battleMatchLifecycleEngine = new BattleMatchLifecycleEngine();
