import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/admin/AdminStatsEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Admin authorization check should be implemented here in production.
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('[ADMIN_STATS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to retrieve admin stats' }, { status: 500 });
  }
}