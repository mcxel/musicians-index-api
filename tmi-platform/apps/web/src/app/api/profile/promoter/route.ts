import { NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { title } = body;

  if (!title) {
    return NextResponse.json({ ok: false, error: 'Stream title is required' }, { status: 400 });
  }

  // TODO: call GlobalLiveSessionRegistry to create session and return a real room ID
  return NextResponse.json({ ok: true, roomId: `live_${Date.now()}` });
}