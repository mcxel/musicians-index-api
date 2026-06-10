import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const role = (req.cookies.get('tmi_role')?.value ?? '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'STAFF') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json([]);
}
