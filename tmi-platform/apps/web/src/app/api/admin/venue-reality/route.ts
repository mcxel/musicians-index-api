export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getVenueRealityScorecard,
  listVenueRealityScorecards,
  upsertVenueRealityScorecard,
} from '@/lib/venue/VenueRealityCertificationEngine';

export function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get('venueId');
  if (venueId) {
    const scorecard = getVenueRealityScorecard(venueId);
    return NextResponse.json({ scorecard });
  }

  return NextResponse.json({
    scorecards: listVenueRealityScorecards(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scorecard = upsertVenueRealityScorecard({
      venueId: String(body.venueId ?? ''),
      venueLabel: String(body.venueLabel ?? ''),
      scorer: body.scorer ?? 'manual',
      metrics: body.metrics ?? {},
    });

    return NextResponse.json({ ok: true, scorecard });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
}