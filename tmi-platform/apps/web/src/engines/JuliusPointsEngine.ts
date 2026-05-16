/**
 * Julius Points Engine
 * Participation-first scoring pipeline that calculates XP, reward points,
 * bonus points, and season points from registry actions.
 */

import {
  getJuliusPointRule,
  type JuliusPointAction,
  type JuliusPointsWeight,
} from './JuliusPointsRegistry';

export interface JuliusPointsLedger {
  userId: string;
  totalXp: number;
  rewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
  level: number;
  lastAwardedAt?: string;
  actionTotals: Partial<Record<JuliusPointAction, number>>;
}

export interface JuliusAwardContext {
  quantity?: number;
  consecutiveAttendanceDays?: number;
  firstActionInSession?: boolean;
  isWeekendEvent?: boolean;
}

export interface JuliusAwardBreakdown {
  action: JuliusPointAction;
  base: JuliusPointsWeight;
  quantity: number;
  streakMultiplier: number;
  sessionMultiplier: number;
  weekendMultiplier: number;
  awarded: JuliusPointsWeight;
}

export interface JuliusAwardResult {
  ledger: JuliusPointsLedger;
  breakdown: JuliusAwardBreakdown;
}

export class JuliusPointsEngine {
  getDefaultLedger(userId: string): JuliusPointsLedger {
    return {
      userId,
      totalXp: 0,
      rewardPoints: 0,
      bonusPoints: 0,
      seasonPoints: 0,
      level: 1,
      actionTotals: {},
    };
  }

  calculateAward(action: JuliusPointAction, context: JuliusAwardContext = {}): JuliusAwardBreakdown {
    const rule = getJuliusPointRule(action);
    const quantity = Math.max(1, context.quantity ?? 1);
    const streakMultiplier = this.getStreakMultiplier(context.consecutiveAttendanceDays ?? 0);
    const sessionMultiplier = context.firstActionInSession ? 1.1 : 1;
    const weekendMultiplier = context.isWeekendEvent ? 1.05 : 1;
    const factor = streakMultiplier * sessionMultiplier * weekendMultiplier;

    return {
      action,
      base: rule.weight,
      quantity,
      streakMultiplier,
      sessionMultiplier,
      weekendMultiplier,
      awarded: {
        xp: Math.floor(rule.weight.xp * quantity * factor),
        rewardPoints: Math.floor(rule.weight.rewardPoints * quantity * factor),
        bonusPoints: Math.floor(rule.weight.bonusPoints * quantity * factor),
        seasonPoints: Math.floor(rule.weight.seasonPoints * quantity * factor),
      },
    };
  }

  awardAction(
    ledger: JuliusPointsLedger,
    action: JuliusPointAction,
    context: JuliusAwardContext = {},
  ): JuliusAwardResult {
    const breakdown = this.calculateAward(action, context);
    const updatedXp = ledger.totalXp + breakdown.awarded.xp;

    const nextLedger: JuliusPointsLedger = {
      ...ledger,
      totalXp: updatedXp,
      rewardPoints: ledger.rewardPoints + breakdown.awarded.rewardPoints,
      bonusPoints: ledger.bonusPoints + breakdown.awarded.bonusPoints,
      seasonPoints: ledger.seasonPoints + breakdown.awarded.seasonPoints,
      level: this.getLevelFromXp(updatedXp),
      lastAwardedAt: new Date().toISOString(),
      actionTotals: {
        ...ledger.actionTotals,
        [action]: (ledger.actionTotals[action] ?? 0) + breakdown.quantity,
      },
    };

    return {
      ledger: nextLedger,
      breakdown,
    };
  }

  getLevelFromXp(totalXp: number): number {
    if (totalXp <= 0) return 1;
    return Math.max(1, Math.floor(Math.sqrt(totalXp / 100)) + 1);
  }

  getProgressToNextLevel(totalXp: number): { level: number; nextLevel: number; progress: number } {
    const level = this.getLevelFromXp(totalXp);
    const levelStartXp = (level - 1) * (level - 1) * 100;
    const nextLevel = level + 1;
    const nextLevelXp = (nextLevel - 1) * (nextLevel - 1) * 100;
    const span = Math.max(1, nextLevelXp - levelStartXp);
    const progress = Math.min(100, Math.floor(((totalXp - levelStartXp) / span) * 100));

    return { level, nextLevel, progress };
  }

  private getStreakMultiplier(consecutiveAttendanceDays: number): number {
    if (consecutiveAttendanceDays >= 30) return 1.4;
    if (consecutiveAttendanceDays >= 14) return 1.25;
    if (consecutiveAttendanceDays >= 7) return 1.15;
    if (consecutiveAttendanceDays >= 3) return 1.08;
    return 1;
  }
}

export const juliusPointsEngine = new JuliusPointsEngine();

export function useJuliusPointsEngine(): JuliusPointsEngine {
  return juliusPointsEngine;
}
