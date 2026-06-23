export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_TYPES = [
  'RAPPER', 'SINGER', 'DJ', 'PRODUCER', 'GUITARIST', 'DRUMMER',
  'COMEDIAN', 'DANCER', 'ACTOR', 'MAGICIAN', 'SPOKEN_WORD',
  'BAND', 'ORCHESTRA', 'CHOIR', 'OTHER',
] as const;

type PerformerType = typeof VALID_TYPES[number];

/**
 * POST /api/profile/performer-types
 * Sets the performer types for the authenticated user.
 * Replaces all existing types with the submitted set.
 */
export async function POST(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  let body: { types?: string[] } = {};
  try { body = await req.json() as typeof body; } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const submittedTypes = (body.types ?? [])
    .map((t) => t.toUpperCase())
    .filter((t) => (VALID_TYPES as readonly string[]).includes(t)) as PerformerType[];

  if (submittedTypes.length === 0) {
    return NextResponse.json({ ok: false, error: 'Provide at least one valid performer type.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    // Replace all existing types — delete then create in a transaction
    await prisma.$transaction([
      prisma.userPerformerType.deleteMany({ where: { userId: user.id } }),
      prisma.userPerformerType.createMany({
        data: submittedTypes.map((type) => ({ userId: user.id, type })),
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({ ok: true, types: submittedTypes });
  } catch (err) {
    console.error('[profile/performer-types] DB error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to save performer types.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, performerTypes: { select: { type: true } } },
    });
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      ok: true,
      types: user.performerTypes.map((pt) => pt.type),
      validTypes: VALID_TYPES,
    });
  } catch (err) {
    console.error('[profile/performer-types] GET error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load performer types.' }, { status: 500 });
  }
}
