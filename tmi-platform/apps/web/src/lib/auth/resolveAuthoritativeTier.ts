import prisma from '@/lib/prisma';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';
import type { UserTier } from '@/lib/auth/UserStore';

const VALID_TIERS = new Set<UserTier>(['FREE', 'PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ADMIN']);

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
 * escalation, not a safe fallback.
 *
 * Previously this exact founder-diamond-pass check + self-heal was
 * duplicated ad hoc across /api/auth/signin, /api/auth/session,
 * /api/auth/me, and getTmiAuth.ts (three of the four never even read the
 * DB tier at all — they trusted a stale tmi_tier cookie). Converged here so
 * there is exactly one place this rule lives.
 */
export function computeAuthoritativeTier(
  email: string,
  dbTier: string | null | undefined,
): { tier: UserTier; needsFounderHeal: boolean } {
  const normalized = dbTier?.toUpperCase();
  const baseTier: UserTier = normalized && VALID_TIERS.has(normalized as UserTier) ? (normalized as UserTier) : 'FREE';

  const isFounderEmail = Boolean(email) && isFounderDiamondEmail(email);
  if (isFounderEmail && baseTier !== 'DIAMOND') {
    return { tier: 'DIAMOND', needsFounderHeal: true };
  }
  return { tier: baseTier, needsFounderHeal: false };
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
  return tier;
}
