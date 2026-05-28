export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../_utils/require-admin';
import { getAdminStats } from '@/lib/admin/AdminStatsEngine';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const stats = await getAdminStats();
  return NextResponse.json({
    total: stats.users.total,
    online: stats.users.online,
    newToday: stats.users.newToday,
    paid: stats.business.paidMembers,
    churn: stats.users.churned,
  });
}
