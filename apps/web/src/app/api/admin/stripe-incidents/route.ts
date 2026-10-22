export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, resolveAdminActor } from '@/app/api/admin/_utils/require-admin';
import {
  getStripeIncidentStatus,
  resumeStripePayoutQueue,
} from '@/lib/stripe/stripe-incident-engine';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  return NextResponse.json({
    ok: true,
    status: getStripeIncidentStatus(),
  });
}

export async function POST(req: NextRequest) {
  // SECURITY (2026-09-23, Batch 2): the gate itself now uses resolveAdminActor
  // (verified DB identity/role) instead of trusting tmi_user_email/tmi_role
  // cookies for audit attribution — a forged cookie could previously label a
  // payout-queue-resume action as performed by an arbitrary actor/email.
  const adminAuth = await resolveAdminActor(req);
  if (!adminAuth.ok) return adminAuth.response;

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

  const actorEmail = adminAuth.actor.email || 'admin@unknown';
  const actorRole = adminAuth.actor.role;
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
