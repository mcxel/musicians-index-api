/**
 * contest-entry.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-entry.entity.ts
 * Action: CREATE | Wave: W5
 * Source: Split from Drop 2 ContestEntities.ts
 */
export class ContestEntryEntity {
  id: string;
  artistId: string;
  seasonId: string;
  category: string;
  stageName?: string;
  performanceDescription?: string;
  status: string;
  localSponsorCount: number;
  majorSponsorCount: number;
  roundId?: string;
  createdAt: Date;
  updatedAt: Date;

  get totalSponsors(): number { return this.localSponsorCount + this.majorSponsorCount; }
  get isQualified(): boolean { return this.localSponsorCount >= 10 && this.majorSponsorCount >= 10; }
}

// ────────────────────────────────────────────────────────────────────────────
// FILE: apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts
// ────────────────────────────────────────────────────────────────────────────
export class SponsorContributionEntity {
  id: string;
  entryId: string;
  sponsorId: string;
  packageId: string;
  packageLabel: string;
  packageType: 'local' | 'major';
  amount: number;
  message?: string;
  adminNote?: string;
  status: 'invited' | 'pending_payment' | 'payment_received' | 'verified' | 'rejected';
  paymentReference?: string;
  paymentVerifiedAt?: Date;
  verifiedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// FILE: apps/api/src/modules/contest/entities/contest-round.entity.ts
// ────────────────────────────────────────────────────────────────────────────
export class ContestRoundEntity {
  id: string;
  seasonId: string;
  name: string;
  roundType: 'qualification' | 'regional' | 'semi_finals' | 'finals';
  order: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'voting' | 'completed';
  category?: string;
  createdAt: Date;
  updatedAt: Date;

  get isActive(): boolean { return this.status === 'active' || this.status === 'voting'; }
  get votingOpen(): boolean { return this.status === 'voting'; }
}

// ────────────────────────────────────────────────────────────────────────────
// FILE: apps/api/src/modules/contest/entities/contest-vote.entity.ts
// ────────────────────────────────────────────────────────────────────────────
export class ContestVoteEntity {
  id: string;
  entryId: string;
  roundId: string;
  voterId: string;
  weight: number;
  createdAt: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// FILE: apps/api/src/modules/contest/entities/contest-prize.entity.ts
// ────────────────────────────────────────────────────────────────────────────
export class ContestPrizeEntity {
  id: string;
  seasonId: string;
  name: string;
  description?: string;
  prizeType: 'cash' | 'deal' | 'equipment' | 'tour' | 'recording' | 'brand_partnership';
  cashValue?: number;
  otherValue?: string;
  placement: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// FILE: apps/api/src/modules/contest/entities/contest-season.entity.ts
// ────────────────────────────────────────────────────────────────────────────
export class ContestSeasonEntity {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  registrationStartDate: Date;
  registrationEndDate: Date;
  sponsorCollectionEndDate: Date;
  regionalsStartDate: Date;
  regionalsEndDate: Date;
  semiFinalsStartDate: Date;
  semiFinalsEndDate: Date;
  finalsDate: Date;
  prizePool?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  /**
   * HARD RULE: Registration must open August 8 every year.
   * Marcel's birthday. Non-negotiable.
   */
  static validateSeasonDates(registrationStartDate: Date): boolean {
    return registrationStartDate.getMonth() === 7 && registrationStartDate.getDate() === 8;
  }
}
