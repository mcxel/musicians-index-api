import { NextRequest, NextResponse } from 'next/server';
import {
  getDiscoveryPopulationConfig,
  updateDiscoveryPopulationConfig,
  type DiscoveryPopulationConfig,
} from '@/lib/discovery/DiscoveryPopulationConfig';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const role = req.cookies.get('tmi_role')?.value?.toUpperCase() ?? '';
  const email = req.cookies.get('tmi_email')?.value ?? '';
  const adminEmails = (process.env.ADMIN_EMAILS ?? 'berntmusic33@gmail.com,bigace@berntoutglobal.com').split(',');
  return ['ADMIN', 'SUPERADMIN', 'OWNER'].includes(role) || adminEmails.includes(email);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    config: getDiscoveryPopulationConfig(),
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Partial<DiscoveryPopulationConfig> = {};
  try {
    body = await req.json() as Partial<DiscoveryPopulationConfig>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const next = updateDiscoveryPopulationConfig(body);
  return NextResponse.json({ ok: true, config: next });
}
