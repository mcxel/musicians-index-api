/**
 * BattleQueueEngine
 * Mid-battle challenger queue with minute-8 lock and 15-point paid queue entry.
 */

import { CHALLENGE_ENTRY_FEE_POINTS, battleChallengeEconomyEngine } from "@/lib/competition/BattleChallengeEconomyEngine";
import { BattleActor, battleEligibilityEngine } from "@/lib/competition/BattleEligibilityEngine";
import { battleMatchLifecycleEngine } from "@/lib/competition/BattleMatchLifecycleEngine";

export interface BattleQueueEntry {
  queueEntryId: string;
  battleId: string;
  challenger: BattleActor;
  requestedAt: number;
  chargedPoints: number;
  challengerWins: number;
  challengerStreak: number;
  priorityScore: number;
}

export class BattleQueueEngine {
  private queueByBattle: Map<string, BattleQueueEntry[]> = new Map();

  enqueueMidBattleChallenge(input: {
    battleId: string;
    challenger: BattleActor;
    challengerWins: number;
    challengerStreak: number;
  }): { ok: boolean; entry?: BattleQueueEntry; reason?: string } {
    const match = battleMatchLifecycleEngine.getMatch(input.battleId);
    if (!match || match.status !== "live") {
      return { ok: false, reason: "battle-not-live" };
    }

    const elapsedSeconds = Math.max(0, match.windowSeconds - battleMatchLifecycleEngine.getRemainingSeconds(input.battleId));
    if (elapsedSeconds < 8 * 60) {
      return { ok: false, reason: "queue-opens-after-minute-8" };
    }

    const eligibility = battleEligibilityEngine.checkActorEligibility(input.challenger);
    if (!eligibility.eligible) {
      return { ok: false, reason: eligibility.reason ?? "challenger-not-eligible" };
    }

    const spent = battleChallengeEconomyEngine.spendPoints(input.challenger.userId, CHALLENGE_ENTRY_FEE_POINTS);
    if (!spent.ok) {
      return { ok: false, reason: spent.reason ?? "insufficient-earned-points" };
    }

    const priorityScore = this.computePriorityScore(
      input.challenger.tier,
      input.challengerWins,
      input.challengerStreak,
      Date.now(),
    );

    const entry: BattleQueueEntry = {
      queueEntryId: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      battleId: input.battleId,
      challenger: input.challenger,
      requestedAt: Date.now(),
      chargedPoints: CHALLENGE_ENTRY_FEE_POINTS,
      challengerWins: input.challengerWins,
      challengerStreak: input.challengerStreak,
      priorityScore,
    };

    const queue = this.queueByBattle.get(input.battleId) ?? [];
    queue.push(entry);
    queue.sort((a, b) => b.priorityScore - a.priorityScore);
    this.queueByBattle.set(input.battleId, queue);

    return { ok: true, entry };
  }

  popNextChallenger(battleId: string): BattleQueueEntry | null {
    const queue = this.queueByBattle.get(battleId) ?? [];
    if (queue.length === 0) return null;
    const next = queue.shift() ?? null;
    this.queueByBattle.set(battleId, queue);
    return next;
  }

  getQueue(battleId: string): BattleQueueEntry[] {
    return [...(this.queueByBattle.get(battleId) ?? [])];
  }

  private computePriorityScore(
    tier: BattleActor["tier"],
    wins: number,
    streak: number,
    requestedAt: number,
  ): number {
    const tierWeight = tier === "gold" ? 40 : tier === "platinum" ? 50 : tier === "diamond" ? 60 : 20;
    const streakWeight = Math.max(0, streak) * 4;
    const winWeight = Math.max(0, wins) * 2;
    const timeWeight = Math.floor(requestedAt / 1000) / 100000;
    return tierWeight + streakWeight + winWeight + timeWeight;
  }
}

export const battleQueueEngine = new BattleQueueEngine();
