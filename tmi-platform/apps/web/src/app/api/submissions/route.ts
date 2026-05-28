/**
 * POST /api/submissions — create a new track/video/beat/cypher submission
 * GET  /api/submissions — list submissions for the current user (query: status, type, limit)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, listSubmissions, SubmissionType } from '@/lib/submissions/SubmissionEngine';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';

const RATE_LIMIT_KEY = 'submissions';

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(`${ip}:${RATE_LIMIT_KEY}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { submitterId, title, type, url, genre, description, bpm, tags } = body as {
    submitterId?: string;
    title?: string;
    type?: string;
    url?: string;
    genre?: string;
    description?: string;
    bpm?: number;
    tags?: string[];
  };

  if (!submitterId || typeof submitterId !== 'string') {
    return NextResponse.json({ error: 'submitterId is required' }, { status: 400 });
  }
  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const VALID_TYPES: SubmissionType[] = ['track', 'video', 'beat', 'cypher', 'battle', 'comedy', 'dance', 'show'];
  const safeType: SubmissionType = VALID_TYPES.includes(type as SubmissionType)
    ? (type as SubmissionType)
    : 'track';

  const result = createSubmission({
    submitterId,
    title,
    type: safeType,
    url,
    genre: typeof genre === 'string' ? genre : undefined,
    description: typeof description === 'string' ? description : undefined,
    bpm: typeof bpm === 'number' ? bpm : undefined,
    tags: Array.isArray(tags) ? tags.filter((t) => typeof t === 'string') : undefined,
  });

  if (!result.ok) {
    const statusCode = result.error === 'quota_exceeded' ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status: statusCode });
  }

  const submission = result.submission!;
  emitAdminLiveEvent({
    type: 'submission_received',
    message: `[${new Date().toLocaleTimeString()}] 🎤 Submission received: ${submission.title} (${submission.type}) by ${submission.submitterId}`,
    meta: {
      submissionId: submission.id,
      submitterId: submission.submitterId,
      submissionType: submission.type,
      status: submission.status,
    },
  });

  return NextResponse.json(
    {
      submissionId: submission.id,
      status: submission.status,
      shareUrl: result.shareUrl,
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(`${ip}:${RATE_LIMIT_KEY}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const publicFeed = searchParams.get('public') === '1';
  const submitterId = searchParams.get('submitterId') ?? '';
  const status = (searchParams.get('status') ?? undefined) as import('@/lib/submissions/SubmissionEngine').SubmissionStatus | undefined;
  const type   = (searchParams.get('type')   ?? undefined) as import('@/lib/submissions/SubmissionEngine').SubmissionType   | undefined;
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50);

  if (!submitterId && !publicFeed) {
    return NextResponse.json({ error: 'submitterId is required' }, { status: 400 });
  }

  const submissions = publicFeed
    ? listSubmissions({ status, type, limit })
    : listSubmissions({ submitterId, status, type, limit });
  return NextResponse.json({ submissions });
}
