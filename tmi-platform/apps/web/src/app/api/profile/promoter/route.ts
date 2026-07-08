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

  // P0: Canonical Live Session Chain - Step 1
  // In a real implementation, this would call the GlobalLiveSessionRegistry
  // to create a session, register it with the discovery engine, and return a real room ID.
  console.log(`[API] User ${session.user.id} is starting a live session titled: "${title}"`);

  return NextResponse.json({ ok: true, roomId: `live_${Date.now()}` });
}