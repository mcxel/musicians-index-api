export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type?: string;
      genre?: string;
      entryModel?: string;
      wagerXp?: number;
      entryFeeCents?: number;
      scheduledFor?: string | null;
    };

    const userId = req.cookies.get('tmi_session_id')?.value ?? 'anonymous';
    const challengeId = `chal_${userId}_${Date.now()}`;
    const roomSlug = `challenge-${Date.now()}`;

    return NextResponse.json({
      ok: true,
      challengeId,
      roomSlug,
      status: 'created',
      details: {
        type: body.type ?? 'quick',
        genre: body.genre ?? 'Hip-Hop',
        entryModel: body.entryModel ?? 'free',
        wagerXp: body.wagerXp ?? 0,
        entryFeeCents: body.entryFeeCents ?? 0,
        scheduledFor: body.scheduledFor ?? null,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 });
  }
}
