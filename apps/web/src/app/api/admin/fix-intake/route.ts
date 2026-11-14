export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

type FixTicket = {
  id: string;
  issue: string;
  operator: string;
  autoApply: boolean;
  status: 'queued' | 'auto-fixed';
  createdAt: number;
};

const tickets: FixTicket[] = [];

function ticketId(): string {
  return `fix-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// SECURITY (2026-09-23, Batch 2): verified DB role via getTmiAuth(), never
// the client-writable tmi_role cookie.
async function canUseAdmin(req: NextRequest): Promise<boolean> {
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? '').toUpperCase();
  return role === 'ADMIN' || role === 'STAFF' || role === 'SUPERADMIN' || role === 'OWNER';
}

export async function POST(req: NextRequest) {
  if (!(await canUseAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { issue?: string; operator?: string; autoApply?: boolean };
  try {
    body = (await req.json()) as { issue?: string; operator?: string; autoApply?: boolean };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const issue = (body.issue ?? '').trim();
  const operator = (body.operator ?? 'admin').trim();
  const autoApply = Boolean(body.autoApply);

  if (!issue) {
    return NextResponse.json({ error: 'Issue is required' }, { status: 400 });
  }

  const ticket: FixTicket = {
    id: ticketId(),
    issue,
    operator,
    autoApply,
    status: autoApply ? 'auto-fixed' : 'queued',
    createdAt: Date.now(),
  };

  tickets.unshift(ticket);
  if (tickets.length > 200) tickets.length = 200;

  emitAdminLiveEvent({
    type: autoApply ? 'engagement' : 'alert',
    message: `[${new Date().toLocaleTimeString()}] ${autoApply ? '🛠️ Auto-fix' : '📝 Fix suggestion'}: ${issue} (${operator})`,
    meta: {
      ticketId: ticket.id,
      operator,
      autoApply,
      status: ticket.status,
    },
  });

  return NextResponse.json({
    ok: true,
    ticketId: ticket.id,
    status: ticket.status,
    createdAt: ticket.createdAt,
  });
}

export async function GET(req: NextRequest) {
  if (!(await canUseAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limitParam = Number(new URL(req.url).searchParams.get('limit') ?? '20');
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(100, limitParam)) : 20;

  return NextResponse.json({
    ok: true,
    tickets: tickets.slice(0, limit),
  });
}
