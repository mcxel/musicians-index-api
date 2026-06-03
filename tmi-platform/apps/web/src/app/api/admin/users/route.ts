export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_utils/require-admin';
import { getAllUsers, getUserCount } from '@/lib/auth/UserStore';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '200'), 500);
  const roleFilter = url.searchParams.get('role')?.toLowerCase() ?? '';

  const allUsers = getAllUsers(limit);
  const filtered = roleFilter
    ? allUsers.filter(u => u.role.toLowerCase() === roleFilter)
    : allUsers;

  const roleCounts: Record<string, number> = {};
  const tierCounts: Record<string, number> = {};
  for (const u of allUsers) {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
    tierCounts[u.tier] = (tierCounts[u.tier] ?? 0) + 1;
  }

  return NextResponse.json({
    total: getUserCount(),
    returned: filtered.length,
    roleCounts,
    tierCounts,
    users: filtered.map(u => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      tier: u.tier,
      createdAt: new Date(u.createdAt).toISOString(),
    })),
  });
}
