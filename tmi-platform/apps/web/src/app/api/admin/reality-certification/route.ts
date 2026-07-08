export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getRealityCertificationSummary,
  getRealityScorecard,
  listRealityScorecards,
  upsertRealityScorecard,
} from '@/lib/reality/RealityCertificationEngine';

export function GET(req: NextRequest) {
  const module = req.nextUrl.searchParams.get('module') as Parameters<typeof listRealityScorecards>[0] | null;
  const targetId = req.nextUrl.searchParams.get('targetId');

  if (module && targetId) {
    return NextResponse.json({ scorecard: getRealityScorecard(module, targetId) });
  }

  return NextResponse.json({
    summary: getRealityCertificationSummary(),
    scorecards: listRealityScorecards(module ?? undefined),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scorecard = upsertRealityScorecard({
      module: body.module,
      targetId: String(body.targetId ?? ''),
      targetLabel: String(body.targetLabel ?? ''),
      scorer: body.scorer ?? 'manual',
      metrics: body.metrics ?? {},
    });
    return NextResponse.json({ ok: true, scorecard, summary: getRealityCertificationSummary() });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
}