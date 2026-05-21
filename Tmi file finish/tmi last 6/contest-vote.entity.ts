/**
 * contest-vote.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-vote.entity.ts
 */
export class ContestVoteEntity {
  id: string;
  entryId: string;
  roundId: string;
  voterId: string;
  weight: number;
  createdAt: Date;
}

/**
 * contest-prize.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-prize.entity.ts
 */
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

/**
 * contest-season.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-season.entity.ts
 *
 * HARD RULE: Registration must open August 8 every year. Marcel's birthday.
 */
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

  /** August 8 hard rule — enforced here and in contest.env.contract.ts */
  static validateRegistrationDate(date: Date): boolean {
    return date.getMonth() === 7 && date.getDate() === 8; // month is 0-indexed
  }
}
