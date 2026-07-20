export const dynamic = 'force-dynamic';
/**
 * POST /api/admin/diamond-resend
 * Admin-only endpoint to resend a Diamond VIP invite to a corrected email address
 * and register that email as an accepted alias for the token (so the user can
 * register with either the original or the new address).
 *
 * Body: { token: string; email: string }
 * Headers: requires tmi_role=admin or tmi_role=staff cookie
 *
 * GET /api/admin/diamond-resend
 * Returns the current status of all Diamond invites (redeemed vs pending,
 * which emails may have bounced).
 */

import { NextRequest, NextResponse } from 'next/server';
import { DiamondInviteEngine } from '@/lib/auth/DiamondInviteEngine';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';
import { waitUntil } from '@vercel/functions';

// Email domains known to be non-deliverable in this invite list
const PLACEHOLDER_DOMAINS = new Set(['example.com', 'themusiciansindex.com']);

function isPotentiallyUndeliverable(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return PLACEHOLDER_DOMAINS.has(domain);
}

function requireAdmin(req: NextRequest): boolean {
  const role = req.cookies.get('tmi_role')?.value?.toUpperCase();
  return role === 'ADMIN' || role === 'STAFF';
}

/** GET: status report of all Diamond invites */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const all = DiamondInviteEngine.getAllInvites?.() ?? [];
  const report = all.map((inv) => ({
    token: inv.token,
    email: inv.email,
    status: inv.status,
    role: inv.assignedRole,
    potentiallyUndeliverable: isPotentiallyUndeliverable(inv.email),
    aliases: inv.emailAliases ?? [],
  }));

  const actionNeeded = report.filter((r) => r.potentiallyUndeliverable && r.status === 'active');

  return NextResponse.json({
    total: report.length,
    redeemed: report.filter((r) => r.status === 'redeemed').length,
    active: report.filter((r) => r.status === 'active').length,
    actionNeeded: actionNeeded.length,
    actionNeededTokens: actionNeeded.map((r) => ({ token: r.token, currentEmail: r.email })),
    invites: report,
  });
}

/** POST: resend invite to a corrected email address */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  let body: { token?: string; email?: string } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token, email } = body;

  if (!token || !email) {
    return NextResponse.json({ error: 'token and email are required' }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const invite = DiamondInviteEngine.getInvite(token);
  if (!invite) {
    return NextResponse.json({ error: `Token ${token} not found` }, { status: 404 });
  }

  if (invite.status === 'redeemed') {
    return NextResponse.json({
      ok: false,
      warning: `Token ${token} was already redeemed — resending for reference only`,
    });
  }

  // Register the new email as an alias so the user can register with it
  DiamondInviteEngine.addEmailAlias(token, email);

  const sendInvite = async () => {
    const result = await sendEmail({
      to: email,
      type: 'diamond_invite_pending',
      data: {
        name: invite.email.split('@')[0], // best guess at name from original email
        token,
        role: invite.assignedRole,
        signupUrl: `https://themusiciansindex.com/signup?token=${token}`,
      },
    });

    emitAdminLiveEvent({
      type: result.success ? 'engagement' : 'alert',
      message: `[diamond-resend] ${result.success ? '✅' : '❌'} Resent ${token} → ${email} (original: ${invite.email})`,
      meta: { token, toEmail: email, originalEmail: invite.email, success: result.success, error: result.error ?? null },
    });

    return result;
  };

  waitUntil(sendInvite());

  return NextResponse.json({
    ok: true,
    message: `Invite email queued for ${email}`,
    token,
    originalEmail: invite.email,
    newEmail: email,
    note: 'The new email has been registered as an alias — the user can now register with it.',
  });
}
