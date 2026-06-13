export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      challengerId?: string;
      targetId?: string;
      format?: string;
      genre?: string;
      message?: string;
      wagerXp?: number;
    };

    const { challengerId, targetId, format, genre, message, wagerXp } = body;

    if (!challengerId || !targetId) {
      return NextResponse.json({ ok: false, error: 'challengerId and targetId required' }, { status: 400 });
    }

    // Challenge is queued — actual Battle DB record is created on acceptance
    const challengeId = `chal_${challengerId}_${targetId}_${Date.now()}`;

    return NextResponse.json({
      ok: true,
      challengeId,
      status: 'pending_acceptance',
      details: { format: format ?? 'freestyle', genre: genre ?? 'Hip-Hop', message: message ?? '', wagerXp: wagerXp ?? 50 },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 });
  }
}
