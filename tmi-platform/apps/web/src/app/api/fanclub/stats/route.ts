export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/fanclub/stats
// Returns fan club stats for the current authenticated performer.
// No real DB yet — returns honest empty state so dashboard renders correctly.
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Honest empty state — no data fabricated.
  // Once a real DB is wired, query FanClubMembership rows for this performer.
  return NextResponse.json({
    stats: {
      totalMembers: 0,
      monthlyRevenue: 0,
      postsThisMonth: 0,
      churnRate: null,
    },
    members: [],
  });
}
