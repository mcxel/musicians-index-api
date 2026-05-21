/**
 * contest-entry.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-entry.entity.ts
 * Action: CREATE | Wave: W5
 * Split from: tmi last 3 / all-entities.ts
 */
export class ContestEntryEntity {
  id: string;
  artistId: string;
  seasonId: string;
  category: string;
  stageName?: string;
  performanceDescription?: string;
  status: 'pending' | 'approved' | 'qualified' | 'competing' | 'eliminated' | 'winner' | 'rejected';
  localSponsorCount: number;
  majorSponsorCount: number;
  roundId?: string;
  totalVotes: number;
  rank?: number;
  createdAt: Date;
  updatedAt: Date;

  get totalSponsors(): number { return this.localSponsorCount + this.majorSponsorCount; }
  get isQualified(): boolean { return this.localSponsorCount >= 10 && this.majorSponsorCount >= 10; }
}
