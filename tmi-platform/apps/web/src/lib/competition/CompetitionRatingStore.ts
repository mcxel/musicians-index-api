/**
 * CompetitionRatingStore — real Postgres-backed Elo/CIR/RR/AR persistence.
 *
 * Restored 2026-08-10: this exact implementation (originally
 * CompetitionIntegrityEngine.ts, commits 50a01fa5/9569dbec/54a1786d) was
 * deleted wholesale by a1ae950d ("fix(build): resolve Vercel build syntax
 * and module import errors") while chasing an unrelated bug - `pg` (a real
 * Node-only dependency of the real Prisma client) was leaking into a client
 * bundle via BattleMatchLifecycleEngine importing this file directly. The
 * leak was real; deleting the persistence logic was an overcorrection.
 * BattleMatchLifecycleEngine no longer imports this module (its Elo-writing
 * responsibility moved server-side into
 * app/api/competition/match/route.ts's finalizeMatchWithIntegrity(), see
 * that file's own comment) - so this module is now safe to keep real,
 * PROVIDED it is only ever imported from server-only code: currently that's
 * EventOrchestrator.ts (itself only imported by 3 API routes) and
 * api/competition/{integrity,match}/route.ts directly.
 *
 * Do NOT import this file from any 'use client' component or from
 * CompetitionIntegrityEngine.ts's pure-function exports (those stay
 * client-safe on purpose, consumed by AiMusicChallengeIntegrity.ts, which
 * is reachable from a client component) - re-merging them is what caused
 * the original crash.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

export interface MatchOutcomeContext {
  venueType?: string;
  venueId?: string;
  competitionType?: string;
  matchId?: string;
}

export interface RecordedMatch {
  matchId: string;
  challenger: CompetitorRatings;
  opponent: CompetitorRatings;
  historyRecord?: any;
}

export interface CompetitorRatings {
  userId: string;
  skillRating: number;       // SR: Skill baseline (Elo, defaults to 1200)
  integrityRating: number;   // CIR: Reliability (range [0, 100], defaults to 100)
  reputationRating: number;  // RR: Community trust (range [0, 100], defaults to 90)
  activityRating: number;    // AR: Recent play rate (range [0, 100], defaults to 50)
  weeklyMatchesPlayed: number;
  consecutiveShowsCompleted: number;
  cooldownUntil: Date | null;
}

export interface TimeoutPenaltyResult {
  updatedRatings: CompetitorRatings;
  escalationTier: "none" | "warning" | "round-loss" | "forfeit" | "habitual";
  penaltyMessage: string;
  autoLoss: boolean;
}

export class CompetitionRatingStoreEngine {
  /**
   * Fetches ratings for a competitor from PostgreSQL, falling back to defaults if not present.
   */
  async fetchRatings(userId: string, db: DbClient = prisma): Promise<CompetitorRatings> {
    try {
      const record = await db.competitorRating.findUnique({
        where: { userId },
      });

      if (!record) {
        return {
          userId,
          skillRating: 1200,
          integrityRating: 100,
          reputationRating: 90,
          activityRating: 50,
          weeklyMatchesPlayed: 0,
          consecutiveShowsCompleted: 0,
          cooldownUntil: null,
        };
      }

      return {
        userId: record.userId,
        skillRating: record.skillRating,
        integrityRating: record.integrityRating,
        reputationRating: record.reputationRating,
        activityRating: record.activityRating,
        weeklyMatchesPlayed: record.weeklyMatchesPlayed,
        consecutiveShowsCompleted: record.consecutiveShowsCompleted,
        cooldownUntil: record.cooldownUntil,
      };
    } catch (error) {
      console.error(`Failed to fetch competitor ratings for ${userId}:`, error);
      // Fail-safe default
      return {
        userId,
        skillRating: 1200,
        integrityRating: 100,
        reputationRating: 90,
        activityRating: 50,
        weeklyMatchesPlayed: 0,
        consecutiveShowsCompleted: 0,
        cooldownUntil: null,
      };
    }
  }

  /**
   * Persists ratings changes to PostgreSQL.
   */
  async saveRatings(ratings: CompetitorRatings, db: DbClient = prisma): Promise<CompetitorRatings> {
    const record = await db.competitorRating.upsert({
      where: { userId: ratings.userId },
      update: {
        skillRating: ratings.skillRating,
        integrityRating: ratings.integrityRating,
        reputationRating: ratings.reputationRating,
        activityRating: ratings.activityRating,
        weeklyMatchesPlayed: ratings.weeklyMatchesPlayed,
        consecutiveShowsCompleted: ratings.consecutiveShowsCompleted,
        cooldownUntil: ratings.cooldownUntil,
      },
      create: {
        userId: ratings.userId,
        skillRating: ratings.skillRating,
        integrityRating: ratings.integrityRating,
        reputationRating: ratings.reputationRating,
        activityRating: ratings.activityRating,
        weeklyMatchesPlayed: ratings.weeklyMatchesPlayed,
        consecutiveShowsCompleted: ratings.consecutiveShowsCompleted,
        cooldownUntil: ratings.cooldownUntil,
      },
    });

    return {
      userId: record.userId,
      skillRating: record.skillRating,
      integrityRating: record.integrityRating,
      reputationRating: record.reputationRating,
      activityRating: record.activityRating,
      weeklyMatchesPlayed: record.weeklyMatchesPlayed,
      consecutiveShowsCompleted: record.consecutiveShowsCompleted,
      cooldownUntil: record.cooldownUntil,
    };
  }

  /**
   * Helper: Calculates updated Skill Rating (Elo) after a matchup
   * score: 1 = win, 0.5 = draw, 0 = loss
   */
  calculateSkillUpdate(
    challengerSR: number,
    opponentSR: number,
    score: number,
    kFactor = 32
  ): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentSR - challengerSR) / 400));
    const newSR = challengerSR + kFactor * (score - expectedScore);
    return Math.max(100, Math.round(newSR));
  }

  /**
   * Resolves Elo skill updates for a match between two users, saves them,
   * and writes an immutable MatchHistory record - all in one transaction,
   * so a match record can never exist without its rating update actually
   * having applied (or vice versa).
   */
  async recordMatchOutcome(
    challengerId: string,
    opponentId: string,
    challengerScore: number,
    context: MatchOutcomeContext = {}
  ): Promise<RecordedMatch> {
    const matchId = context.matchId;

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. If matchId is supplied, check for duplicate-write protection
        if (matchId) {
          const existing = await tx.matchHistory.findUnique({
            where: { matchId },
          });
          if (existing) {
            const challenger = await this.fetchRatings(challengerId, tx);
            const opponent = await this.fetchRatings(opponentId, tx);
            return {
              matchId: existing.matchId,
              challenger,
              opponent,
              historyRecord: existing,
            };
          }
        }

        const challengerBefore = await this.fetchRatings(challengerId, tx);
        const opponentBefore = await this.fetchRatings(opponentId, tx);

        const challenger = { ...challengerBefore };
        const opponent = { ...opponentBefore };

        challenger.skillRating = this.calculateSkillUpdate(challengerBefore.skillRating, opponentBefore.skillRating, challengerScore);
        opponent.skillRating = this.calculateSkillUpdate(opponentBefore.skillRating, challengerBefore.skillRating, 1 - challengerScore);

        const updatedChallenger = await this.saveRatings(challenger, tx);
        const updatedOpponent = await this.saveRatings(opponent, tx);

        const winnerId = challengerScore > 0.5 ? challengerId : challengerScore < 0.5 ? opponentId : null;
        const resultType = challengerScore === 0.5 ? "draw" : "decisive";

        const match = await tx.matchHistory.create({
          data: {
            matchId: matchId, // Bind client-provided unique idempotency key if present
            venueType: context.venueType ?? "unspecified",
            venueId: context.venueId ?? "unspecified",
            competitionType: context.competitionType ?? "unspecified",
            challengerId,
            opponentId,
            challengerScore,
            opponentScore: 1 - challengerScore,
            winnerId,
            resultType,
            ratingBeforeChallenger: challengerBefore.skillRating,
            ratingAfterChallenger: updatedChallenger.skillRating,
            ratingBeforeOpponent: opponentBefore.skillRating,
            ratingAfterOpponent: updatedOpponent.skillRating,
            integrityBeforeChallenger: challengerBefore.integrityRating,
            integrityAfterChallenger: updatedChallenger.integrityRating,
            integrityBeforeOpponent: opponentBefore.integrityRating,
            integrityAfterOpponent: updatedOpponent.integrityRating,
          },
        });

        return {
          matchId: match.matchId,
          challenger: updatedChallenger,
          opponent: updatedOpponent,
          historyRecord: match,
        };
      });
    } catch (error: any) {
      if (error?.code === "P2002" && matchId) {
        console.warn(`[CONCURRENCY WARN] Duplicate write conflict caught for matchId: ${matchId}. Resolving to existing record.`);
        const existing = await prisma.matchHistory.findUnique({
          where: { matchId },
        });
        if (existing) {
          const challenger = await this.fetchRatings(challengerId);
          const opponent = await this.fetchRatings(opponentId);
          return {
            matchId: existing.matchId,
            challenger,
            opponent,
            historyRecord: existing,
          };
        }
      }
      throw error;
    }
  }

  /**
   * Real win/loss/draw record + recent match log for a user, derived from
   * MatchHistory - what the performer profile's "Battle Record" reads
   * from instead of a hardcoded placeholder.
   */
  async getMatchRecord(userId: string, recentLimit = 10) {
    const matches = await prisma.matchHistory.findMany({
      where: { OR: [{ challengerId: userId }, { opponentId: userId }] },
      orderBy: { completedAt: "desc" },
    });

    let wins = 0;
    let losses = 0;
    let draws = 0;
    let currentStreak = 0;
    let streakType: "win" | "loss" | null = null;

    matches.forEach((m, i) => {
      const isChallenger = m.challengerId === userId;
      const won = m.winnerId === userId;
      const lost = m.winnerId !== null && m.winnerId !== userId;
      const drew = m.winnerId === null;

      if (won) wins++;
      else if (lost) losses++;
      else if (drew) draws++;

      if (i === 0) {
        streakType = won ? "win" : lost ? "loss" : null;
        if (streakType) currentStreak = 1;
      } else if (streakType && ((streakType === "win" && won) || (streakType === "loss" && lost))) {
        currentStreak++;
      }
      void isChallenger;
    });

    return {
      wins,
      losses,
      draws,
      winRate: wins + losses + draws > 0 ? wins / (wins + losses + draws) : 0,
      currentStreak,
      streakType,
      recentMatches: matches.slice(0, recentLimit).map((m) => ({
        matchId: m.matchId,
        opponentId: m.challengerId === userId ? m.opponentId : m.challengerId,
        result: m.winnerId === userId ? "win" : m.winnerId === null ? "draw" : "loss",
        venueType: m.venueType,
        competitionType: m.competitionType,
        completedAt: m.completedAt,
      })),
    };
  }

  /**
   * Evaluates disconnects/timeouts and calculates escalating penalties
   */
  async recordTimeout(
    userId: string,
    timeoutStreak: number,
    isPlatformIssue: boolean
  ): Promise<TimeoutPenaltyResult> {
    const currentRatings = await this.fetchRatings(userId);
    const updated = { ...currentRatings };

    // 1. Fair Technical Protection: No penalties for verified platform/server glitches
    if (isPlatformIssue) {
      return {
        updatedRatings: updated,
        escalationTier: "none",
        penaltyMessage: "Connection interrupted due to server maintenance. Disconnect forgiven.",
        autoLoss: false,
      };
    }

    const tier = timeoutStreak + 1;
    let escalationTier: TimeoutPenaltyResult["escalationTier"] = "warning";
    let penaltyMessage = "";
    let autoLoss = false;

    // Reset consecutive matches on disconnect
    updated.consecutiveShowsCompleted = 0;

    if (tier === 1) {
      // 1st Timeout: Warning & Minor Drops
      escalationTier = "warning";
      updated.integrityRating = Math.max(0, updated.integrityRating - 5);
      updated.skillRating = Math.max(100, updated.skillRating - 10);
      penaltyMessage = "Warning: First match disconnect. Minor Skill and Integrity Rating reduction applied.";
    } else if (tier === 2) {
      // 2nd Timeout: Larger drop & Auto-round loss
      escalationTier = "round-loss";
      updated.integrityRating = Math.max(0, updated.integrityRating - 15);
      updated.skillRating = Math.max(100, updated.skillRating - 25);
      autoLoss = true;
      penaltyMessage = "Second disconnect: Automatic round loss and increased reliability penalty.";
    } else if (tier === 3) {
      // 3rd Timeout: Event forfeit & Cooldown flag
      escalationTier = "forfeit";
      updated.integrityRating = Math.max(0, updated.integrityRating - 25);
      updated.skillRating = Math.max(100, updated.skillRating - 50);

      const cooldown = new Date();
      cooldown.setHours(cooldown.getHours() + 1); // 1 hour temporary ban
      updated.cooldownUntil = cooldown;

      penaltyMessage = "Third disconnect: Event forfeit, 1-hour entry cooldown, and high-tier ranking loss.";
    } else {
      // Habitual / Streak > 3: Matchmaking priority deprioritization
      escalationTier = "habitual";
      updated.integrityRating = Math.max(0, updated.integrityRating - 35);
      updated.skillRating = Math.max(100, updated.skillRating - 75);

      const longCooldown = new Date();
      longCooldown.setHours(longCooldown.getHours() + 24); // 24 hours ban
      updated.cooldownUntil = longCooldown;

      penaltyMessage = "Habitual disconnect behavior detected. Restricted to unranked events for 24 hours.";
    }

    // Decay reputation slightly for disconnecting on peers
    updated.reputationRating = Math.max(0, updated.reputationRating - 3);

    const saved = await this.saveRatings(updated);

    return {
      updatedRatings: saved,
      escalationTier,
      penaltyMessage,
      autoLoss,
    };
  }

  /**
   * Recovers rating parameters on clean match completions
   */
  async recordSuccessfulCompletion(userId: string): Promise<CompetitorRatings> {
    const currentRatings = await this.fetchRatings(userId);
    const updated = { ...currentRatings };

    updated.consecutiveShowsCompleted += 1;
    updated.weeklyMatchesPlayed += 1;

    // Gradually restore reliability score for consistent attendance (+3 per game up to 100 max)
    updated.integrityRating = Math.min(100, updated.integrityRating + 3);

    // Boost activity rating (+5 up to 100 max)
    updated.activityRating = Math.min(100, updated.activityRating + 5);

    // Reward consecutive streaks with reputation boost (+2 up to 100 max)
    if (updated.consecutiveShowsCompleted >= 5) {
      updated.reputationRating = Math.min(100, updated.reputationRating + 2);
    }

    return await this.saveRatings(updated);
  }

  /**
   * Matchmaking compatibility formula
   * Combines Skill (50%), Integrity (25%), Reputation (15%), and Activity (10%).
   * Lower distance value represents a better compatibility match.
   */
  getMatchmakingDistance(a: CompetitorRatings, b: CompetitorRatings): number {
    const dSR = Math.abs(a.skillRating - b.skillRating);
    const dCIR = Math.abs(a.integrityRating - b.integrityRating);
    const dRR = Math.abs(a.reputationRating - b.reputationRating);
    const dAR = Math.abs(a.activityRating - b.activityRating);

    // Normalize SR difference (assuming typical max delta range is ~400 points)
    const normalizedSR = (dSR / 400) * 100;

    return (
      0.50 * normalizedSR +
      0.25 * dCIR +
      0.15 * dRR +
      0.10 * dAR
    );
  }
}

export const competitionIntegrityEngine = new CompetitionRatingStoreEngine();
