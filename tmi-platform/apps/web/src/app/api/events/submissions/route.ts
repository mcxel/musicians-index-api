/**
 * GET  /api/events/submissions?category=MONDAY_NIGHT_STAGE — real, cross-user
 *      competition/show submissions (approved-in-rotation only), newest first.
 * POST /api/events/submissions — submit a real entry for a competition/show.
 *
 * Replaces lib/events/EventSubmissionEngine.ts's localStorage ledger, which
 * was per-browser and could never produce a lineup other users/devices
 * could see. Category/status naming matches that file so callers don't need
 * to change their vocabulary, just where the data lives.
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import { getSubmissionWindow } from '@/lib/shows/MondayShowtime';

const VALID_CATEGORIES = new Set([
  'PRODUCER_BEAT_BATTLE',
  'WORLD_DANCE_PARTY',
  'MONDAY_NIGHT_STAGE',
  'CYPHER_ROTATION',
]);

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  if (!category || !VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: 'Invalid or missing category' }, { status: 400 });
  }
  const status = req.nextUrl.searchParams.get('status') ?? 'APPROVED_IN_ROTATION';

  const submissions = await prisma.eventSubmission.findMany({
    where: { category, status },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true, userId: true, category: true, title: true, bpm: true, genre: true,
      audioUrl: true, videoUrl: true, status: true, queuedForDate: true, createdAt: true,
      user: { select: { name: true, displayName: true } },
    },
  });

  const window = category === 'MONDAY_NIGHT_STAGE' ? getSubmissionWindow() : null;

  return NextResponse.json({
    ok: true,
    submissions,
    ...(window && {
      submissionWindow: { showtime: window.showtime.toISOString(), opensAt: window.opensAt.toISOString(), isOpen: window.isOpen },
    }),
  });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(`${ip}:event-submissions`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) {
    return NextResponse.json({ error: 'Sign in required to submit an entry' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Account not found' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const category = String(body.category ?? '');
  const title = String(body.title ?? '').trim();
  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  const rightsAttested = Boolean(body.rightsAttested);
  if (!rightsAttested) {
    return NextResponse.json({ error: 'Rights attestation is required to submit an entry' }, { status: 400 });
  }

  // Monday Night Stage submissions only open a 2-hour window before showtime
  // — the show is weekly, not always-on, so entries can't queue up any time.
  if (category === 'MONDAY_NIGHT_STAGE') {
    const window = getSubmissionWindow();
    if (!window.isOpen) {
      return NextResponse.json({
        error: `Submissions for Monday Night Stage open 2 hours before showtime. Next window opens ${window.opensAt.toISOString()}.`,
        opensAt: window.opensAt.toISOString(),
        showtime: window.showtime.toISOString(),
      }, { status: 403 });
    }
  }

  const submission = await prisma.eventSubmission.create({
    data: {
      userId: user.id,
      category,
      title,
      bpm: typeof body.bpm === 'number' ? body.bpm : undefined,
      genre: typeof body.genre === 'string' ? body.genre : undefined,
      audioUrl: typeof body.audioUrl === 'string' ? body.audioUrl : undefined,
      videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl : undefined,
      rightsAttested: true,
      sampleClearanceDeclared: Boolean(body.sampleClearanceDeclared),
      // Self-serve entries land straight in rotation for now — no human
      // review queue exists yet. Matches EventSubmissionEngine's prior
      // behavior; a real moderation step is future work, not a regression.
      status: 'APPROVED_IN_ROTATION',
      queuedForDate: new Date(),
    },
  });

  return NextResponse.json({ ok: true, submission }, { status: 201 });
}
