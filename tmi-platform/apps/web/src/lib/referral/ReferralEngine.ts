/**
 * ReferralEngine — engagement-gated referral tracking for TMI Phase 1.
 * Points: 500pts per qualified invite, 5000pts bonus at 5 qualified invites.
 * Qualification: invitee must stay ≥30s AND perform ≥1 action.
 * Anti-spam: max 10 pending per owner, tokens expire after 7 days.
 * Server-side singleton (module-level maps, no external DB required for Phase 1).
 */

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

const POINTS_PER_INVITE = 500;
const MILESTONE_BONUS = 5_000;
const MILESTONE_THRESHOLD = 5;
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const MAX_PENDING_PER_OWNER = 10;
const MIN_STAY_SECONDS = 30;
const MIN_ACTIONS = 1;

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
  const link: ReferralLink = {
    token,
    ownerId,
    roomId,
    createdAt: now,
    expiresAt: now + TOKEN_TTL_MS,
  };
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
  if (!link) return { ok: false, reason: "Invalid or expired token" };

  const records = getOwnerRecords(link.ownerId);

  if (records.find((r) => r.token === token && r.invitedId === invitedId)) {
    return { ok: false, reason: "Already registered" };
  }

  const pending = records.filter((r) => r.qualifiedAt === null);
  if (pending.length >= MAX_PENDING_PER_OWNER) {
    return { ok: false, reason: "Too many pending referrals" };
  }

  records.push({
    token,
    ownerId: link.ownerId,
    invitedId,
    arrivedAt: nowMs,
    qualifiedAt: null,
    pointsAwarded: 0,
    milestonePaid: false,
  });

  return { ok: true, reason: "Arrival registered" };
}

export function qualifyReferral(
  token: string,
  invitedId: string,
  staySeconds: number,
  actionCount: number,
  nowMs = Date.now(),
): { qualified: boolean; pointsAwarded: number; milestoneBonus: number; reason: string } {
  const link = resolveToken(token);
  if (!link) {
    return { qualified: false, pointsAwarded: 0, milestoneBonus: 0, reason: "Invalid or expired token" };
  }

  const records = getOwnerRecords(link.ownerId);
  const record = records.find((r) => r.token === token && r.invitedId === invitedId);

  if (!record) {
    return { qualified: false, pointsAwarded: 0, milestoneBonus: 0, reason: "No arrival record found" };
  }
  if (record.qualifiedAt !== null) {
    return { qualified: true, pointsAwarded: 0, milestoneBonus: 0, reason: "Already qualified" };
  }
  if (staySeconds < MIN_STAY_SECONDS) {
    return {
      qualified: false, pointsAwarded: 0, milestoneBonus: 0,
      reason: `Must stay at least ${MIN_STAY_SECONDS}s (stayed ${staySeconds}s)`,
    };
  }
  if (actionCount < MIN_ACTIONS) {
    return { qualified: false, pointsAwarded: 0, milestoneBonus: 0, reason: "Must perform at least 1 action" };
  }

  record.qualifiedAt = nowMs;
  record.pointsAwarded = POINTS_PER_INVITE;

  const totalQualified = records.filter((r) => r.qualifiedAt !== null).length;
  let milestoneBonus = 0;
  if (totalQualified >= MILESTONE_THRESHOLD && !records.some((r) => r.milestonePaid)) {
    milestoneBonus = MILESTONE_BONUS;
    record.milestonePaid = true;
  }

  return { qualified: true, pointsAwarded: POINTS_PER_INVITE, milestoneBonus, reason: "Qualified" };
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
