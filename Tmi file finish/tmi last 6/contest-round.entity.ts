/**
 * contest-round.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-round.entity.ts
 */
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
