/**
 * BattleEligibilityEngine
 * Checks points, anti-abuse, cooldown, self-challenge lock, and direct challenge tier privileges.
 */

import { BattleTier, battleFormatRulesEngine } from "@/lib/competition/BattleFormatRulesEngine";
import { battleChallengeEconomyEngine } from "@/lib/competition/BattleChallengeEconomyEngine";

export interface BattleActor {
  userId: string;
  displayName: string;
  tier: BattleTier;
  role: "artist" | "performer" | "host" | "fan";
  ageVerified?: boolean;
  safetyHold?: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

const DECLINE_COOLDOWN_MS = 15 * 60 * 1000;
const REPEAT_CHALLENGE_WINDOW_MS = 2 * 60 * 60 * 1000;

export class BattleEligibilityEngine {
  private declinedUntil: Map<string, number> = new Map();
  private recentMatchups: Map<string, number[]> = new Map();

  canDirectChallenge(tier: BattleTier): boolean {
    return battleFormatRulesEngine.isDirectChallengeTier(tier);
  }

  checkActorEligibility(actor: BattleActor): EligibilityResult {
    if (actor.safetyHold) return { eligible: false, reason: "safety-hold" };
    if (actor.role !== "artist" && actor.role !== "performer") return { eligible: false, reason: "role-not-eligible" };
    if (actor.ageVerified === false) return { eligible: false, reason: "age-verification-required" };
    if (!battleChallengeEconomyEngine.canSpendChallengeEntry(actor.userId)) {
      return { eligible: false, reason: "insufficient-earned-points" };
    }
    return { eligible: true };
  }

  checkChallengeEligibility(challenger: BattleActor, target: BattleActor): EligibilityResult {
    if (challenger.userId === target.userId) return { eligible: false, reason: "self-challenge-forbidden" };

    const challengerEligibility = this.checkActorEligibility(challenger);
    if (!challengerEligibility.eligible) return challengerEligibility;

    if (target.safetyHold) return { eligible: false, reason: "target-safety-hold" };

    const pairKey = `${challenger.userId}:${target.userId}`;
    const now = Date.now();
    const declinedLock = this.declinedUntil.get(pairKey) ?? 0;
    if (declinedLock > now) return { eligible: false, reason: "cooldown-after-decline" };

    const timestamps = (this.recentMatchups.get(pairKey) ?? []).filter((ts) => now - ts <= REPEAT_CHALLENGE_WINDOW_MS);
    if (timestamps.length >= 3) return { eligible: false, reason: "repeat-matchup-blocked" };

    return { eligible: true };
  }

  markDeclined(challengerId: string, targetId: string): void {
    const key = `${challengerId}:${targetId}`;
    this.declinedUntil.set(key, Date.now() + DECLINE_COOLDOWN_MS);
  }

  markCompletedMatch(challengerId: string, targetId: string): void {
    const key = `${challengerId}:${targetId}`;
    const next = [...(this.recentMatchups.get(key) ?? []), Date.now()];
    this.recentMatchups.set(key, next);
  }
}

export const battleEligibilityEngine = new BattleEligibilityEngine();
