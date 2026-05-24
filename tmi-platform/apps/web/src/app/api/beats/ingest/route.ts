export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { submitBeat, getTopBeats, type BeatDestination } from '@/lib/beats/LiveBeatLocker';

const VALID_DESTINATIONS: BeatDestination[] = ['dance-party', 'cypher', 'battles', 'games', 'any'];
const VALID_GENRES = ['Trap', 'Hip-Hop', 'R&B', 'EDM', 'Dance', 'Afrobeat', 'Latin', 'Rock', 'Pop', 'House', 'Drill', 'Reggaeton', 'Other'];

/**
 * POST /api/beats/ingest
 * Body: { title, genre, bpm, destination, energyScore? }
 * Auth: reads creatorId from tmi_session_id cookie (falls back to 'guest')
 */
export async function POST(req: NextRequest) {
  const creatorId = req.cookies.get('tmi_session_id')?.value?.substring(0, 12) ?? 'guest';

  let body: {
    title?: string;
    genre?: string;
    bpm?: number;
    destination?: string;
    energyScore?: number;
  } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const title       = (body.title ?? '').trim();
  const genre       = VALID_GENRES.includes(body.genre ?? '') ? body.genre! : 'Other';
  const bpm         = Math.min(Math.max(Math.floor(body.bpm ?? 120), 60), 220);
  const destination = VALID_DESTINATIONS.includes(body.destination as BeatDestination)
    ? (body.destination as BeatDestination)
    : 'any';
  const energyScore = Math.min(Math.max(Math.floor(body.energyScore ?? 50), 0), 100);

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const beat = submitBeat({ creatorId, title, genre, bpm, energyScore, destination });
  return NextResponse.json({ ok: true, beat }, { status: 201 });
}

/**
 * GET /api/beats/ingest?destination=dance-party&limit=10
 * Returns top queued beats for a given destination.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dest = (url.searchParams.get('destination') ?? 'dance-party') as BeatDestination;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '10', 10), 50);
  const beats = getTopBeats(VALID_DESTINATIONS.includes(dest) ? dest : 'dance-party', limit);
  return NextResponse.json({ beats });
}
