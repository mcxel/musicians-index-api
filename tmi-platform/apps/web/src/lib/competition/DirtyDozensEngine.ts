/**
 * DirtyDozensEngine
 * Turn-based round manager with timer, audience scoring, foul detection, and escalation guardrails.
 */

export type DirtyDozensStatus = "queued" | "live" | "completed";

export interface DirtyDozensRound {
  roundId: string;
  battleId: string;
  performerA: string;
  performerB: string;
  activeTurn: "a" | "b";
  turnEndsAt: number;
  audienceScoreA: number;
  audienceScoreB: number;
  foulCountA: number;
  foulCountB: number;
  escalationLevel: 0 | 1 | 2 | 3;
  status: DirtyDozensStatus;
}

const TURN_SECONDS = 45;

export class DirtyDozensEngine {
  private rounds: Map<string, DirtyDozensRound> = new Map();

  startRound(battleId: string, performerA: string, performerB: string): DirtyDozensRound {
    const now = Date.now();
    const round: DirtyDozensRound = {
      roundId: `dd-${now}-${Math.random().toString(36).slice(2, 8)}`,
      battleId,
      performerA,
      performerB,
      activeTurn: "a",
      turnEndsAt: now + TURN_SECONDS * 1000,
      audienceScoreA: 0,
      audienceScoreB: 0,
      foulCountA: 0,
      foulCountB: 0,
      escalationLevel: 0,
      status: "live",
    };
    this.rounds.set(round.roundId, round);
    return round;
  }

  submitAudienceScore(roundId: string, side: "a" | "b", score: number): DirtyDozensRound | null {
    const round = this.rounds.get(roundId);
    if (!round || round.status !== "live") return null;
    const next = Math.max(0, Math.floor(score));
    if (side === "a") round.audienceScoreA += next;
    else round.audienceScoreB += next;
    return round;
  }

  submitLineForModeration(roundId: string, side: "a" | "b", line: string): DirtyDozensRound | null {
    const round = this.rounds.get(roundId);
    if (!round || round.status !== "live") return null;

    const foul = this.detectFoul(line);
    if (foul) {
      if (side === "a") round.foulCountA += 1;
      else round.foulCountB += 1;
      round.escalationLevel = this.computeEscalation(round.foulCountA + round.foulCountB);
    }

    return round;
  }

  advanceTurn(roundId: string): DirtyDozensRound | null {
    const round = this.rounds.get(roundId);
    if (!round || round.status !== "live") return null;
    round.activeTurn = round.activeTurn === "a" ? "b" : "a";
    round.turnEndsAt = Date.now() + TURN_SECONDS * 1000;
    return round;
  }

  completeRound(roundId: string): DirtyDozensRound | null {
    const round = this.rounds.get(roundId);
    if (!round) return null;
    round.status = "completed";
    return round;
  }

  getWinner(roundId: string): "a" | "b" | "draw" | null {
    const round = this.rounds.get(roundId);
    if (!round || round.status !== "completed") return null;

    const scoreA = round.audienceScoreA - round.foulCountA * 5;
    const scoreB = round.audienceScoreB - round.foulCountB * 5;

    if (scoreA === scoreB) return "draw";
    return scoreA > scoreB ? "a" : "b";
  }

  getRound(roundId: string): DirtyDozensRound | null {
    return this.rounds.get(roundId) ?? null;
  }

  private detectFoul(line: string): boolean {
    const normalized = line.toLowerCase();
    const bannedFragments = ["slur", "hate", "dox", "threat"];
    return bannedFragments.some((fragment) => normalized.includes(fragment));
  }

  private computeEscalation(totalFouls: number): 0 | 1 | 2 | 3 {
    if (totalFouls >= 6) return 3;
    if (totalFouls >= 4) return 2;
    if (totalFouls >= 2) return 1;
    return 0;
  }
}

export const dirtyDozensEngine = new DirtyDozensEngine();
