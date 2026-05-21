/**
 * ContestEntities.ts — SPLIT INTO INDIVIDUAL FILES BEFORE COMMITTING
 *
 * Entity files for NestJS modules (these are TypeScript class wrappers,
 * NOT Prisma models — those are already in contest.schema.prisma).
 * These are thin wrappers used for NestJS dependency injection / typing.
 *
 *   contest-entry.entity.ts      → apps/api/src/modules/contest/entities/
 *   sponsor-contribution.entity.ts
 *   contest-round.entity.ts
 *   contest-vote.entity.ts
 *   contest-prize.entity.ts
 *   contest-season.entity.ts
 *   contest.env.contract.ts      → apps/api/src/modules/contest/
 *   contest.routes.ts            → apps/web/src/config/
 *   contest.permissions.ts       → apps/api/src/modules/contest/
 */

// ─── contest-entry.entity.ts ──────────────────────────────────────────────────
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

// ─── sponsor-contribution.entity.ts ──────────────────────────────────────────
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

// ─── contest-round.entity.ts ──────────────────────────────────────────────────
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

// ─── contest-vote.entity.ts ───────────────────────────────────────────────────
export class ContestVoteEntity {
  id: string;
  entryId: string;
  roundId: string;
  voterId: string;
  weight: number;
  createdAt: Date;
}

// ─── contest-prize.entity.ts ──────────────────────────────────────────────────
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

// ─── contest-season.entity.ts ─────────────────────────────────────────────────
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
   * BUSINESS RULE: Registration must open on August 8 every year.
   * This is Marcel's birthday and the official contest season start date.
   */
  static validateSeasonDates(registrationStartDate: Date): boolean {
    return registrationStartDate.getMonth() === 7 && registrationStartDate.getDate() === 8; // Month 7 = August
  }
}

// ════════════════════════════════════════════════════════════════════════════
// contest.env.contract.ts
// Repo: apps/api/src/modules/contest/contest.env.contract.ts
// Purpose: Validates all contest-related env vars at startup
// Wire: Call validateContestEnv() in contest.module.ts onModuleInit()
// ════════════════════════════════════════════════════════════════════════════

export function validateContestEnv(): void {
  const required = [
    'CONTEST_REGISTRATION_DAY',
    'CONTEST_REGISTRATION_MONTH',
    'CONTEST_MAX_LOCAL_SPONSORS',
    'CONTEST_MAX_MAJOR_SPONSORS',
  ];

  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`[ContestEnvContract] Missing required env vars: ${missing.join(', ')}`);
  }

  // Validate August 8 rule
  const day = parseInt(process.env.CONTEST_REGISTRATION_DAY!);
  const month = parseInt(process.env.CONTEST_REGISTRATION_MONTH!);
  if (day !== 8 || month !== 8) {
    throw new Error(`[ContestEnvContract] CONTEST_REGISTRATION_DAY must be 8 and CONTEST_REGISTRATION_MONTH must be 8 (August 8 — Marcel's birthday). Got: month=${month} day=${day}`);
  }

  const maxLocal = parseInt(process.env.CONTEST_MAX_LOCAL_SPONSORS!);
  const maxMajor = parseInt(process.env.CONTEST_MAX_MAJOR_SPONSORS!);
  if (maxLocal !== 10 || maxMajor !== 10) {
    throw new Error(`[ContestEnvContract] CONTEST_MAX_LOCAL_SPONSORS and CONTEST_MAX_MAJOR_SPONSORS must both be 10. Got: local=${maxLocal} major=${maxMajor}`);
  }
}

/**
 * Add to apps/api/.env:
 *
 * CONTEST_REGISTRATION_DAY=8
 * CONTEST_REGISTRATION_MONTH=8
 * CONTEST_MAX_LOCAL_SPONSORS=10
 * CONTEST_MAX_MAJOR_SPONSORS=10
 * CONTEST_SEASON_NAME="Grand Platform Contest — Season 1"
 */

// ════════════════════════════════════════════════════════════════════════════
// contest.routes.ts
// Repo: apps/web/src/config/contest.routes.ts
// Purpose: Single source of truth for all contest route strings
// Usage: import { CONTEST_ROUTES } from '@/config/contest.routes';
// ════════════════════════════════════════════════════════════════════════════

export const CONTEST_ROUTES = {
  home: '/contest',
  qualify: '/contest/qualify',
  rules: '/contest/rules',
  leaderboard: '/contest/leaderboard',
  host: '/contest/host',
  sponsors: '/contest/sponsors',
  season: (seasonId: string) => `/contest/season/${seasonId}`,
  seasonArchive: (seasonId: string) => `/contest/season/${seasonId}/archive`,
  admin: {
    root: '/contest/admin',
    contestants: '/contest/admin/contestants',
    sponsors: '/contest/admin/sponsors',
    payouts: '/contest/admin/payouts',
    seasons: '/contest/admin/seasons',
    audit: '/contest/admin/audit',
    host: '/contest/admin/host',
  },
} as const;

// ════════════════════════════════════════════════════════════════════════════
// contest.permissions.ts
// Repo: apps/api/src/modules/contest/contest.permissions.ts
// Purpose: Permission map for contest actions
// Usage: Check in guards/decorators before executing sensitive operations
// ════════════════════════════════════════════════════════════════════════════

export type ContestRole = 'admin' | 'host' | 'artist' | 'sponsor' | 'fan' | 'public';

export const CONTEST_PERMISSIONS: Record<string, ContestRole[]> = {
  // Public
  'contest:view': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],
  'contest:view_rules': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],
  'contest:view_leaderboard': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],
  'contest:view_season': ['public', 'fan', 'artist', 'sponsor', 'host', 'admin'],

  // Fan
  'contest:vote': ['fan', 'artist', 'sponsor', 'host', 'admin'],

  // Artist
  'contest:enter': ['artist', 'admin'],
  'contest:invite_sponsor': ['artist', 'admin'],
  'contest:view_own_entry': ['artist', 'admin'],

  // Sponsor
  'contest:sponsor_artist': ['sponsor', 'admin'],
  'contest:view_sponsor_analytics': ['sponsor', 'admin'],
  'contest:view_sponsor_leaderboard': ['sponsor', 'fan', 'artist', 'admin', 'public'],

  // Host
  'contest:trigger_host_cue': ['host', 'admin'],
  'contest:trigger_prize_reveal': ['host', 'admin'],
  'contest:trigger_winner_announce': ['host', 'admin'],

  // Admin only
  'contest:approve_sponsor': ['admin'],
  'contest:approve_entry': ['admin'],
  'contest:disqualify_entry': ['admin'],
  'contest:create_season': ['admin'],
  'contest:edit_season': ['admin'],
  'contest:view_audit': ['admin'],
  'contest:view_queues': ['admin'],
  'contest:manage_prizes': ['admin'],
};

export function hasContestPermission(action: string, role: ContestRole): boolean {
  return CONTEST_PERMISSIONS[action]?.includes(role) ?? false;
}
