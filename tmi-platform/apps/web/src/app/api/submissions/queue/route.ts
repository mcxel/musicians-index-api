export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { listSubmissions, getSubmissionCount } from '@/lib/submissions/SubmissionEngine';

export async function GET() {
  const submissions = listSubmissions({ limit: 20 });
  const counts = getSubmissionCount();
  const queue = submissions.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.submitterId,
    type: s.type,
    status: s.status,
    submittedAt: s.createdAt,
  }));
  return NextResponse.json({ ok: true, queue, pending: counts.pending });
}
