export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { applyAdminAction } from '@/lib/moderation/ModerationEngine';

function isAdmin(req: NextRequest): boolean {
  const role = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();
  return role === 'ADMIN' || role === 'STAFF';
}

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

// GET — review queue: pending reports, ordered most-severe-first, plus any
// account currently under an active auto-suspend (needs a human decision
// before its hold window expires and it self-clears).
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const performedBy = await resolveUserId(req);
  if (!performedBy) return NextResponse.json({ error: 'Could not resolve admin identity' }, { status: 401 });

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
