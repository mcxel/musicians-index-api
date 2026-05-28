export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/admin/AdminStatsEngine';

export async function GET() {
  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
