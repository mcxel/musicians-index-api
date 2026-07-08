export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

interface VoteBody {
  performerId: string;
}

// In-memory rate limiter: IP → last vote timestamp
// Resets on cold start — replace with Redis for production persistence
const voteRateMap = new Map<string, number>();
const VOTE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory vote totals: performerId → total votes
const voteTotals = new Map<string, number>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limit: 1 vote per IP per hour
  const now     = Date.now();
  const lastVote = voteRateMap.get(ip);

  if (lastVote && now - lastVote < VOTE_WINDOW_MS) {
    const waitMinutes = Math.ceil((VOTE_WINDOW_MS - (now - lastVote)) / 60_000);
    return NextResponse.json(
      {
        ok:         false,
        message:    `You already voted. Try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`,
        totalVotes: 0,
      },
      { status: 429 },
    );
  }

  let body: Partial<VoteBody>;
  try {
    body = await req.json() as Partial<VoteBody>;
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON', totalVotes: 0 }, { status: 400 });
  }

  const { performerId } = body;

  if (!performerId || typeof performerId !== 'string' || performerId.trim().length < 1) {
    return NextResponse.json({ ok: false, message: 'performerId is required', totalVotes: 0 }, { status: 400 });
  }

  const safeId = performerId.trim().slice(0, 100);

  // Record the vote
  voteRateMap.set(ip, now);
  const prev  = voteTotals.get(safeId) ?? 0;
  const total = prev + 1;
  voteTotals.set(safeId, total);

  console.log(`[vote] performerId=${safeId} ip=${ip} total=${total}`);

  // TODO: persist to DB — e.g.
  // await prisma.vote.create({ data: { performerId: safeId, ip, votedAt: new Date() } });

  return NextResponse.json({
    ok:         true,
    message:    'Vote recorded!',
    totalVotes: total,
  });
}

// GET — returns current vote total for a performer
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const performerId = searchParams.get('performerId')?.trim().slice(0, 100);

  if (!performerId) {
    return NextResponse.json({ ok: false, message: 'performerId query param required', totalVotes: 0 }, { status: 400 });
  }

  const total = voteTotals.get(performerId) ?? 0;
  return NextResponse.json({ ok: true, totalVotes: total });
}
