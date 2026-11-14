/**
 * Admin-safe unpaid-tier reconcile (GOLD heal write path).
 *
 * Downgrades User.tier to FREE only when the DB shows a paid tier with NO
 * verified Stripe subscription/price evidence and NO ADMIN_GRANT_TIER audit.
 * Never invents Stripe entitlements. Never touches founder/hardcoded Diamond.
 *
 * Default is dry-run. Pass commit:true only after reviewing candidates.
 */
import prisma from '@/lib/prisma';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';
import { resolveHardcodedTierRole, type UserTier } from '@/lib/auth/UserStore';
import {
  computeAuthoritativeTier,
  entitlementEvidenceFromUser,
  hasVerifiedPaidEntitlement,
} from '@/lib/auth/resolveAuthoritativeTier';

const PAID = new Set(['PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);

export type UnverifiedPaidTierCandidate = {
  userId: string;
  email: string | null;
  dbTier: string;
  reason: string;
};

export type ReconcileUnverifiedPaidTiersResult = {
  dryRun: boolean;
  scanned: number;
  candidates: UnverifiedPaidTierCandidate[];
  healed: number;
  skippedComplimentary: number;
  skippedFounderOrHardcoded: number;
  skippedVerifiedStripe: number;
};

async function complimentaryGrantUserIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const rows = await prisma.auditLog
    .findMany({
      where: {
        targetId: { in: userIds },
        action: 'ADMIN_GRANT_TIER',
      },
      select: { targetId: true },
    })
    .catch(() => [] as { targetId: string | null }[]);
  return new Set(rows.map((r) => r.targetId).filter((id): id is string => Boolean(id)));
}

export async function reconcileUnverifiedPaidTiers(opts?: {
  commit?: boolean;
  limit?: number;
}): Promise<ReconcileUnverifiedPaidTiersResult> {
  const commit = opts?.commit === true;
  const limit = Math.min(Math.max(opts?.limit ?? 500, 1), 2000);

  const users = await prisma.user.findMany({
    where: { tier: { not: 'FREE' } },
    take: limit,
    select: {
      id: true,
      email: true,
      tier: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      billingStatus: true,
    },
  });

  const complimentaryIds = await complimentaryGrantUserIds(users.map((u) => u.id));

  const candidates: UnverifiedPaidTierCandidate[] = [];
  let skippedComplimentary = 0;
  let skippedFounderOrHardcoded = 0;
  let skippedVerifiedStripe = 0;

  for (const user of users) {
    const dbTier = (user.tier ?? 'FREE').toUpperCase();
    if (!PAID.has(dbTier)) continue;

    const email = user.email ?? '';
    if (
      (email && isFounderDiamondEmail(email)) ||
      resolveHardcodedTierRole(email)?.tier === 'DIAMOND'
    ) {
      skippedFounderOrHardcoded += 1;
      continue;
    }

    if (complimentaryIds.has(user.id)) {
      skippedComplimentary += 1;
      continue;
    }

    const evidence = entitlementEvidenceFromUser(user);
    if (hasVerifiedPaidEntitlement(evidence)) {
      skippedVerifiedStripe += 1;
      continue;
    }

    const resolved = computeAuthoritativeTier(email, user.tier, evidence);
    if (resolved.tier !== 'FREE' || !resolved.needsUnpaidTierHeal) continue;

    candidates.push({
      userId: user.id,
      email: user.email,
      dbTier,
      reason: 'paid_tier_without_stripe_or_complimentary_grant',
    });
  }

  let healed = 0;
  if (commit && candidates.length > 0) {
    for (const c of candidates) {
      await prisma.user.update({
        where: { id: c.userId },
        data: { tier: 'FREE' as UserTier },
      });
      // No AuditLogAction for reconcile yet — dry-run response + server log are the record.
      // Do not invent an enum value; schema changes are out of scope for this heal.
      console.info('[reconcileUnverifiedPaidTiers]', {
        userId: c.userId,
        email: c.email,
        previousTier: c.dbTier,
        newTier: 'FREE',
        reason: c.reason,
      });
      healed += 1;
    }
  }

  return {
    dryRun: !commit,
    scanned: users.length,
    candidates,
    healed,
    skippedComplimentary,
    skippedFounderOrHardcoded,
    skippedVerifiedStripe,
  };
}
