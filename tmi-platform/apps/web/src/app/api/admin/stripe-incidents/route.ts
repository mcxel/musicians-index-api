export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import {
  getStripeIncidentStatus,
  resumeStripePayoutQueue,
} from '@/lib/stripe/stripe-incident-engine';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  return NextResponse.json({
    ok: true,
    status: getStripeIncidentStatus(),
  });
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    reason?: string;
  };

  if (body.action !== 'resume_payout_queue') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const reason = (body.reason ?? '').trim();
  if (!reason) {
    return NextResponse.json({ error: 'reason is required' }, { status: 400 });
  }

  const actorEmail = req.cookies.get('tmi_user_email')?.value ?? 'admin@unknown';
  const actorRole = req.cookies.get('tmi_role')?.value ?? 'ADMIN';
  const actorName = actorEmail.split('@')[0] ?? 'admin';

  const result = resumeStripePayoutQueue({
    actorEmail,
    actorRole,
    actorName,
    reason,
  });

  if (!result.resumed) {
    return NextResponse.json({
      ok: false,
      message: 'Payout queue was not paused',
      status: getStripeIncidentStatus(),
    });
  }

  return NextResponse.json({
    ok: true,
    message: 'Payout queue resumed',
    audit: result.audit,
    status: getStripeIncidentStatus(),
  });
}
