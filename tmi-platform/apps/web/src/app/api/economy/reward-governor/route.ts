export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  revenueFirstRewardsGovernor,
  type FinancialHealthSnapshot,
  type RewardGovernorConfig,
  type VenueContestBudgetInput,
} from '@/lib/economy/RevenueFirstRewardsGovernor';

export async function GET() {
  const snapshot = revenueFirstRewardsGovernor.getFinancialSnapshot();
  const config = revenueFirstRewardsGovernor.getConfig();
  const decision = revenueFirstRewardsGovernor.evaluate();

  return NextResponse.json({
    ok: true,
    decision,
    snapshot,
    config,
  });
}

type RewardGovernorAction =
  | 'set-snapshot'
  | 'set-config'
  | 'assess-contest'
  | 'assess-venue';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const action = (body as { action?: RewardGovernorAction }).action;
  if (!action) {
    return NextResponse.json({ ok: false, error: 'missing_action' }, { status: 400 });
  }

  if (action === 'set-snapshot') {
    const patch = (body as { snapshot?: Partial<FinancialHealthSnapshot> }).snapshot;
    if (!patch || typeof patch !== 'object') {
      return NextResponse.json({ ok: false, error: 'missing_snapshot_patch' }, { status: 400 });
    }

    const snapshot = revenueFirstRewardsGovernor.setFinancialSnapshot(patch);
    const decision = revenueFirstRewardsGovernor.evaluate();
    return NextResponse.json({ ok: true, snapshot, decision });
  }

  if (action === 'set-config') {
    const patch = (body as { config?: Partial<RewardGovernorConfig> }).config;
    if (!patch || typeof patch !== 'object') {
      return NextResponse.json({ ok: false, error: 'missing_config_patch' }, { status: 400 });
    }

    const config = revenueFirstRewardsGovernor.setConfig(patch);
    const decision = revenueFirstRewardsGovernor.evaluate();
    return NextResponse.json({ ok: true, config, decision });
  }

  if (action === 'assess-contest') {
    const payload = body as {
      contestRevenueCents?: number;
      proposedPrizePoolCents?: number;
      allocationRate?: number;
      snapshotOverride?: Partial<FinancialHealthSnapshot>;
    };

    if (
      typeof payload.contestRevenueCents !== 'number' ||
      typeof payload.proposedPrizePoolCents !== 'number'
    ) {
      return NextResponse.json({ ok: false, error: 'missing_contest_budget_fields' }, { status: 400 });
    }

    const assessment = revenueFirstRewardsGovernor.assessContestBudget({
      contestRevenueCents: payload.contestRevenueCents,
      proposedPrizePoolCents: payload.proposedPrizePoolCents,
      allocationRate: payload.allocationRate,
      snapshotOverride: payload.snapshotOverride,
    });

    return NextResponse.json({
      ok: true,
      decision: revenueFirstRewardsGovernor.evaluate(payload.snapshotOverride),
      assessment,
    });
  }

  if (action === 'assess-venue') {
    const payload = (body as { venue?: VenueContestBudgetInput }).venue;
    if (!payload) {
      return NextResponse.json({ ok: false, error: 'missing_venue_budget' }, { status: 400 });
    }

    const assessment = revenueFirstRewardsGovernor.validateVenueContestBudget(payload);
    return NextResponse.json({
      ok: true,
      decision: revenueFirstRewardsGovernor.evaluate(),
      assessment,
    });
  }

  return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400 });
}
