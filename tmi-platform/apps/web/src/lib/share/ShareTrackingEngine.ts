import { buildShareUrl, type ShareTarget } from '@/lib/share/ShareLinkEngine';

export type PlaylistShareEventType = 'share' | 'copy' | 'open' | 'click';

export interface PlaylistShareBuildInput {
  playlistId: string;
  curatorId: string;
  referrerId?: string;
  path: string;
  playlistTitle?: string;
}

export interface PlaylistShareEvent {
  event: PlaylistShareEventType;
  playlistId: string;
  curatorId: string;
  referrerId?: string;
  source?: string;
  platform?: string;
  occurredAt: number;
}

export interface PlaylistShareSnapshot {
  playlistId: string;
  shares: number;
  opens: number;
  clicks: number;
  copies: number;
  lastAt: number;
}

export interface PlaylistShareLeaderboardRow extends PlaylistShareSnapshot {
  shareToClickRate: number;
  openToShareRate: number;
}

const PROD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://themusiciansindex.com';
const eventStore = new Map<string, PlaylistShareSnapshot>();

function sanitizeId(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const cleaned = input.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned.length > 0 ? cleaned.slice(0, 64) : fallback;
}

function normalizePath(path: string): string {
  if (!path) return '/home/1';
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildPlaylistReferralUrl(input: PlaylistShareBuildInput): string {
  const playlistId = sanitizeId(input.playlistId, 'playlist');
  const curatorId = sanitizeId(input.curatorId, 'curator');
  const referrerId = sanitizeId(input.referrerId, curatorId);

  const target: ShareTarget = {
    title: input.playlistTitle || 'TMI Playlist',
    text: `${input.playlistTitle || 'This playlist'} is moving on TMI`,
    path: normalizePath(input.path),
    context: {
      source: 'playlist_share',
      medium: 'viral',
      campaign: 'phase1_lock',
      ref: referrerId,
    },
  };

  const sharedUrl = new URL(buildShareUrl(target));
  sharedUrl.searchParams.set('playlist', playlistId);
  sharedUrl.searchParams.set('curator', curatorId);
  return sharedUrl.toString();
}

export function buildPlaylistOGUrl(input: Pick<PlaylistShareBuildInput, 'playlistId' | 'curatorId'> & {
  playlistTitle?: string;
}): string {
  const playlistId = sanitizeId(input.playlistId, 'playlist');
  const curatorId = sanitizeId(input.curatorId, 'curator');
  const route = new URL('/api/og/playlist', PROD_URL);
  route.searchParams.set('playlist', playlistId);
  route.searchParams.set('curator', curatorId);
  if (input.playlistTitle) route.searchParams.set('title', input.playlistTitle.slice(0, 80));
  return route.toString();
}

export function recordPlaylistShareEvent(evt: PlaylistShareEvent): PlaylistShareSnapshot {
  const playlistId = sanitizeId(evt.playlistId, 'playlist');
  const previous = eventStore.get(playlistId) || {
    playlistId,
    shares: 0,
    opens: 0,
    clicks: 0,
    copies: 0,
    lastAt: evt.occurredAt,
  };

  const next: PlaylistShareSnapshot = { ...previous, lastAt: evt.occurredAt };
  if (evt.event === 'share') next.shares += 1;
  if (evt.event === 'open') next.opens += 1;
  if (evt.event === 'click') next.clicks += 1;
  if (evt.event === 'copy') next.copies += 1;

  eventStore.set(playlistId, next);
  return next;
}

export function getPlaylistShareSnapshot(playlistId: string): PlaylistShareSnapshot {
  const normalized = sanitizeId(playlistId, 'playlist');
  return (
    eventStore.get(normalized) || {
      playlistId: normalized,
      shares: 0,
      opens: 0,
      clicks: 0,
      copies: 0,
      lastAt: Date.now(),
    }
  );
}

export function getPlaylistShareLeaderboard(limit = 20): PlaylistShareLeaderboardRow[] {
  const rows = Array.from(eventStore.values()).map((snapshot) => {
    const shareToClickRate = snapshot.shares > 0 ? snapshot.clicks / snapshot.shares : 0;
    const openToShareRate = snapshot.opens > 0 ? snapshot.shares / snapshot.opens : 0;
    return {
      ...snapshot,
      shareToClickRate,
      openToShareRate,
    };
  });

  return rows
    .sort((a, b) => {
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      if (b.shares !== a.shares) return b.shares - a.shares;
      return b.lastAt - a.lastAt;
    })
    .slice(0, Math.max(1, Math.min(100, limit)));
}
