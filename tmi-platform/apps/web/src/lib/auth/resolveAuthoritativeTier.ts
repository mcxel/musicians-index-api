import prisma from '@/lib/prisma';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';
import { resolveHardcodedTierRole, type UserTier } from '@/lib/auth/UserStore';
import { tierForPriceId } from '@/lib/stripe/tierMapping';

const VALID_TIERS = new Set<UserTier>(['FREE', 'PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);
const PAID_TIERS = new Set<UserTier>(['PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);

/**
 * Stripe / complimentary evidence that a paid User.tier is legitimate.
 * Never invent Stripe objects — only fields already stored on the user row
 * (or an explicit complimentaryGrant from an admin audit path).
 */
export type PaidEntitlementEvidence = {
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  billingStatus?: string | null;
  /** True when ADMIN_GRANT_TIER (or equivalent) authorized this paid tier. */
  complimentaryGrant?: boolean;
};

/**
 * Verified paid entitlement = live Stripe subscription/price that maps to a
 * paid tier, or an explicit complimentary grant. Canceled billing is never
 * treated as verified. Does not call Stripe APIs.
 */
export function hasVerifiedPaidEntitlement(
  evidence: PaidEntitlementEvidence | null | undefined,
): boolean {
  if (!evidence) return false;
  if (evidence.complimentaryGrant === true) return true;

  const billing = (evidence.billingStatus ?? 'active').toLowerCase();
  if (billing === 'canceled') return false;

  if (evidence.stripeSubscriptionId && String(evidence.stripeSubscriptionId).trim()) {
    return true;
  }

  const priceId = evidence.stripePriceId?.trim();
  if (priceId) {
    const mapped = tierForPriceId(priceId);
    if (mapped && mapped !== 'FREE') return true;
  }

  return false;
}

/**
 * P0 Identity/Entitlement Integrity — single source of truth for turning an
 * already-fetched DB tier value into the tier a session-reading route should
 * serve. Every caller must pass `dbTier` from a fresh Prisma read of THIS
 * request's authenticated user — never a client-supplied cookie value, and
 * never derived from role. Role/admin authority and subscription tier are
 * separate dimensions; this function has no role parameter by design, so it
 * cannot grant tier from role even by accident.
 *
 * An unknown/missing/invalid tier always resolves to FREE, never DIAMOND —
 * defaulting unknown state to the highest privilege tier is a privilege
 * escalation, not a safe fallback. Legacy "ADMIN" in the tier column is
 * normalized to "DIAMOND" for executive accounts or "FREE" otherwise.
 *
 * Optional `entitlement` (3rd arg):
 * - `undefined` — legacy callers/tests: pass through DB paid tiers unchanged
 *   (except founder/hardcoded/BRONZE/ADMIN rules). Prefer always passing
 *   evidence from session routes.
 * - object / `null` — honesty mode: paid DB tiers without verified Stripe/
 *   complimentary evidence resolve to FREE for display (never invents paid).
 */
export function computeAuthoritativeTier(
  email: string,
  dbTier: string | null | undefined,
  entitlement?: PaidEntitlementEvidence | null,
): { tier: UserTier; needsFounderHeal: boolean; needsUnpaidTierHeal: boolean } {
  const normalized = dbTier?.toUpperCase();
  const isFounderEmail = Boolean(email) && isFounderDiamondEmail(email);

  let baseTier: UserTier = 'FREE';
  let needsFounderHeal = false;

  if (normalized === 'ADMIN') {
    // Legacy migration: ADMIN is a role, not a subscription tier. Executive
    // admins (e.g. founder accounts) receive DIAMOND tier; others revert to FREE.
    baseTier = isFounderEmail ? 'DIAMOND' : 'FREE';
    needsFounderHeal = true;
  } else if (normalized === 'BRONZE') {
    // Tier canon: Ruby replaced Bronze permanently.
    baseTier = 'RUBY';
  } else if (normalized && VALID_TIERS.has(normalized as UserTier)) {
    baseTier = normalized as UserTier;
  }

  if (isFounderEmail && baseTier !== 'DIAMOND') {
    return { tier: 'DIAMOND', needsFounderHeal: true, needsUnpaidTierHeal: false };
  }

  // Same entitlement chain as login/UserStore — never let a stale FREE DB row
  // downgrade a canonical hardcoded-Diamond or DIAMOND_EMAILS account on session read.
  const hardcoded = email ? resolveHardcodedTierRole(email) : null;
  if (hardcoded?.tier === 'DIAMOND' && baseTier !== 'DIAMOND') {
    return { tier: 'DIAMOND', needsFounderHeal: true, needsUnpaidTierHeal: false };
  }

  // Honesty gate: UI must never show GOLD (etc.) without verified entitlement.
  // Founder / hardcoded Diamond already returned above. Does not invent Stripe.
  if (
    entitlement !== undefined &&
    PAID_TIERS.has(baseTier) &&
    hardcoded?.tier !== 'DIAMOND' &&
    !hasVerifiedPaidEntitlement(entitlement)
  ) {
    return { tier: 'FREE', needsFounderHeal: false, needsUnpaidTierHeal: true };
  }

  return { tier: baseTier, needsFounderHeal, needsUnpaidTierHeal: false };
}

/**
 * Resolves tier and performs the founder-pass DB self-heal (fire-and-forget
 * — future reads see DIAMOND directly from the DB without needing this
 * override again) in one call. Use this from route handlers; use
 * computeAuthoritativeTier directly in tests where a live DB isn't wanted.
 *
 * Unpaid-tier heal is READ-PATH only here — never auto-writes FREE on session.
 * Use admin reconcileUnverifiedPaidTiers for explicit write-path cleanup.
 */
export function resolveTierFromDb(
  email: string,
  dbTier: string | null | undefined,
  entitlement?: PaidEntitlementEvidence | null,
): UserTier {
  const { tier, needsFounderHeal } = computeAuthoritativeTier(email, dbTier, entitlement);
  if (needsFounderHeal && email) {
    prisma.user.updateMany({ where: { email }, data: { tier: 'DIAMOND' } }).catch(() => {});
  }
  if (email && dbTier?.toUpperCase() === 'BRONZE') {
    prisma.user.updateMany({ where: { email }, data: { tier: 'RUBY' } }).catch(() => {});
  }
  return tier;
}

/** Prisma select fragment for entitlement-aware tier resolution. */
export const TIER_ENTITLEMENT_SELECT = {
  tier: true,
  email: true,
  stripeSubscriptionId: true,
  stripePriceId: true,
  billingStatus: true,
} as const;

export function entitlementEvidenceFromUser(user: {
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  billingStatus?: string | null;
}): PaidEntitlementEvidence {
  return {
    stripeSubscriptionId: user.stripeSubscriptionId ?? null,
    stripePriceId: user.stripePriceId ?? null,
    billingStatus: user.billingStatus ?? null,
  };
}
