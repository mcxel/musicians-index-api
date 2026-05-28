export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getHeartbeatStats } from '@/lib/engines/runtime/GlobalEventSyncHeartbeat';
import { getPresenceCount } from '@/lib/rooms/RoomSessionBridge';
import { getAdminStats } from '@/lib/admin/AdminStatsEngine';

type CheckStatus = 'ok' | 'warn' | 'fail';

interface Check {
  name: string;
  status: CheckStatus;
  value?: string | number | boolean;
  note?: string;
}

function envCheck(key: string, label: string, required = true): Check {
  const val = process.env[key];
  if (!val || val.includes('your_') || val.includes('your-') || val.includes('_here')) {
    return { name: label, status: required ? 'fail' : 'warn', value: false, note: `${key} not set` };
  }
  const masked = val.length > 8 ? val.slice(0, 4) + '…' + val.slice(-4) : '****';
  return { name: label, status: 'ok', value: masked };
}

function boolCheck(name: string, val: boolean, note?: string): Check {
  return { name, status: val ? 'ok' : 'warn', value: val, note };
}

export async function GET(req: NextRequest) {
  // Admin-only: require tmi_role cookie or secret header
  const role = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();
  const secret = req.headers.get('x-runtime-secret');
  const isAdmin = role === 'ADMIN' || role === 'STAFF' || secret === process.env.RUNTIME_STATUS_SECRET;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const checks: Check[] = [];

  // ── Stripe ──────────────────────────────────────────────────────────────────
  checks.push(envCheck('STRIPE_SECRET_KEY',              'Stripe Secret Key'));
  checks.push(envCheck('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Stripe Publishable Key'));
  checks.push(envCheck('STRIPE_WEBHOOK_SECRET',          'Stripe Webhook Secret'));

  // ── Database ─────────────────────────────────────────────────────────────────
  const hasDb = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');
  checks.push({ name: 'Database URL', status: hasDb ? 'ok' : 'warn', value: hasDb, note: hasDb ? 'Production DB set' : 'Using in-memory (soft-launch mode)' });

  // ── Email ────────────────────────────────────────────────────────────────────
  checks.push(envCheck('RESEND_API_KEY', 'Resend (Email Primary)', false));
  checks.push(envCheck('SENDGRID_API_KEY', 'SendGrid (Email Fallback)', false));

  // ── Auth ─────────────────────────────────────────────────────────────────────
  checks.push(envCheck('NEXTAUTH_SECRET', 'NextAuth Secret'));
  checks.push(envCheck('GOOGLE_CLIENT_ID', 'Google OAuth Client ID', false));
  checks.push(envCheck('GOOGLE_CLIENT_SECRET', 'Google OAuth Secret', false));

  // ── Storage ──────────────────────────────────────────────────────────────────
  checks.push(envCheck('BLOB_READ_WRITE_TOKEN', 'Vercel Blob Storage', false));

  // ── AdSense ──────────────────────────────────────────────────────────────────
  const adSlots = [
    'NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_BANNER',
    'NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE',
    'NEXT_PUBLIC_ADSENSE_SLOT_LIVE_LOBBY_BANNER',
  ];
  const adSlotsSet = adSlots.filter((k) => process.env[k] && !process.env[k]!.includes('your')).length;
  checks.push({ name: 'AdSense Slots', status: adSlotsSet >= 2 ? 'ok' : 'warn', value: `${adSlotsSet}/${adSlots.length} configured`, note: adSlotsSet < 2 ? 'Set NEXT_PUBLIC_ADSENSE_SLOT_* in Vercel' : undefined });

  // ── AI / Voice ───────────────────────────────────────────────────────────────
  checks.push(envCheck('ANTHROPIC_API_KEY', 'Anthropic API (Voice Director)', false));

  // ── Heartbeat ────────────────────────────────────────────────────────────────
  try {
    const hb = getHeartbeatStats();
    checks.push(boolCheck('Heartbeat Engine', (hb as { isRunning?: boolean }).isRunning !== false, 'Runtime event sync'));
  } catch {
    checks.push({ name: 'Heartbeat Engine', status: 'warn', note: 'Could not read heartbeat stats' });
  }

  // ── Live presence ────────────────────────────────────────────────────────────
  try {
    const presenceCount = getPresenceCount();
    checks.push({ name: 'Live Presence Registry', status: 'ok', value: `${presenceCount} sessions`, note: 'In-memory (expected)' });
  } catch {
    checks.push({ name: 'Live Presence Registry', status: 'warn', note: 'RoomSessionBridge unavailable' });
  }

  // ── Platform stats ───────────────────────────────────────────────────────────
  try {
    const stats = await getAdminStats();
    checks.push({ name: 'Admin Stats Engine', status: 'ok', value: `${stats.users.total} users, ${stats.rooms.active} active rooms` });
  } catch {
    checks.push({ name: 'Admin Stats Engine', status: 'warn', note: 'Could not fetch stats' });
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const okCount   = checks.filter((c) => c.status === 'ok').length;

  const overall: CheckStatus = failCount > 0 ? 'fail' : warnCount > 3 ? 'warn' : 'ok';

  return NextResponse.json({
    overall,
    summary: { ok: okCount, warn: warnCount, fail: failCount },
    checks,
    timestamp: new Date().toISOString(),
    mode: hasDb ? 'production' : 'soft-launch',
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
