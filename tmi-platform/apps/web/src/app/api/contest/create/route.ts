export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { revenueFirstRewardsGovernor } from '@/lib/economy/RevenueFirstRewardsGovernor';

type ContestCreateBody = {
  title?: string;
  category?: string;
  venueId?: string;
  expectedRevenueCents?: number;
  expectedOperatingCostCents?: number;
  expectedInfrastructureCostCents?: number;
  expectedPrizePoolCents?: number;
  prizeAllocationRate?: number;
};

export async function POST(req: NextRequest) {
  let body: ContestCreateBody;
  try {
    body = (await req.json()) as ContestCreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.title || !body.category) {
    return NextResponse.json({ ok: false, error: 'title and category are required' }, { status: 400 });
  }

  const economics = revenueFirstRewardsGovernor.assessEventEconomics({
    expectedRevenueCents: Math.max(0, Number(body.expectedRevenueCents ?? 0)),
    expectedOperatingCostCents: Math.max(0, Number(body.expectedOperatingCostCents ?? 0)),
    expectedInfrastructureCostCents: Math.max(0, Number(body.expectedInfrastructureCostCents ?? 0)),
    expectedPrizePoolCents: Math.max(0, Number(body.expectedPrizePoolCents ?? 0)),
    allocationRate: body.prizeAllocationRate,
  });

  if (!economics.allowed) {
    return NextResponse.json({
      ok: false,
      error: 'Contest publish rejected by revenue governor',
      code: 'CONTEST_ECONOMICS_GATE_REJECTED',
      economics,
    }, { status: 409 });
  }

  const contest = {
    id: `contest_${Date.now()}`,
    title: body.title,
    category: body.category,
    venueId: body.venueId ?? null,
    status: 'published',
    publishedAt: new Date().toISOString(),
  };

  return NextResponse.json({ ok: true, contest, economics }, { status: 201 });
}
