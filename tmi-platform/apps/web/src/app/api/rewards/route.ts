export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  return NextResponse.json({
    balance: 0,
    points: sessionId ? 1000 : 0,
    level: 1,
  });
}
