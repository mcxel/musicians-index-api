import { NextRequest, NextResponse } from 'next/server';
import { createDailyRoom, createMeetingToken } from '@/lib/video/DailyVideoEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userName, inviteId } = body as { userName?: string; inviteId?: string };

    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Video rooms not configured. Set DAILY_API_KEY in Vercel dashboard.' },
        { status: 503 },
      );
    }

    const room = await createDailyRoom({ maxParticipants: 20 });
    const tokenRes = await createMeetingToken(room.name, {
      userName: userName ?? 'TMI User',
      isOwner: true,
    });

    return NextResponse.json({
      roomId: room.name,
      roomUrl: room.url,
      token: tokenRes.token,
      inviteLink: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://themusiciansindex.com'}/video/rooms/${room.name}`,
    });
  } catch (err: any) {
    console.error('[video/rooms] POST error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
