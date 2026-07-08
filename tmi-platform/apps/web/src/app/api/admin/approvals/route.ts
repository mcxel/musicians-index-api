export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import {
  listSubmissions,
  updateSubmissionStatus,
  getSubmissionCount,
  type SubmissionStatus,
} from '@/lib/submissions/SubmissionEngine';

// Admin submission approval queue — real SubmissionEngine data only (Rule 20).
// Actions: approve (pending → approved), reject (→ rejected),
// rotate (approved → live, i.e. enters radio rotation).

const ACTION_TO_STATUS: Record<string, SubmissionStatus> = {
  approve: 'approved',
  reject: 'rejected',
  rotate: 'live',
};

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const submissions = await listSubmissions({ limit: 50 });
  const counts = await getSubmissionCount();
  const queue = submissions.map((s) => ({
    id: s.id,
    type: s.type,
    name: s.title,
    artist: s.submitterId,
    genre: s.genre,
    url: s.url,
    submitted: new Date(s.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: s.status,
  }));
  return NextResponse.json({ ok: true, queue, counts });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { id?: string; action?: string };
  if (!body.id || !body.action) {
    return NextResponse.json({ error: 'id and action required' }, { status: 400 });
  }

  const nextStatus = ACTION_TO_STATUS[body.action];
  if (!nextStatus) {
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  }

  const updated = await updateSubmissionStatus(body.id, nextStatus);
  if (!updated) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    item: { id: updated.id, status: updated.status },
  });
}
