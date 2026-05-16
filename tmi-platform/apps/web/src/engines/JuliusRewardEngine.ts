/**
 * Julius Reward Engine
 * Converts points-state into reward lanes, redemption checks, and retention tiers.
 */

import type { JuliusPointsLedger } from './JuliusPointsEngine';

export type JuliusRewardType =
  | 'vault_drop'
  | 'store_discount'
  | 'ticket_credit'
  | 'beat_unlock'
  | 'nft_allowlist'
  | 'season_boost';

export interface JuliusRewardLane {
  id: string;
  type: JuliusRewardType;
  title: string;
  costRewardPoints: number;
  costBonusPoints: number;
  requiredLevel: number;
}

export interface JuliusRedemptionResult {
  success: boolean;
  reason?: string;
  ledger: JuliusPointsLedger;
}

export interface JuliusRetentionSnapshot {
  tier: 'rookie' | 'active' | 'committed' | 'legend';
  replayPriority: number;
  retentionScore: number;
}

export const JULIUS_REWARD_LANES: JuliusRewardLane[] = [
  {
    id: 'vault-supply-drop',
    type: 'vault_drop',
    title: 'Vault Supply Drop',
    costRewardPoints: 120,
    costBonusPoints: 20,
    requiredLevel: 3,
  },
  {
    id: 'store-discount-10',
    type: 'store_discount',
    title: 'Store Discount 10%',
    costRewardPoints: 180,
    costBonusPoints: 30,
    requiredLevel: 5,
  },
  {
    id: 'ticket-credit-pass',
    type: 'ticket_credit',
    title: 'Ticket Credit Pass',
    costRewardPoints: 260,
    costBonusPoints: 40,
    requiredLevel: 6,
  },
  {
    id: 'beat-unlock-pack',
    type: 'beat_unlock',
    title: 'Beat Unlock Pack',
    costRewardPoints: 320,
    costBonusPoints: 60,
    requiredLevel: 8,
  },
  {
    id: 'nft-allowlist-slot',
    type: 'nft_allowlist',
    title: 'NFT Allowlist Slot',
    costRewardPoints: 420,
    costBonusPoints: 80,
    requiredLevel: 10,
  },
  {
    id: 'season-boost-kit',
    type: 'season_boost',
    title: 'Season Boost Kit',
    costRewardPoints: 520,
    costBonusPoints: 100,
    requiredLevel: 12,
  },
];

export class JuliusRewardEngine {
  getAvailableLanes(ledger: JuliusPointsLedger): JuliusRewardLane[] {
    return JULIUS_REWARD_LANES.filter((lane) => lane.requiredLevel <= ledger.level);
  }

  canRedeem(ledger: JuliusPointsLedger, lane: JuliusRewardLane): { allowed: boolean; reason?: string } {
    if (ledger.level < lane.requiredLevel) {
      return { allowed: false, reason: `Level ${lane.requiredLevel} required` };
    }
    if (ledger.rewardPoints < lane.costRewardPoints) {
      return { allowed: false, reason: `Need ${lane.costRewardPoints} reward points` };
    }
    if (ledger.bonusPoints < lane.costBonusPoints) {
      return { allowed: false, reason: `Need ${lane.costBonusPoints} bonus points` };
    }
    return { allowed: true };
  }

  redeem(ledger: JuliusPointsLedger, laneId: string): JuliusRedemptionResult {
    const lane = JULIUS_REWARD_LANES.find((entry) => entry.id === laneId);
    if (!lane) {
      return { success: false, reason: 'Reward lane not found', ledger };
    }

    const validation = this.canRedeem(ledger, lane);
    if (!validation.allowed) {
      return { success: false, reason: validation.reason, ledger };
    }

    return {
      success: true,
      ledger: {
        ...ledger,
        rewardPoints: ledger.rewardPoints - lane.costRewardPoints,
        bonusPoints: ledger.bonusPoints - lane.costBonusPoints,
      },
    };
  }

  getRetentionSnapshot(ledger: JuliusPointsLedger, consecutiveAttendanceDays: number): JuliusRetentionSnapshot {
    const retentionScore =
      ledger.seasonPoints +
      Math.floor(ledger.rewardPoints / 2) +
      Math.floor(ledger.bonusPoints / 2) +
      consecutiveAttendanceDays * 8;

    if (retentionScore >= 1800) {
      return { tier: 'legend', replayPriority: 1.4, retentionScore };
    }
    if (retentionScore >= 900) {
      return { tier: 'committed', replayPriority: 1.25, retentionScore };
    }
    if (retentionScore >= 350) {
      return { tier: 'active', replayPriority: 1.1, retentionScore };
    }
    return { tier: 'rookie', replayPriority: 1, retentionScore };
  }
}

export const juliusRewardEngine = new JuliusRewardEngine();

export function useJuliusRewardEngine(): JuliusRewardEngine {
  return juliusRewardEngine;
}
