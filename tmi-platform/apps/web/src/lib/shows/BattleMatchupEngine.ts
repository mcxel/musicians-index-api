/**
 * BattleMatchupEngine
 * Head-to-head battle logic — rounds, scoring, advancement, result tracking.
 */

export type BattleStatus =
  | "scheduled"
  | "live"
  | "round_break"
  | "completed"
  | "cancelled"
  | "tied";

export type BattleRound = {
  roundNumber: number;
  startedAtMs: number | null;
  endedAtMs: number | null;
  contestant1Score: number;
  contestant2Score: number;
  crowdFavorId: string | null;
  judgePickId: string | null;
};

export type BattleMatchup = {
  battleId: string;
  contestant1Id: string;
  contestant1Name: string;
  contestant2Id: string;
  contestant2Name: string;
  totalRounds: number;
  completedRounds: BattleRound[];
  currentRound: number;
  status: BattleStatus;
  winnerId: string | null;
  winnerName: string | null;
  createdAtMs: number;
  startedAtMs: number | null;
  endedAtMs: number | null;
};

let _battleSeq = 0;

export class BattleMatchupEngine {
  private readonly battles: Map<string, BattleMatchup> = new Map();

  createBattle(
    contestant1Id: string,
    contestant1Name: string,
    contestant2Id: string,
    contestant2Name: string,
    totalRounds: number = 3,
  ): BattleMatchup {
    const battleId = `battle-${Date.now()}-${++_battleSeq}`;
    const battle: BattleMatchup = {
      battleId,
      contestant1Id,
      contestant1Name,
      contestant2Id,
      contestant2Name,
      totalRounds,
      completedRounds: [],
      currentRound: 1,
      status: "scheduled",
      winnerId: null,
      winnerName: null,
      createdAtMs: Date.now(),
      startedAtMs: null,
      endedAtMs: null,
    };
    this.battles.set(battleId, battle);
    return battle;
  }

  startBattle(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== "scheduled") return;
    battle.status = "live";
    battle.startedAtMs = Date.now();
  }

  submitRoundScores(
    battleId: string,
    contestant1Score: number,
    contestant2Score: number,
    crowdFavorId: string | null,
    judgePickId: string | null,
  ): void {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== "live") return;

    const round: BattleRound = {
      roundNumber: battle.currentRound,
      startedAtMs: battle.startedAtMs,
      endedAtMs: Date.now(),
      contestant1Score,
      contestant2Score,
      crowdFavorId,
      judgePickId,
    };

    battle.completedRounds.push(round);

    if (battle.currentRound >= battle.totalRounds) {
      this.finalize(battleId);
    } else {
      battle.currentRound += 1;
      battle.status = "round_break";
    }
  }

  resumeNextRound(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== "round_break") return;
    battle.status = "live";
  }

  private finalize(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle) return;

    let c1Total = 0;
    let c2Total = 0;

    for (const round of battle.completedRounds) {
      c1Total += round.contestant1Score;
      c2Total += round.contestant2Score;
    }

    if (c1Total > c2Total) {
      battle.winnerId = battle.contestant1Id;
      battle.winnerName = battle.contestant1Name;
      battle.status = "completed";
    } else if (c2Total > c1Total) {
      battle.winnerId = battle.contestant2Id;
      battle.winnerName = battle.contestant2Name;
      battle.status = "completed";
    } else {
      battle.status = "tied";
    }

    battle.endedAtMs = Date.now();
  }

  getScoreSummary(battleId: string): { c1Total: number; c2Total: number } | null {
    const battle = this.battles.get(battleId);
    if (!battle) return null;
    let c1Total = 0;
    let c2Total = 0;
    for (const round of battle.completedRounds) {
      c1Total += round.contestant1Score;
      c2Total += round.contestant2Score;
    }
    return { c1Total, c2Total };
  }

  getBattle(battleId: string): BattleMatchup | null {
    return this.battles.get(battleId) ?? null;
  }

  getLiveBattles(): BattleMatchup[] {
    return [...this.battles.values()].filter((b) => b.status === "live");
  }

  getCompletedBattles(): BattleMatchup[] {
    return [...this.battles.values()].filter((b) => b.status === "completed");
  }
}

export const battleMatchupEngine = new BattleMatchupEngine();
