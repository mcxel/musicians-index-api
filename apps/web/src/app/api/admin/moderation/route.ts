export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { applyAdminAction } from '@/lib/moderation/ModerationEngine';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

// SECURITY (2026-09-23, Batch 2): this route can suspend/ban a real user
// (POST below) — the gate and the performedBy actor identity now both come
// from getTmiAuth() (verified DB role/id), never from tmi_role/tmi_user_email
// cookies. Previously an attacker could forge tmi_role=ADMIN plus
// tmi_user_email set to any real admin's address and both pass the gate AND
// have the ban/suspend/warn/clear action attributed to that real admin, with
// zero authentication.
async function isAdmin(req: NextRequest): Promise<boolean> {
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? '').toUpperCase();
  return role === 'ADMIN' || role === 'STAFF';
}

// GET — review queue: pending reports, ordered most-severe-first, plus any
// account currently under an active auto-suspend (needs a human decision
// before its hold window expires and it self-clears).
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [pendingReports, autoSuspended] = await Promise.all([
    prisma.report.findMany({
      where: { status: 'pending' },
      orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }],
      take: 100,
    }),
    prisma.user.findMany({
      where: { accountStatus: 'suspended' },
      select: { id: true, email: true, displayName: true, accountStatusReason: true, accountStatusExpiresAt: true },
    }),
  ]);

  return NextResponse.json({ pendingReports, autoSuspended });
}

// POST — a human confirming, reversing, or escalating.
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? '').toUpperCase();
  if (!auth || (role !== 'ADMIN' && role !== 'STAFF')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const performedBy = auth.user.id;

  const body = await req.json() as {
    targetUserId?: string;
    actionType?: 'clear' | 'warn' | 'suspend' | 'ban';
    reason?: string;
    reportId?: string;
    durationDays?: number;
  };
  const { targetUserId, actionType, reason, reportId, durationDays } = body;

  if (!targetUserId || !actionType || !reason) {
    return NextResponse.json({ error: 'targetUserId, actionType, and reason are required' }, { status: 400 });
  }
  if (!['clear', 'warn', 'suspend', 'ban'].includes(actionType)) {
    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  }

  await applyAdminAction({ targetUserId, actionType, reason, performedBy, reportId, durationDays });
  return NextResponse.json({ ok: true });
}
