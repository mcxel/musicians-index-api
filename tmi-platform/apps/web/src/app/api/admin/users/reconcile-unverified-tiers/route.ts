import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import { reconcileUnverifiedPaidTiers } from '@/lib/auth/reconcileUnverifiedPaidTiers';

/**
 * POST /api/admin/users/reconcile-unverified-tiers
 *
 * Dry-run by default. Body: { commit?: boolean; limit?: number }
 *
 * Lists (or heals) users whose User.tier is paid but who have no verified
 * Stripe subscription/price and no ADMIN_GRANT_TIER audit. Safe: never invents
 * Stripe entitlements; never strips founder/hardcoded Diamond or complimentary.
 */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let body: { commit?: boolean; limit?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const result = await reconcileUnverifiedPaidTiers({
    commit: body.commit === true,
    limit: typeof body.limit === 'number' ? body.limit : undefined,
  });

  return NextResponse.json({
    ok: true,
    ...result,
    manualCheck:
      'Review candidates. Real Stripe subscribers keep stripeSubscriptionId/stripePriceId and are skipped. Re-run with commit:true only after dry-run review. Complimentary grants (ADMIN_GRANT_TIER) are skipped — re-grant via /api/admin/users/grant-tier if needed.',
  });
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const result = await reconcileUnverifiedPaidTiers({ commit: false });
  return NextResponse.json({
    ok: true,
    ...result,
    manualCheck:
      'GET is always dry-run. POST with { commit: true } to write FREE after review.',
  });
}
