/**
 * contest-prize.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-prize.entity.ts
 * Action: CREATE | Wave: W5
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
  fulfilled: boolean;
  fulfilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
