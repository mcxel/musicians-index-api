import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get('tmi_session_id');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.artistId || !body.category) {
    return NextResponse.json({ error: 'Missing artistId or category' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, entryId: `entry_${Date.now()}` });
}
