import prisma from '@/lib/prisma';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';
import type { UserTier } from '@/lib/auth/UserStore';

const VALID_TIERS = new Set<UserTier>(['FREE', 'PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);

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
 */
export function computeAuthoritativeTier(
  email: string,
  dbTier: string | null | undefined,
): { tier: UserTier; needsFounderHeal: boolean } {
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
    return { tier: 'DIAMOND', needsFounderHeal: true };
  }
  return { tier: baseTier, needsFounderHeal };
}

/**
 * Resolves tier and performs the founder-pass DB self-heal (fire-and-forget
 * — future reads see DIAMOND directly from the DB without needing this
 * override again) in one call. Use this from route handlers; use
 * computeAuthoritativeTier directly in tests where a live DB isn't wanted.
 */
export function resolveTierFromDb(email: string, dbTier: string | null | undefined): UserTier {
  const { tier, needsFounderHeal } = computeAuthoritativeTier(email, dbTier);
  if (needsFounderHeal && email) {
    prisma.user.updateMany({ where: { email }, data: { tier: 'DIAMOND' } }).catch(() => {});
  }
  if (email && dbTier?.toUpperCase() === 'BRONZE') {
    prisma.user.updateMany({ where: { email }, data: { tier: 'RUBY' } }).catch(() => {});
  }
  return tier;
}
