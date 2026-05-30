// lib/commerce/SponsorshipCapacityEngine.ts
// Governs how many sponsor slots each performer tier receives.
//
// Philosophy: every tier gives the same count for local and major slots.
// This keeps the upgrade message simple: "More slots = more revenue potential."
//
// Contest qualification: 20 total sponsors (any combination of local + major).

export type PerformerTier =
  | 'free'
  | 'ruby'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'diamond-band';

export type SponsorType = 'local' | 'major';

export interface SponsorSlot {
  type: SponsorType;
  sponsorId: string | null;
  sponsorName?: string;
  since?: string; // ISO date
}

export interface TierCapacity {
  local: number;
  major: number;
  total: number;
}

// ── Slot counts per tier ──────────────────────────────────────────────────────
// Local  = small/regional business (restaurants, barbers, local venues, etc.)
// Major  = national/global brand  (Nike, Fender, Sony, Walmart, etc.)

export const TIER_CAPACITY: Record<PerformerTier, TierCapacity> = {
  free:           { local: 10,  major: 10,  total: 20  },
  ruby:           { local: 15,  major: 15,  total: 30  },
  silver:         { local: 20,  major: 20,  total: 40  },
  gold:           { local: 30,  major: 30,  total: 60  },
  platinum:       { local: 50,  major: 50,  total: 100 },
  diamond:        { local: 100, major: 100, total: 200 },
  'diamond-band': { local: 150, major: 150, total: 300 },
};

// ── Contest qualification threshold ──────────────────────────────────────────
// A performer needs 20 total sponsors (any mix) to enter yearly contests.
export const CONTEST_SPONSOR_THRESHOLD = 20;

// ── Engine ────────────────────────────────────────────────────────────────────

export class SponsorshipCapacityEngine {
  static getCapacity(tier: PerformerTier): TierCapacity {
    return TIER_CAPACITY[tier];
  }

  static countByType(slots: SponsorSlot[], type: SponsorType): number {
    return slots.filter((s) => s.type === type && s.sponsorId !== null).length;
  }

  static countTotal(slots: SponsorSlot[]): number {
    return slots.filter((s) => s.sponsorId !== null).length;
  }

  static canAddSponsor(slots: SponsorSlot[], tier: PerformerTier, type: SponsorType): boolean {
    const cap = TIER_CAPACITY[tier];
    return this.countByType(slots, type) < cap[type];
  }

  static isContestEligible(slots: SponsorSlot[]): boolean {
    return this.countTotal(slots) >= CONTEST_SPONSOR_THRESHOLD;
  }

  // Returns how many more sponsors are needed for contest eligibility
  static contestGap(slots: SponsorSlot[]): number {
    return Math.max(0, CONTEST_SPONSOR_THRESHOLD - this.countTotal(slots));
  }

  // Returns the next tier up, or null if already at max
  static nextTier(current: PerformerTier): PerformerTier | null {
    const order: PerformerTier[] = ['free', 'ruby', 'silver', 'gold', 'platinum', 'diamond'];
    const idx = order.indexOf(current);
    if (idx === -1 || idx >= order.length - 1) return null;
    return order[idx + 1];
  }

  // How many additional slots upgrading to the next tier unlocks
  static upgradeGain(
    current: PerformerTier,
  ): { tier: PerformerTier; additionalLocal: number; additionalMajor: number } | null {
    const next = this.nextTier(current);
    if (!next) return null;
    const cur = TIER_CAPACITY[current];
    const nxt = TIER_CAPACITY[next];
    return {
      tier: next,
      additionalLocal: nxt.local - cur.local,
      additionalMajor: nxt.major - cur.major,
    };
  }
}

// ── Pricing page display helper ───────────────────────────────────────────────
// Returns a concise label for the pricing cards, e.g. "10 Local + 10 Major Sponsor Slots"

export function sponsorSlotLabel(tier: PerformerTier): string {
  const { local, major } = TIER_CAPACITY[tier];
  return `${local} Local + ${major} Major Sponsor Slots`;
}
