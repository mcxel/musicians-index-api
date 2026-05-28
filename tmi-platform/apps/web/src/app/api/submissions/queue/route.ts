export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Seed queue — replaced by SubmissionEngine in production
const SEED_QUEUE = [
  { id: 'sub-001', title: 'Late Night Vibe',     artist: '@dj_blend',    type: 'Stream & Win', status: 'processing', submittedAt: Date.now() - 120_000  },
  { id: 'sub-002', title: 'Cypher Entry 04',     artist: '@nova_cipher', type: 'Battle Arena', status: 'approved',   submittedAt: Date.now() - 900_000  },
  { id: 'sub-003', title: 'Unreleased Beat',     artist: '@ray_journey', type: 'Beat Market',  status: 'live',       submittedAt: Date.now() - 3600_000 },
  { id: 'sub-004', title: 'Gospel Bounce',       artist: '@churchboy',   type: 'Stream & Win', status: 'pending',    submittedAt: Date.now() - 1800_000 },
  { id: 'sub-005', title: 'Street Chronicles',  artist: '@lena_writes', type: 'Article',      status: 'review',     submittedAt: Date.now() - 7200_000 },
];

export async function GET() {
  return NextResponse.json({ ok: true, queue: SEED_QUEUE, pending: SEED_QUEUE.filter(s => s.status === 'pending' || s.status === 'processing').length });
}
