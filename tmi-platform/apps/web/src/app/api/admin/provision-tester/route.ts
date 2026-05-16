export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * POST /api/admin/provision-tester
 * Provisions a named tester account with Diamond entitlements.
 * Admin-only. Calls the provision chain stub for the specified tester.
 *
 * Body: { email: string, name: string, role: string, accountType: string }
 */

const TESTER_ROSTER = [
  {
    name:        'Marcel Dickens',
    email:       'berntmusic33@gmail.com',
    role:        'ADMIN',
    accountType: 'ADMIN',
    tier:        'diamond',
    username:    'marcel',
  },
  {
    name:        'Jay Paul Sanchez',
    email:       'bjmtherapper1@gmail.com',
    role:        'ARTIST',
    accountType: 'ARTIST',
    tier:        'diamond',
    username:    'jaypaul',
  },
  {
    name:        'Antoine King',
    email:       'Antonieking122@gmail.com',
    role:        'ARTIST',
    accountType: 'ARTIST',
    tier:        'diamond',
    username:    'antoineking',
  },
  {
    name:        'Justin King',
    email:       'rjking@icloud.com',
    role:        'ARTIST',
    accountType: 'ARTIST',
    tier:        'diamond',
    username:    'justinking',
  },
  {
    name:        'Terrence Anthony Green',
    email:       'Dontaige@yahoo.com',
    role:        'ARTIST',
    accountType: 'ARTIST',
    tier:        'diamond',
    username:    'terrence',
  },
  {
    name:        'Terry',
    email:       'Terry2890@gmail.com',
    role:        'ARTIST',
    accountType: 'ARTIST',
    tier:        'diamond',
    username:    'terry',
  },
  {
    name:        'Chop',
    email:       'AustinNunsuch@gmail.com',
    role:        'ARTIST',
    accountType: 'ARTIST',
    tier:        'diamond',
    username:    'chop',
  },
  {
    name:        'Kreach',
    email:       'kreacher.616@gmail.com',
    role:        'ARTIST',
    accountType: 'ARTIST',
    tier:        'diamond',
    username:    'kreach',
  },
  {
    name:        'Christina Fassect',
    email:       'leeanncoats.79@gmail.com',
    role:        'FAN',
    accountType: 'FAN',
    tier:        'diamond',
    username:    'christina',
  },
];

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 });
  }

  return NextResponse.json({
    testers: TESTER_ROSTER.map((t) => ({
      name:        t.name,
      email:       t.email,
      role:        t.role,
      tier:        t.tier,
      username:    t.username,
      accountType: t.accountType,
    })),
    runScript: 'cd apps/api && npx tsx src/seed-testers.ts',
    note:      'Run the seed script to provision DB records. This endpoint tracks roster state only.',
  });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 });
  }

  let body: { email?: string; accountType?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const { email, accountType } = body;
  const tester = TESTER_ROSTER.find((t) => t.email === email) ?? null;

  if (!tester) {
    return NextResponse.json({ error: 'Unknown tester email', roster: TESTER_ROSTER.map(t => t.email) }, { status: 400 });
  }

  // Call the provision stub with a placeholder userId
  // In production this hits NestJS; in dev it returns the stub chain
  const provisionRes = await fetch(new URL('/api/auth/provision', req.url), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      userId:      `tester_${tester.username}`,
      accountType: accountType ?? tester.accountType,
    }),
  });

  const provision = await provisionRes.json().catch(() => ({ error: 'provision call failed' }));

  return NextResponse.json({
    ok:       true,
    tester:   { name: tester.name, email: tester.email, role: tester.role, tier: tester.tier },
    provision,
    seedNote: 'For full DB provisioning, run: cd apps/api && npx tsx src/seed-testers.ts',
  }, { status: 201 });
}
