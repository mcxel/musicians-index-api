/**
 * POST /api/admin/email-test
 * Sends a real test email and returns the full Resend response.
 * Admin-only. Use this to verify domain verification and API key health.
 *
 * Body: { to: string; type?: EmailType }
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import { sendEmail } from '@/lib/email/TMIEmailSystem';

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  let body: { to?: string; type?: string } = {};
  try { body = await req.json() as typeof body; } catch { /* body optional */ }

  const to = (body.to ?? '').trim().toLowerCase();
  if (!to || !to.includes('@')) {
    return NextResponse.json({ error: 'Provide a valid "to" email address' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: 'RESEND_API_KEY is not set in environment variables',
      hint: 'Add RESEND_API_KEY to Vercel → Project Settings → Environment Variables, then redeploy.',
    }, { status: 500 });
  }

  const result = await sendEmail({
    to,
    type: 'welcome_fan',
    data: { name: 'Test User', slug: 'test-user' },
  });

  return NextResponse.json({
    ok: result.success,
    to,
    messageId: result.messageId,
    error: result.error,
    resendApiKeyPrefix: apiKey.slice(0, 7) + '…',
    emailFrom: process.env.EMAIL_FROM ?? 'support@themusiciansindex.com',
    hint: !result.success
      ? 'If error mentions "domain not verified", go to resend.com/domains and verify themusiciansindex.com, then add the DNS records to your domain registrar.'
      : null,
  });
}
