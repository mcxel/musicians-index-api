import { NextRequest, NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // SECURITY (2026-09-23, Batch 2): verified DB role via getTmiAuth() —
  // the previous tmi_role cookie check was forgeable by any caller.
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'STAFF') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json([]);
}
