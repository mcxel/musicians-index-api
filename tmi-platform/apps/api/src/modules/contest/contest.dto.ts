/**
 * contest.dto.ts
 * TMI Grand Platform Contest — Data Transfer Objects
 * BerntoutGlobal XXL
 *
 * Repo path: apps/api/src/modules/contest/contest.dto.ts
 */

// ─── Season DTOs ─────────────────────────────────────────────────────────────

export class CreateSeasonDto {
  name: string; // e.g. "Grand Platform Contest — Season 1"
  seasonStartDate: Date; // must be set by admin (Aug 8)
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
}

// ─── Entry DTOs ───────────────────────────────────────────────────────────────

export class CreateContestEntryDto {
  artistId: string;
  category: ContestCategory;
  seasonId?: string; // auto-resolves to active season if omitted
  stageName?: string;
  performanceDescription?: string;
}

export type ContestCategory =
  | 'singers'
  | 'rappers'
  | 'comedians'
  | 'dancers'
  | 'djs'
  | 'bands'
  | 'beatmakers'
  | 'magicians'
  | 'influencers'
  | 'freestyle'
  | 'other';

export class UpdateEntryStatusDto {
  status: 'pending' | 'qualified' | 'regional' | 'semi_finals' | 'finals' | 'winner' | 'eliminated' | 'disqualified';
  adminNote?: string;
}

// ─── Sponsor DTOs ─────────────────────────────────────────────────────────────

export class InviteSponsorDto {
  sponsorId: string;
  packageId: string; // 'local-bronze' | 'local-silver' | 'local-gold' | 'major-bronze' | 'major-silver' | 'major-gold' | 'title'
  message?: string;
}

export class AdminApprovalDto {
  approved: boolean;
  note?: string;
}

// ─── Vote DTOs ────────────────────────────────────────────────────────────────

export class CastVoteDto {
  entryId: string;
  roundId: string;
  voterId?: string; // set from auth token in controller
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ContestEntryResponse {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar?: string;
  category: ContestCategory;
  status: string;
  localSponsors: number;
  majorSponsors: number;
  totalSponsors: number;
  isQualified: boolean;
  votes: number;
  seasonId: string;
  createdAt: Date;
}

export interface SponsorProgressResponse {
  entryId: string;
  localSponsors: number;
  majorSponsors: number;
  totalSponsors: number;
  localRequired: number;
  majorRequired: number;
  totalRequired: number;
  isQualified: boolean;
  percentComplete: number;
  sponsors: SponsorContributionResponse[];
}

export interface SponsorContributionResponse {
  id: string;
  sponsorId: string;
  sponsorName: string;
  sponsorLogo?: string;
  packageId: string;
  packageLabel: string;
  packageType: 'local' | 'major';
  amount: number;
  status: 'invited' | 'pending_payment' | 'verified' | 'rejected';
  createdAt: Date;
}
