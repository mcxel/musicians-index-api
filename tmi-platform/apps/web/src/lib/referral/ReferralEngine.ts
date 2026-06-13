/**
 * ReferralEngine — engagement-gated referral tracking for TMI.
 * Tiered XP: free join = 500pts, paid tiers scale to 2500pts.
 * Launch bonus: double XP for invites that join during launch window (until 2026-08-31).
 * Qualification: invitee must stay ≥30s AND perform ≥1 action.
 * Anti-spam: max 10 pending per owner, tokens expire after 7 days.
 */

export type InviteeTier = 'free' | 'pro' | 'RUBY' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface ReferralLink {
  token: string;
  ownerId: string;
  roomId: string;
  createdAt: number;
  expiresAt: number;
}

export interface ReferralRecord {
  token: string;
  ownerId: string;
  invitedId: string;
  inviteeTier: InviteeTier;
  arrivedAt: number;
  qualifiedAt: number | null;
  pointsAwarded: number;
  milestonePaid: boolean;
}

export interface ReferralStats {
  pending: number;
  qualified: number;
  totalPoints: number;
  milestoneUnlocked: boolean;
}

// XP per qualified invite by invitee's subscription tier
export const TIER_XP: Record<InviteeTier, number> = {
  free:     500,
  pro:      750,
  RUBY:  1_000,
  silver:  1_250,
  gold:    1_500,
  platinum: 2_000,
  diamond: 2_500,
};

const MILESTONE_BONUS = 5_000;
const MILESTONE_THRESHOLD = 5;
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const MAX_PENDING_PER_OWNER = 10;
const MIN_STAY_SECONDS = 30;
const MIN_ACTIONS = 1;

// Launch window: double XP until 2026-08-31
const LAUNCH_WINDOW_END = new Date('2026-09-01T00:00:00Z').getTime();

export function isLaunchWindow(nowMs = Date.now()): boolean {
  return nowMs < LAUNCH_WINDOW_END;
}

export function getPointsForTier(tier: InviteeTier, nowMs = Date.now()): number {
  const base = TIER_XP[tier] ?? TIER_XP.free;
  return isLaunchWindow(nowMs) ? base * 2 : base;
}

// Server-side in-memory stores
const linkStore = new Map<string, ReferralLink>();
const recordStore = new Map<string, ReferralRecord[]>();

function genToken(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getOwnerRecords(ownerId: string): ReferralRecord[] {
  if (!recordStore.has(ownerId)) recordStore.set(ownerId, []);
  return recordStore.get(ownerId)!;
}

export function getOrCreateLink(ownerId: string, roomId: string): ReferralLink {
  const now = Date.now();
  for (const link of linkStore.values()) {
    if (link.ownerId === ownerId && link.roomId === roomId && link.expiresAt > now) {
      return link;
    }
  }
  const token = genToken();
  const link: ReferralLink = { token, ownerId, roomId, createdAt: now, expiresAt: now + TOKEN_TTL_MS };
  linkStore.set(token, link);
  return link;
}

export function resolveToken(token: string): ReferralLink | null {
  const link = linkStore.get(token);
  if (!link || link.expiresAt < Date.now()) return null;
  return link;
}

export function registerArrival(
  token: string,
  invitedId: string,
  nowMs = Date.now(),
): { ok: boolean; reason: string } {
  const link = resolveToken(token);
  if (!link) return { ok: false, reason: 'Invalid or expired token' };

  const records = getOwnerRecords(link.ownerId);
  if (records.find((r) => r.token === token && r.invitedId === invitedId)) {
    return { ok: false, reason: 'Already registered' };
  }
  const pending = records.filter((r) => r.qualifiedAt === null);
  if (pending.length >= MAX_PENDING_PER_OWNER) {
    return { ok: false, reason: 'Too many pending referrals' };
  }

  records.push({
    token,
    ownerId: link.ownerId,
    invitedId,
    inviteeTier: 'free',
    arrivedAt: nowMs,
    qualifiedAt: null,
    pointsAwarded: 0,
    milestonePaid: false,
  });

  return { ok: true, reason: 'Arrival registered' };
}

export function qualifyReferral(
  token: string,
  invitedId: string,
  staySeconds: number,
  actionCount: number,
  inviteeTier: InviteeTier = 'free',
  nowMs = Date.now(),
): { qualified: boolean; pointsAwarded: number; milestoneBonus: number; launchBonus: boolean; reason: string } {
  const link = resolveToken(token);
  if (!link) {
    return { qualified: false, pointsAwarded: 0, milestoneBonus: 0, launchBonus: false, reason: 'Invalid or expired token' };
  }

  const records = getOwnerRecords(link.ownerId);
  const record = records.find((r) => r.token === token && r.invitedId === invitedId);

  if (!record) {
    return { qualified: false, pointsAwarded: 0, milestoneBonus: 0, launchBonus: false, reason: 'No arrival record found' };
  }
  if (record.qualifiedAt !== null) {
    return { qualified: true, pointsAwarded: 0, milestoneBonus: 0, launchBonus: false, reason: 'Already qualified' };
  }
  if (staySeconds < MIN_STAY_SECONDS) {
    return { qualified: false, pointsAwarded: 0, milestoneBonus: 0, launchBonus: false, reason: `Must stay at least ${MIN_STAY_SECONDS}s` };
  }
  if (actionCount < MIN_ACTIONS) {
    return { qualified: false, pointsAwarded: 0, milestoneBonus: 0, launchBonus: false, reason: 'Must perform at least 1 action' };
  }

  record.inviteeTier = inviteeTier;
  record.qualifiedAt = nowMs;

  const launch = isLaunchWindow(nowMs);
  const base = TIER_XP[inviteeTier] ?? TIER_XP.free;
  const points = launch ? base * 2 : base;
  record.pointsAwarded = points;

  const totalQualified = records.filter((r) => r.qualifiedAt !== null).length;
  let milestoneBonus = 0;
  if (totalQualified >= MILESTONE_THRESHOLD && !records.some((r) => r.milestonePaid)) {
    milestoneBonus = launch ? MILESTONE_BONUS * 2 : MILESTONE_BONUS;
    record.milestonePaid = true;
  }

  return { qualified: true, pointsAwarded: points, milestoneBonus, launchBonus: launch, reason: 'Qualified' };
}

export function getReferralStats(ownerId: string): ReferralStats {
  const records = getOwnerRecords(ownerId);
  const qualified = records.filter((r) => r.qualifiedAt !== null);
  const milestonePaid = records.some((r) => r.milestonePaid);
  const totalPoints = qualified.reduce((sum, r) => sum + r.pointsAwarded, 0) + (milestonePaid ? MILESTONE_BONUS : 0);
  return {
    pending: records.filter((r) => r.qualifiedAt === null).length,
    qualified: qualified.length,
    totalPoints,
    milestoneUnlocked: qualified.length >= MILESTONE_THRESHOLD,
  };
}
