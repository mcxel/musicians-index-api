export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import {
  QA_FLEET,
  getFleetSummary,
  getFleetByCategory,
  getFleetResults,
  recordFleetResult,
  isQAAccount,
  type FleetRunStatus,
} from '@/lib/qa/QACertificationFleet';

// Admin-only: only ADMIN and STAFF roles may access fleet data.
async function requireAdmin() {
  const session = await getTmiAuth();
  if (!session) return null;
  const role = (session.user as { role?: string }).role ?? '';
  if (role !== 'ADMIN' && role !== 'STAFF') return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'admin_required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get('view') ?? 'summary';

  if (view === 'summary') {
    return NextResponse.json({
      summary: getFleetSummary(),
      fleet: QA_FLEET.map((a) => ({
        slug: a.slug,
        email: a.email,
        displayName: a.displayName,
        role: a.role,
        certRole: a.certRole,
        tier: a.tier,
        purpose: a.purpose,
        checkCount: a.checks.length,
        result: getFleetResults().get(a.slug) ?? null,
      })),
    });
  }

  if (view === 'categories') {
    return NextResponse.json({ categories: getFleetByCategory() });
  }

  if (view === 'account') {
    const slug = searchParams.get('slug');
    const account = QA_FLEET.find((a) => a.slug === slug);
    if (!account) {
      return NextResponse.json({ error: 'account_not_found' }, { status: 404 });
    }
    return NextResponse.json({
      account,
      result: getFleetResults().get(account.slug) ?? null,
    });
  }

  return NextResponse.json({ error: 'unknown_view' }, { status: 400 });
}

// PATCH — record a fleet run result from an external runner (Playwright CI etc.)
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'admin_required' }, { status: 403 });
  }

  const body = await req.json() as {
    accountSlug?: string;
    status?: FleetRunStatus;
    failedCheck?: string;
    durationMs?: number;
    deviceTarget?: string;
    pagesVisited?: number;
    buttonsTested?: number;
    apiCallsMade?: number;
    emailsVerified?: number;
    purchases?: number;
    networkFailures?: number;
    consoleErrors?: number;
  };

  if (!body.accountSlug || !body.status) {
    return NextResponse.json({ error: 'accountSlug and status required' }, { status: 400 });
  }

  const account = QA_FLEET.find((a) => a.slug === body.accountSlug);
  if (!account) {
    return NextResponse.json({ error: 'account_not_found' }, { status: 404 });
  }

  // Refuse to record results for non-QA accounts (belt-and-suspenders guard)
  if (!isQAAccount(account.email)) {
    return NextResponse.json({ error: 'not_a_qa_account' }, { status: 400 });
  }

  recordFleetResult({
    accountSlug: body.accountSlug,
    status: body.status,
    lastRunAt: new Date().toISOString(),
    failedCheck: body.failedCheck ?? null,
    durationMs: body.durationMs ?? null,
    deviceTarget: body.deviceTarget as never,
    pagesVisited: body.pagesVisited,
    buttonsTested: body.buttonsTested,
    apiCallsMade: body.apiCallsMade,
    emailsVerified: body.emailsVerified,
    purchases: body.purchases,
    networkFailures: body.networkFailures,
    consoleErrors: body.consoleErrors,
  });

  return NextResponse.json({ ok: true, accountSlug: body.accountSlug, status: body.status });
}
