import { NextRequest, NextResponse } from 'next/server';
import {
  buildPlaylist,
  rotatePlaylist,
  distributeNewRelease,
  auditCoverage,
  validatePlaylist,
  registerTrack,
  getAllPlaylists,
  getPlaylist,
  registerPlaylist,
  BERNOUTGLOBAL_CATALOG,
  type PlaylistType,
} from '@/lib/playlists/PlaylistEngine';
import { recordMediaObservabilityEvent } from '@/lib/media/media-observability-store';

// ── Seed default playlists on cold start ──────────────────────────────────────

const SEEDED = { done: false };
function seedIfNeeded() {
  if (SEEDED.done) return;
  SEEDED.done = true;

  const defaults: Array<{ id: string; name: string; type: PlaylistType; genre?: string }> = [
    { id: 'stream-and-win',  name: 'Stream & Win Radio',         type: 'stream-and-win' },
    { id: 'usa-top',         name: 'USA Top Charts',             type: 'usa-top' },
    { id: 'hip-hop',         name: 'Hip-Hop Vault',              type: 'genre', genre: 'hip-hop' },
    { id: 'instrumental',    name: 'Beats & Instrumentals',      type: 'genre', genre: 'instrumental' },
    { id: 'new-releases',    name: 'New Releases',               type: 'new-releases' },
    { id: 'discovery',       name: 'Discovery Mix',              type: 'discovery' },
  ];

  for (const def of defaults) {
    if (!getPlaylist(def.id)) {
      const playlist = buildPlaylist(def.id, def.name, def.type, { genre: def.genre });
      registerPlaylist(playlist);
    }
  }
}

// GET /api/playlists
// GET /api/playlists?id=<playlistId>
// GET /api/playlists?action=coverage
// GET /api/playlists?action=validate&id=<playlistId>
export async function GET(req: NextRequest) {
  seedIfNeeded();

  const { searchParams } = req.nextUrl;
  const action = searchParams.get('action');
  const id     = searchParams.get('id');

  if (action === 'coverage') {
    const { covered, uncovered } = auditCoverage();
    return NextResponse.json({ covered: covered.length, uncovered: uncovered.length, uncoveredTracks: uncovered.map(t => t.id) });
  }

  if (action === 'validate' && id) {
    const playlist = getPlaylist(id);
    if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    const result = validatePlaylist(playlist.entries);
    return NextResponse.json(result);
  }

  if (id) {
    const playlist = getPlaylist(id);
    if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json(playlist);
  }

  return NextResponse.json({ playlists: getAllPlaylists().map(p => ({ id: p.id, name: p.name, type: p.type, trackCount: p.entries.length, lastRotatedAt: p.lastRotatedAt })) });
}

// POST /api/playlists
// body: { action: 'rotate', id: string }
//       { action: 'distribute', trackId: string }
//       { action: 'register-track', track: Track }
//       { action: 'register-playlist', id, name, type, genre? }
export async function POST(req: NextRequest) {
  seedIfNeeded();

  const adminKey = req.headers.get('x-admin-key') ?? req.cookies.get('tmi_session')?.value;
  if (!adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as Record<string, unknown>;
  const action = body.action as string;

  if (action === 'rotate') {
    const id = body.id as string;
    const result = rotatePlaylist(id);
    if (!result) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json({ rotated: true, trackCount: result.entries.length, lastRotatedAt: result.lastRotatedAt });
  }

  if (action === 'distribute') {
    const trackId = body.trackId as string;
    const result = distributeNewRelease(trackId);
    return NextResponse.json(result);
  }

  if (action === 'register-track') {
    const track = body.track as Parameters<typeof registerTrack>[0];
    if (!track?.id || !track?.catalog) {
      recordMediaObservabilityEvent('playlist_import_failed', { reason: 'missing_track_fields' });
      return NextResponse.json({ error: 'Missing required track fields: id, catalog' }, { status: 400 });
    }
    registerTrack(track);
    return NextResponse.json({ registered: true, trackId: track.id });
  }

  if (action === 'register-playlist') {
    const { id, name, type, genre } = body as { id: string; name: string; type: PlaylistType; genre?: string };
    if (!id || !name || !type) {
      recordMediaObservabilityEvent('playlist_import_failed', { reason: 'missing_playlist_fields' });
      return NextResponse.json({ error: 'Missing required fields: id, name, type' }, { status: 400 });
    }
    const playlist = buildPlaylist(id, name, type, { genre });
    registerPlaylist(playlist);
    return NextResponse.json({ created: true, playlistId: id, trackCount: playlist.entries.length });
  }

  recordMediaObservabilityEvent('playlist_import_failed', { reason: 'unknown_action', action });
  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
